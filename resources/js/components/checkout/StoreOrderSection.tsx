import React from 'react';
import {
    MapPin,
    ShieldCheck,
    Store as StoreIcon,
    Package,
    Zap,
} from 'lucide-react';
import type { CartItem, StoreCartGroup } from '@/types';
import CourierSelector from './CourierSelector';

interface StoreOrderSectionProps {
    group: StoreCartGroup;
    selectedCourier: string;
    selectedService: string;
    shippingCost: number;
    onCourierChange: (courierName: string, serviceKey: string, cost: number) => void;
}

const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
};

export default function StoreOrderSection({
    group,
    selectedCourier,
    selectedService,
    shippingCost,
    onCourierChange,
}: StoreOrderSectionProps) {
    const { store, items, selected_subtotal, selected_weight_gram } = group;

    // Weight calculation
    const effectiveWeightGram = Math.max(selected_weight_gram, 200);
    const weightKg = Math.max(1, Math.ceil(effectiveWeightGram / 1000));

    // Store total = subtotal + shipping cost
    const storeGrandTotal = selected_subtotal + shippingCost;

    return (
        <div className="overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Header Toko */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black bg-neutral-50 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-white">
                        {store.logo ? (
                            <img
                                src={store.logo}
                                alt={store.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <StoreIcon size={16} className="text-slate-800" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
                                {store.name}
                            </span>

                            {store.is_official && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase">
                                    <ShieldCheck size={10} />
                                    Official
                                </span>
                            )}

                            {store.power_merchant && !store.is_official && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950 uppercase">
                                    <Zap size={10} />
                                    PM
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin size={11} className="text-slate-400" />
                            <span>Dikirim dari: <strong>{store.city}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs text-slate-600">
                    <Package size={13} className="text-slate-400" />
                    <span>
                        Berat Toko: <strong>{effectiveWeightGram.toLocaleString('id-ID')} gr</strong> ({weightKg} kg)
                    </span>
                </div>
            </div>

            {/* List Barang Toko */}
            <div className="divide-y divide-slate-100 p-5">
                <div className="space-y-4">
                    {items.map((item: CartItem) => {
                        const itemPrice = Number(
                            item.sku?.price ?? item.price ?? item.product?.price ?? 0
                        );
                        const itemTotal = itemPrice * item.quantity;
                        const itemImage =
                            item.sku?.image ||
                            item.image ||
                            item.product?.image ||
                            '';
                        const itemTitle =
                            item.title || item.product?.title || 'Produk';
                        const itemSkuCombination =
                            item.sku_combination ||
                            item.sku?.combination_key;

                        return (
                            <div
                                key={item.id}
                                className="flex items-start gap-4"
                            >
                                <div className="h-16 w-16 shrink-0 overflow-hidden border border-black bg-neutral-100">
                                    {itemImage ? (
                                        <img
                                            src={itemImage}
                                            alt={itemTitle}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-neutral-400">
                                            NO IMG
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-sm font-bold text-slate-900">
                                        {itemTitle}
                                    </h4>

                                    {itemSkuCombination && (
                                        <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                                            Variasi: {itemSkuCombination}
                                        </span>
                                    )}

                                    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                                        <span className="font-mono">
                                            {item.quantity} barang x {formatRupiah(itemPrice)}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="font-mono text-[11px]">
                                            @{(item.weight_gram ?? item.sku?.weight_gram ?? 200)} gr
                                        </span>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    <span className="font-mono text-sm font-black text-slate-900">
                                        {formatRupiah(itemTotal)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Seksi Pilihan Kurir Toko ini */}
                <div className="mt-5 pt-5">
                    <CourierSelector
                        weightGram={effectiveWeightGram}
                        selectedCourier={selectedCourier}
                        selectedService={selectedService}
                        onChange={onCourierChange}
                    />

                    {/* Subtotal Toko */}
                    <div className="mt-4 flex flex-wrap items-center justify-between rounded-md border border-dashed border-slate-300 bg-slate-50/60 p-3 text-xs">
                        <span className="text-slate-600">
                            Subtotal Toko (Produk + Ongkir)
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500">
                                {formatRupiah(selected_subtotal)} + {formatRupiah(shippingCost)} =
                            </span>
                            <span className="font-mono font-black text-slate-900">
                                {formatRupiah(storeGrandTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
