import React, { useState, useRef, useEffect, useId } from 'react';
import { Truck, Zap, ChevronDown, Check, Clock } from 'lucide-react';
import type { CourierOption } from '@/types';

export const AVAILABLE_COURIERS: CourierOption[] = [
    {
        courier_name: 'jne',
        courier_service: 'REG',
        label: 'JNE',
        service_name: 'JNE Reguler',
        description: 'Estimasi 2–3 hari kerja',
        base_rate: 8000,
        instant: false,
    },
    {
        courier_name: 'jne',
        courier_service: 'YES',
        label: 'JNE',
        service_name: 'JNE YES (Yakin Esok Sampai)',
        description: 'Estimasi 1 hari kerja',
        base_rate: 18000,
        instant: false,
    },
    {
        courier_name: 'sicepat',
        courier_service: 'SIUNT',
        label: 'SiCepat',
        service_name: 'SiCepat SiUntung',
        description: 'Estimasi 2–4 hari kerja',
        base_rate: 7000,
        instant: false,
    },
    {
        courier_name: 'sicepat',
        courier_service: 'BEST',
        label: 'SiCepat',
        service_name: 'SiCepat BEST (Besok Sampai Tuntas)',
        description: 'Estimasi 1 hari kerja',
        base_rate: 15000,
        instant: false,
    },
    {
        courier_name: 'gosend',
        courier_service: 'Instant',
        label: 'GoSend',
        service_name: 'GoSend Instant',
        description: 'Estimasi 2–3 jam (khusus intra-kota)',
        base_rate: 12000,
        instant: true,
    },
];

export function calculateShippingCost(weightGram: number, baseRate: number): { cost: number; weightKg: number } {
    const effectiveWeightGram = Math.max(weightGram, 200);
    const weightKg = Math.max(1, Math.ceil(effectiveWeightGram / 1000));
    const cost = baseRate * weightKg;

    return { cost, weightKg };
}

interface CourierSelectorProps {
    weightGram: number;
    selectedCourier: string;
    selectedService: string;
    onChange: (courierName: string, serviceKey: string, cost: number) => void;
    disabled?: boolean;
}

const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
};

export default function CourierSelector({
    weightGram,
    selectedCourier,
    selectedService,
    onChange,
    disabled = false,
}: CourierSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonId = useId();

    const currentOption = AVAILABLE_COURIERS.find(
        (opt) =>
            opt.courier_name.toLowerCase() === selectedCourier.toLowerCase() &&
            opt.courier_service.toUpperCase() === selectedService.toUpperCase()
    ) || AVAILABLE_COURIERS[0];

    const { cost: currentCost, weightKg } = calculateShippingCost(
        weightGram,
        currentOption.base_rate
    );

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: CourierOption) => {
        const { cost } = calculateShippingCost(weightGram, option.base_rate);
        onChange(option.courier_name, option.courier_service, cost);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label htmlFor={buttonId} className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Pilih Kurir Pengiriman
            </label>

            {/* Trigger Button */}
            <button
                id={buttonId}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-md border-2 p-3 text-left transition-all ${
                    isOpen
                        ? 'border-[#03ac0e] bg-white shadow-[0_0_0_2px_rgba(3,172,14,0.15)]'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-400 hover:bg-white'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                            currentOption.instant
                                ? 'border-amber-200 bg-amber-50 text-amber-600'
                                : 'border-emerald-200 bg-emerald-50 text-[#03ac0e]'
                        }`}
                    >
                        {currentOption.instant ? (
                            <Zap size={18} className="animate-pulse" />
                        ) : (
                            <Truck size={18} />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                                {currentOption.service_name}
                            </span>
                            {currentOption.instant && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-800 uppercase">
                                    Instan
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>{currentOption.description}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-[11px] text-slate-600">
                                ({weightKg} kg)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-[#03ac0e]">
                        {formatRupiah(currentCost)}
                    </span>
                    <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-slate-700' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 z-30 mt-1 w-full overflow-hidden rounded-md border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                        Opsi Pengiriman Tersedia ({AVAILABLE_COURIERS.length})
                    </div>
                    <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                        {AVAILABLE_COURIERS.map((option) => {
                            const isSelected =
                                option.courier_name.toLowerCase() ===
                                    selectedCourier.toLowerCase() &&
                                option.courier_service.toUpperCase() ===
                                    selectedService.toUpperCase();

                            const { cost } = calculateShippingCost(
                                weightGram,
                                option.base_rate
                            );

                            return (
                                <button
                                    key={`${option.courier_name}-${option.courier_service}`}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`flex w-full cursor-pointer items-center justify-between p-3.5 text-left transition-colors ${
                                        isSelected
                                            ? 'bg-emerald-50/70 font-semibold'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                                                option.instant
                                                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                                                    : 'border-slate-200 bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {option.instant ? (
                                                <Zap size={14} />
                                            ) : (
                                                <Truck size={14} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {option.service_name}
                                                </span>
                                                {option.instant && (
                                                    <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-800 uppercase">
                                                        Instan
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-black text-slate-900">
                                            {formatRupiah(cost)}
                                        </span>
                                        {isSelected && (
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#03ac0e] text-white">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
