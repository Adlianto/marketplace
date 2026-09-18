import React from 'react';
import { ShieldCheck, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';

export interface PaymentMethodOption {
    id: string;
    label: string;
    desc: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
    {
        id: 'qris',
        label: 'QRIS (GoPay, OVO, Dana, ShopeePay)',
        desc: 'Scan instan dengan aplikasi pembayaran apapun',
    },
    {
        id: 'bca_va',
        label: 'BCA Virtual Account',
        desc: 'Verifikasi otomatis 24 jam bebas antre',
    },
    {
        id: 'mandiri_va',
        label: 'Mandiri Virtual Account',
        desc: 'Verifikasi otomatis dari Mandiri Livin',
    },
];

interface PaymentSummaryCardProps {
    itemsSubtotal: number;
    totalShippingCost: number;
    storeCount: number;
    itemCount: number;
    applicationFee?: number;
    grandTotal: number;
    paymentMethod: string;
    onPaymentMethodChange: (method: string) => void;
    onSubmit: () => void;
    processing: boolean;
    disabled?: boolean;
    hasAddress: boolean;
    errorMessage?: string | null;
}

const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
};

export default function PaymentSummaryCard({
    itemsSubtotal,
    totalShippingCost,
    storeCount,
    itemCount,
    applicationFee = 1000,
    grandTotal,
    paymentMethod,
    onPaymentMethodChange,
    onSubmit,
    processing,
    disabled = false,
    hasAddress,
    errorMessage,
}: PaymentSummaryCardProps) {
    return (
        <div className="space-y-6">
            {/* Box Metode Pembayaran */}
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="mb-4 text-base font-black tracking-wide text-slate-900 uppercase">
                    Metode Pembayaran
                </h3>

                <div className="space-y-2.5">
                    {PAYMENT_METHODS.map((method) => {
                        const isSelected = paymentMethod === method.id;

                        return (
                            <label
                                key={method.id}
                                className={`block cursor-pointer rounded border-2 p-3 transition-all ${
                                    isSelected
                                        ? 'border-[#03ac0e] bg-emerald-50/50 shadow-[0_0_0_1px_rgba(3,172,14,0.3)]'
                                        : 'border-neutral-200 hover:border-black hover:bg-neutral-50/50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={method.id}
                                        checked={isSelected}
                                        onChange={() =>
                                            onPaymentMethodChange(method.id)
                                        }
                                        className="mt-1 accent-[#03ac0e]"
                                    />
                                    <div className="flex-1 text-left">
                                        <p className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                                            {method.label}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-neutral-500">
                                            {method.desc}
                                        </p>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Box Ringkasan Belanja Sticky */}
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="mb-4 text-base font-black tracking-wide text-slate-900 uppercase">
                    Ringkasan Belanja
                </h3>

                <div className="space-y-3 border-b-2 border-dashed border-neutral-300 pb-4 text-sm">
                    {/* Subtotal Produk */}
                    <div className="flex items-center justify-between text-neutral-600">
                        <span>Total Harga ({itemCount} Barang)</span>
                        <span className="font-mono font-bold text-slate-900">
                            {formatRupiah(itemsSubtotal)}
                        </span>
                    </div>

                    {/* Total Ongkir N Toko */}
                    <div className="flex items-center justify-between text-neutral-600">
                        <span>Total Ongkos Kirim ({storeCount} Toko)</span>
                        <span className="font-mono font-bold text-slate-900">
                            {formatRupiah(totalShippingCost)}
                        </span>
                    </div>

                    {/* Biaya Jasa Aplikasi */}
                    <div className="flex items-center justify-between text-neutral-600">
                        <div className="flex items-center gap-1">
                            <span>Biaya Jasa Aplikasi</span>
                            <span
                                title="Biaya pemeliharaan sistem marketplace"
                                className="cursor-help text-neutral-400 hover:text-neutral-600"
                            >
                                <HelpCircle size={13} />
                            </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                            {formatRupiah(applicationFee)}
                        </span>
                    </div>
                </div>

                {/* Grand Total */}
                <div className="mb-6 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black tracking-wide text-slate-900 uppercase">
                            Total Tagihan
                        </span>
                        <span className="font-mono text-xl font-black text-[#03ac0e]">
                            {formatRupiah(grandTotal)}
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400">
                        Termasuk PPN & asuransi perlindungan transaksi
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-4 rounded border-2 border-red-500 bg-red-50 p-3 text-xs font-bold text-red-600">
                        {errorMessage}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={disabled || processing || !hasAddress}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-black bg-[#03ac0e] p-4 text-sm font-black tracking-widest text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                    {processing ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Memproses Pesanan...</span>
                        </>
                    ) : (
                        <>
                            <span>Bayar Sekarang</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>

                {!hasAddress && (
                    <p className="mt-2 text-center text-xs font-semibold text-red-600">
                        Pilih atau tambahkan alamat pengiriman terlebih dahulu.
                    </p>
                )}

                {/* Garansi Keamanan */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Transaksi aman & terenkripsi 256-bit</span>
                </div>
            </div>
        </div>
    );
}
