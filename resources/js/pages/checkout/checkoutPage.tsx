import { Head, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import {
    MapPin,
    ArrowLeft,
    CheckCircle2,
    PlusCircle,
    FileText,
} from 'lucide-react';
import type { Address, CartItem, StoreCartGroup, StoreShippingState } from '@/types';
import StoreOrderSection from '@/components/checkout/StoreOrderSection';
import PaymentSummaryCard from '@/components/checkout/PaymentSummaryCard';
import { calculateShippingCost } from '@/components/checkout/CourierSelector';

interface CheckoutProps {
    items: CartItem[];
    addresses: Address[];
    summary: {
        subtotal: number;
        shipping_cost: number;
        grand_total: number;
    };
    storeGroups?: StoreCartGroup[];
}

export default function CheckoutPage({
    items,
    addresses,
    summary,
    storeGroups: serverStoreGroups,
}: CheckoutProps) {
    // 1. Resolve store groups (use server-provided storeGroups or fallback to client grouping)
    const activeGroups: StoreCartGroup[] = useMemo(() => {
        if (serverStoreGroups && serverStoreGroups.length > 0) {
            return serverStoreGroups;
        }

        // Fallback client grouping for robustness
        const groupMap = new Map<number, CartItem[]>();
        for (const item of items) {
            const storeId = item.product?.store_id ?? item.store_id ?? 0;
            const existing = groupMap.get(storeId) || [];
            existing.push(item);
            groupMap.set(storeId, existing);
        }

        const derived: StoreCartGroup[] = [];
        groupMap.forEach((storeItems, storeId) => {
            const first = storeItems[0];
            const storeObj = first.product?.store;

            let subtotal = 0;
            let totalWeight = 0;

            for (const it of storeItems) {
                const price = Number(it.sku?.price ?? it.price ?? it.product?.price ?? 0);
                const weight = Number(it.weight_gram ?? it.sku?.weight_gram ?? 200);
                subtotal += price * it.quantity;
                totalWeight += weight * it.quantity;
            }

            derived.push({
                store: {
                    id: storeObj?.id ?? storeId,
                    name: storeObj?.name ?? 'Toko Marketplace',
                    slug: storeObj?.slug ?? 'toko-marketplace',
                    city: storeObj?.city || first.product?.city || 'Jakarta Pusat',
                    is_official: Boolean(storeObj?.is_official),
                    power_merchant: Boolean(storeObj?.power_merchant),
                    logo: storeObj?.logo ?? null,
                },
                items: storeItems,
                subtotal,
                total_weight_gram: totalWeight,
                selected_subtotal: subtotal,
                selected_weight_gram: totalWeight,
                selected_count: storeItems.length,
                total_items: storeItems.length,
                is_all_selected: true,
            });
        });

        return derived;
    }, [serverStoreGroups, items]);

    // 2. Default Address Selection
    const defaultAddress =
        addresses.find((addr) => addr.is_main) || addresses[0] || null;
    const [selectedAddressId, setSelectedAddressId] = useState<number | ''>(
        defaultAddress ? defaultAddress.id : ''
    );

    // 3. Courier selection per store (Independent shipping state)
    // Default each store to JNE REG (base_rate = 8000)
    const [storeShipping, setStoreShipping] = useState<Record<number, StoreShippingState>>(() => {
        const initial: Record<number, StoreShippingState> = {};
        for (const group of activeGroups) {
            const { cost } = calculateShippingCost(group.selected_weight_gram, 8000);
            initial[group.store.id] = {
                courier_name: 'jne',
                courier_service: 'REG',
                shipping_cost: cost,
            };
        }
        return initial;
    });

    // Handle courier update for a specific store without affecting others
    const handleStoreCourierChange = (
        storeId: number,
        courierName: string,
        serviceKey: string,
        cost: number
    ) => {
        setStoreShipping((prev) => ({
            ...prev,
            [storeId]: {
                courier_name: courierName,
                courier_service: serviceKey,
                shipping_cost: cost,
            },
        }));
    };

    // 4. Financial Calculations
    const itemsSubtotal = useMemo(() => {
        return activeGroups.reduce((acc, g) => acc + g.selected_subtotal, 0);
    }, [activeGroups]);

    const totalShippingCost = useMemo(() => {
        let total = 0;
        for (const group of activeGroups) {
            const shipping = storeShipping[group.store.id];
            if (shipping) {
                total += shipping.shipping_cost;
            } else {
                const { cost } = calculateShippingCost(group.selected_weight_gram, 8000);
                total += cost;
            }
        }
        return total;
    }, [activeGroups, storeShipping]);

    const applicationFee = 1000;
    const grandTotal = itemsSubtotal + totalShippingCost + applicationFee;

    const totalItemCount = useMemo(() => {
        return activeGroups.reduce(
            (acc, g) => acc + g.items.reduce((sum, it) => sum + it.quantity, 0),
            0
        );
    }, [activeGroups]);

    // 5. Payment & Notes state
    const [paymentMethod, setPaymentMethod] = useState<string>('qris');
    const [notes, setNotes] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 6. Submit Multi-Store Checkout
    const handleSubmit = () => {
        if (!selectedAddressId) {
            setErrorMessage('Silakan pilih alamat pengiriman.');
            return;
        }

        setProcessing(true);
        setErrorMessage(null);

        const payload = {
            address_id: Number(selectedAddressId),
            stores: activeGroups.map((group) => {
                const shipping = storeShipping[group.store.id] || {
                    courier_name: 'jne',
                    courier_service: 'REG',
                    shipping_cost: 8000,
                };
                return {
                    store_id: group.store.id,
                    courier_name: shipping.courier_name,
                    courier_service: shipping.courier_service,
                };
            }),
            payment_method: paymentMethod,
            notes: notes.trim() || undefined,
        };

        router.post('/checkout/multi', payload, {
            preserveScroll: true,
            onError: (errors) => {
                setProcessing(false);
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    setErrorMessage(String(firstError));
                }
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 font-sans text-[#1A1A1A] lg:p-10">
            <Head title="Checkout Pesanan Multi-Toko" />

            <div className="mx-auto max-w-6xl">
                {/* Header Tokopedia style */}
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
                    <div>
                        <span className="font-mono text-xs font-bold tracking-widest text-neutral-500 uppercase">
                            Marketplace Engine • Multi-Vendor Logistics
                        </span>
                        <h1 className="text-2xl font-black tracking-tight uppercase sm:text-3xl">
                            Ringkasan Checkout
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit('/cart')}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold underline transition hover:text-neutral-600"
                    >
                        <ArrowLeft size={16} />
                        <span>Kembali ke Keranjang</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    {/* ==================================================== */}
                    {/* KOLOM KIRI: Alamat, Pengiriman Toko, Catatan */}
                    {/* ==================================================== */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* 1. Alamat Pengiriman */}
                        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-[#03ac0e]" />
                                    <h2 className="text-base font-black tracking-wide text-slate-900 uppercase">
                                        1. Alamat Pengiriman
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/dashboard')}
                                    className="cursor-pointer bg-black px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-neutral-800"
                                >
                                    Kelola Alamat
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="border-2 border-dashed border-red-500 bg-red-50 p-4 text-center">
                                    <p className="text-sm font-bold text-red-700">
                                        Kamu belum memiliki alamat pengiriman tersimpan.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.visit('/dashboard')}
                                        className="mt-3 inline-flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50"
                                    >
                                        <PlusCircle size={14} />
                                        <span>Tambah Alamat Sekarang</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((addr) => {
                                        const isSelected = selectedAddressId === addr.id;

                                        return (
                                            <label
                                                key={addr.id}
                                                className={`block cursor-pointer border-2 p-4 transition-all ${
                                                    isSelected
                                                        ? 'border-[#03ac0e] bg-emerald-50/40 shadow-[0_0_0_1px_rgba(3,172,14,0.3)]'
                                                        : 'border-neutral-200 hover:border-black hover:bg-neutral-50/50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="selected_address_id"
                                                        value={addr.id}
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            setSelectedAddressId(addr.id)
                                                        }
                                                        className="mt-1 accent-[#03ac0e]"
                                                    />
                                                    <div className="flex-1 text-sm">
                                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                                            <span className="bg-black px-2 py-0.5 text-[11px] font-black tracking-wider text-white uppercase">
                                                                {addr.label}
                                                            </span>
                                                            {addr.is_main && (
                                                                <span className="bg-[#03ac0e] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                                                                    Utama
                                                                </span>
                                                            )}
                                                            <span className="font-bold text-slate-900">
                                                                {addr.receiver}
                                                            </span>
                                                            <span className="font-mono text-xs text-neutral-500">
                                                                ({addr.phone})
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-neutral-700 leading-relaxed">
                                                            {addr.full_address}
                                                        </p>
                                                        {addr.note && (
                                                            <p className="mt-1 text-xs text-neutral-500 italic">
                                                                Catatan: {addr.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="shrink-0 text-[#03ac0e]">
                                                            <CheckCircle2 size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. Seksi Pesanan per Toko */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-black tracking-wide text-slate-900 uppercase">
                                    2. Daftar Pengiriman per Toko ({activeGroups.length} Toko)
                                </h2>
                                <span className="text-xs text-neutral-500">
                                    Pilih kurir untuk masing-masing toko
                                </span>
                            </div>

                            {activeGroups.map((group) => {
                                const storeId = group.store.id;
                                const shipping = storeShipping[storeId] || {
                                    courier_name: 'jne',
                                    courier_service: 'REG',
                                    shipping_cost: 8000,
                                };

                                return (
                                    <StoreOrderSection
                                        key={storeId}
                                        group={group}
                                        selectedCourier={shipping.courier_name}
                                        selectedService={shipping.courier_service}
                                        shippingCost={shipping.shipping_cost}
                                        onCourierChange={(courierName, serviceKey, cost) =>
                                            handleStoreCourierChange(
                                                storeId,
                                                courierName,
                                                serviceKey,
                                                cost
                                            )
                                        }
                                    />
                                );
                            })}
                        </div>

                        {/* 3. Catatan Pengiriman (Opsional) */}
                        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="mb-2 flex items-center gap-2">
                                <FileText size={16} className="text-slate-700" />
                                <h2 className="text-base font-black tracking-wide text-slate-900 uppercase">
                                    3. Catatan Pengiriman (Opsional)
                                </h2>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Titipkan pada satpam atau paket jangan dibanting."
                                rows={3}
                                maxLength={500}
                                className="w-full border-2 border-black p-3 text-sm focus:ring-2 focus:ring-[#03ac0e] focus:outline-none"
                            />
                            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                                <span>Maksimal 500 karakter</span>
                                <span>{notes.length}/500</span>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================== */}
                    {/* KOLOM KANAN: PaymentSummaryCard Sticky */}
                    {/* ==================================================== */}
                    <div className="lg:sticky lg:top-6 lg:col-span-4">
                        <PaymentSummaryCard
                            itemsSubtotal={itemsSubtotal}
                            totalShippingCost={totalShippingCost}
                            storeCount={activeGroups.length}
                            itemCount={totalItemCount}
                            applicationFee={applicationFee}
                            grandTotal={grandTotal}
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            onSubmit={handleSubmit}
                            processing={processing}
                            hasAddress={Boolean(selectedAddressId)}
                            errorMessage={errorMessage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
