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

export default function CheckoutPage({ items, addresses, summary }: CheckoutProps) {
    const defaultAddress = addresses.find((addr) => addr.is_main) || addresses[0];

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
        <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-6 lg:p-12 font-sans">
            <Head title="Checkout Pesanan" />

            <div className="max-w-6xl mx-auto">
                <header className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
                    <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Marketplace Engine</span>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Ringkasan Checkout</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit('/cart')}
                        className="text-sm font-bold underline hover:text-neutral-600 transition cursor-pointer"
                    >
                        &larr; Kembali ke Keranjang
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Kolom Kiri: Alamat, Items, Catatan */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Section Alamat */}
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-black uppercase tracking-wide">1. Alamat Pengiriman</h2>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/dashboard')}
                                    className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1 hover:bg-neutral-800 transition cursor-pointer"
                                >
                                    Kelola Alamat
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="p-4 border-2 border-dashed border-red-500 bg-red-50 text-red-700 text-sm font-medium">
                                    Kamu belum memiliki alamat tersimpan. Silakan tambahkan alamat terlebih dahulu sebelum checkout.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((addr) => {
                                        const isSelected = data.address_id === addr.id;
                                        return (
                                            <label
                                                key={addr.id}
                                                className={`block border-2 p-4 cursor-pointer transition ${
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
                                                        onChange={() => setData('address_id', addr.id)}
                                                        className="mt-1 accent-[#03ac0e]"
                                                    />
                                                    <div className="flex-1 text-sm">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-black uppercase tracking-wider text-xs bg-black text-white px-2 py-0.5">
                                                                {addr.label}
                                                            </span>
                                                            {addr.is_main && (
                                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#03ac0e] text-white px-2 py-0.5">
                                                                    Utama
                                                                </span>
                                                            )}
                                                            <span className="font-bold text-slate-800">{addr.receiver}</span>
                                                            <span className="text-neutral-500 text-xs font-mono">({addr.phone})</span>
                                                        </div>
                                                        <p className="text-neutral-700 mt-1">{addr.full_address}</p>
                                                        {addr.note && (
                                                            <p className="text-xs text-neutral-500 mt-1 italic">
                                                                Catatan: {addr.note}
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
                                <p className="text-red-600 text-xs mt-2 font-bold">{errors.address_id}</p>
                            )}
                        </div>

                        {/* Section Barang yang Dibeli */}
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-black uppercase tracking-wide mb-4">2. Rincian Barang</h2>
                            <div className="divide-y-2 divide-neutral-100">
                                {items.map((item) => (
                                    <div key={item.id} className="py-4 flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-neutral-100 border border-black shrink-0 overflow-hidden">
                                            {item.product?.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product?.title || 'Produk'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-400">
                                                    No IMG
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm truncate text-slate-900">{item.product?.title || 'Produk'}</h3>
                                            <p className="text-xs text-neutral-500 font-mono mt-0.5">
                                                {item.quantity} barang x {formatRupiah(Number(item.product?.price || 0))}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-sm">
                                                {formatRupiah(Number(item.product?.price || 0) * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section Catatan Tambahan */}
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-black uppercase tracking-wide mb-2">3. Catatan Pengiriman (Opsional)</h2>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Contoh: Titipkan di pos satpam atau jangan dibanting."
                                rows={3}
                                className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#03ac0e]"
                            />
                            {errors.notes && (
                                <p className="text-red-600 text-xs mt-1 font-bold">{errors.notes}</p>
                            )}
                        </div>
                    </div>

                    {/* Kolom Kanan: Pembayaran & Ringkasan */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Section Metode Pembayaran */}
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-black uppercase tracking-wide mb-4">Metode Pembayaran</h2>
                            <div className="space-y-2">
                                {[
                                    { id: 'qris', label: 'QRIS (Gopay, OVO, Dana)', desc: 'Scan instan dengan aplikasi e-wallet apapun' },
                                    { id: 'bca_va', label: 'BCA Virtual Account', desc: 'Verifikasi otomatis 24 jam' },
                                    { id: 'mandiri_va', label: 'Mandiri Virtual Account', desc: 'Verifikasi otomatis 24 jam' },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className={`block border-2 p-3 cursor-pointer transition ${
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
                                                checked={data.payment_method === method.id}
                                                onChange={() => setData('payment_method', method.id)}
                                                className="mt-1 accent-[#03ac0e]"
                                            />
                                            <div>
                                                <p className="font-bold text-xs uppercase tracking-wider">{method.label}</p>
                                                <p className="text-[11px] text-neutral-500 mt-0.5">{method.desc}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.payment_method && (
                                <p className="text-red-600 text-xs mt-2 font-bold">{errors.payment_method}</p>
                            )}
                        </div>

                        {/* Section Ringkasan Biaya */}
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-black uppercase tracking-wide mb-4">Ringkasan Belanja</h2>
                            <div className="space-y-2 text-sm border-b-2 border-dashed border-neutral-300 pb-4">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Total Harga ({items.length} Barang)</span>
                                    <span className="font-mono font-bold">{formatRupiah(summary.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Total Ongkos Kirim</span>
                                    <span className="font-mono font-bold">{formatRupiah(summary.shipping_cost)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 mb-6">
                                <span className="text-base font-black uppercase tracking-wide">Total Tagihan</span>
                                <span className="text-xl font-black font-mono text-[#03ac0e]">
                                    {formatRupiah(summary.grand_total)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || addresses.length === 0}
                                className="w-full bg-[#03ac0e] text-white border-2 border-black p-4 font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? 'Memproses Pesanan...' : 'Bayar Sekarang'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
