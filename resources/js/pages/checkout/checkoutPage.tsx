import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';
import type { Address, CartItem } from '@/types';

interface CheckoutProps {
    items: CartItem[];
    addresses: Address[];
    summary: {
        subtotal: number;
        shipping_cost: number;
        grand_total: number;
    };
}

export default function CheckoutPage({
    items,
    addresses,
    summary,
}: CheckoutProps) {
    const defaultAddress =
        addresses.find((addr) => addr.is_main) || addresses[0];

    const { data, setData, post, processing, errors } = useForm<{
        address_id: number | '';
        payment_method: string;
        notes: string;
    }>({
        address_id: defaultAddress ? defaultAddress.id : '',
        payment_method: 'qris',
        notes: '',
    });

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout', {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-6 font-sans text-[#1A1A1A] lg:p-12">
            <Head title="Checkout Pesanan" />

            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex items-end justify-between border-b-2 border-black pb-4">
                    <div>
                        <span className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
                            Marketplace Engine
                        </span>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Ringkasan Checkout
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit('/cart')}
                        className="cursor-pointer text-sm font-bold underline transition hover:text-neutral-600"
                    >
                        &larr; Kembali ke Keranjang
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-8 lg:grid-cols-12"
                >
                    {/* Kolom Kiri: Alamat, Items, Catatan */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Section Alamat */}
                        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black tracking-wide uppercase">
                                    1. Alamat Pengiriman
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/dashboard')}
                                    className="cursor-pointer bg-black px-3 py-1 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-neutral-800"
                                >
                                    Kelola Alamat
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="border-2 border-dashed border-red-500 bg-red-50 p-4 text-sm font-medium text-red-700">
                                    Kamu belum memiliki alamat tersimpan.
                                    Silakan tambahkan alamat terlebih dahulu
                                    sebelum checkout.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((addr) => {
                                        const isSelected =
                                            data.address_id === addr.id;

                                        return (
                                            <label
                                                key={addr.id}
                                                className={`block cursor-pointer border-2 p-4 transition ${
                                                    isSelected
                                                        ? 'border-[#03ac0e] bg-emerald-50/40'
                                                        : 'border-neutral-200 hover:border-black'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="address_id"
                                                        value={addr.id}
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            setData(
                                                                'address_id',
                                                                addr.id,
                                                            )
                                                        }
                                                        className="mt-1 accent-[#03ac0e]"
                                                    />
                                                    <div className="flex-1 text-sm">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <span className="bg-black px-2 py-0.5 text-xs font-black tracking-wider text-white uppercase">
                                                                {addr.label}
                                                            </span>
                                                            {addr.is_main && (
                                                                <span className="bg-[#03ac0e] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                                                                    Utama
                                                                </span>
                                                            )}
                                                            <span className="font-bold text-slate-800">
                                                                {addr.receiver}
                                                            </span>
                                                            <span className="font-mono text-xs text-neutral-500">
                                                                ({addr.phone})
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-neutral-700">
                                                            {addr.full_address}
                                                        </p>
                                                        {addr.note && (
                                                            <p className="mt-1 text-xs text-neutral-500 italic">
                                                                Catatan:{' '}
                                                                {addr.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {errors.address_id && (
                                <p className="mt-2 text-xs font-bold text-red-600">
                                    {errors.address_id}
                                </p>
                            )}
                        </div>

                        {/* Section Barang yang Dibeli */}
                        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="mb-4 text-lg font-black tracking-wide uppercase">
                                2. Rincian Barang
                            </h2>
                            <div className="divide-y-2 divide-neutral-100">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 py-4"
                                    >
                                        <div className="h-16 w-16 shrink-0 overflow-hidden border border-black bg-neutral-100">
                                            {item.product?.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={
                                                        item.product?.title ||
                                                        'Produk'
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center font-mono text-xs text-neutral-400">
                                                    No IMG
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-sm font-bold text-slate-900">
                                                {item.product?.title ||
                                                    'Produk'}
                                            </h3>
                                            <p className="mt-0.5 font-mono text-xs text-neutral-500">
                                                {item.quantity} barang x{' '}
                                                {formatRupiah(
                                                    Number(
                                                        item.product?.price ||
                                                            0,
                                                    ),
                                                )}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-black">
                                                {formatRupiah(
                                                    Number(
                                                        item.product?.price ||
                                                            0,
                                                    ) * item.quantity,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section Catatan Tambahan */}
                        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="mb-2 text-lg font-black tracking-wide uppercase">
                                3. Catatan Pengiriman (Opsional)
                            </h2>
                            <textarea
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Contoh: Titipkan di pos satpam atau jangan dibanting."
                                rows={3}
                                className="w-full border-2 border-black p-3 text-sm focus:ring-2 focus:ring-[#03ac0e] focus:outline-none"
                            />
                            {errors.notes && (
                                <p className="mt-1 text-xs font-bold text-red-600">
                                    {errors.notes}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Kolom Kanan: Pembayaran & Ringkasan */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Section Metode Pembayaran */}
                        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="mb-4 text-lg font-black tracking-wide uppercase">
                                Metode Pembayaran
                            </h2>
                            <div className="space-y-2">
                                {[
                                    {
                                        id: 'qris',
                                        label: 'QRIS (Gopay, OVO, Dana)',
                                        desc: 'Scan instan dengan aplikasi e-wallet apapun',
                                    },
                                    {
                                        id: 'bca_va',
                                        label: 'BCA Virtual Account',
                                        desc: 'Verifikasi otomatis 24 jam',
                                    },
                                    {
                                        id: 'mandiri_va',
                                        label: 'Mandiri Virtual Account',
                                        desc: 'Verifikasi otomatis 24 jam',
                                    },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className={`block cursor-pointer border-2 p-3 transition ${
                                            data.payment_method === method.id
                                                ? 'border-[#03ac0e] bg-emerald-50/40'
                                                : 'border-neutral-200 hover:border-black'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value={method.id}
                                                checked={
                                                    data.payment_method ===
                                                    method.id
                                                }
                                                onChange={() =>
                                                    setData(
                                                        'payment_method',
                                                        method.id,
                                                    )
                                                }
                                                className="mt-1 accent-[#03ac0e]"
                                            />
                                            <div>
                                                <p className="text-xs font-bold tracking-wider uppercase">
                                                    {method.label}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-neutral-500">
                                                    {method.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.payment_method && (
                                <p className="mt-2 text-xs font-bold text-red-600">
                                    {errors.payment_method}
                                </p>
                            )}
                        </div>

                        {/* Section Ringkasan Biaya */}
                        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="mb-4 text-lg font-black tracking-wide uppercase">
                                Ringkasan Belanja
                            </h2>
                            <div className="space-y-2 border-b-2 border-dashed border-neutral-300 pb-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">
                                        Total Harga ({items.length} Barang)
                                    </span>
                                    <span className="font-mono font-bold">
                                        {formatRupiah(summary.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">
                                        Total Ongkos Kirim
                                    </span>
                                    <span className="font-mono font-bold">
                                        {formatRupiah(summary.shipping_cost)}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-6 flex items-center justify-between pt-4">
                                <span className="text-base font-black tracking-wide uppercase">
                                    Total Tagihan
                                </span>
                                <span className="font-mono text-xl font-black text-[#03ac0e]">
                                    {formatRupiah(summary.grand_total)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || addresses.length === 0}
                                className="w-full cursor-pointer border-2 border-black bg-[#03ac0e] p-4 text-sm font-black tracking-widest text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Memproses Pesanan...'
                                    : 'Bayar Sekarang'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
