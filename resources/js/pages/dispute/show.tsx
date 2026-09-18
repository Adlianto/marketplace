import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileText,
    Image as ImageIcon,
    Loader2,
    Package,
    ShieldAlert,
    ShieldCheck,
    Store as StoreIcon,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { DisputeTicket } from '@/types/models';

interface DisputeShowProps {
    disputeTicket: DisputeTicket;
    isBuyer: boolean;
    isSeller: boolean;
}

const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
};

export default function DisputeShow({
    disputeTicket,
    isBuyer,
    isSeller,
}: DisputeShowProps) {
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const handleResolve = (solutionType: 'resolved_completed' | 'resolved_refund') => {
        setIsResolving(true);
        router.post(
            `/disputes/${disputeTicket.id}/resolve`,
            { solution: solutionType },
            {
                onFinish: () => setIsResolving(false),
            },
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Komplain Sedang Terbuka (Dana Ditahan)
                    </span>
                );
            case 'negotiation':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Dalam Proses Negosiasi
                    </span>
                );
            case 'resolved_completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Selesai - Dana Diteruskan ke Penjual
                    </span>
                );
            case 'resolved_refund':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-600/20">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        Selesai - Dana Dikembalikan ke Pembeli
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-600/20">
                        <XCircle className="h-4 w-4 text-slate-500" />
                        Komplain Dibatalkan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    const subOrder = disputeTicket.subOrder || disputeTicket.sub_order;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title={`Tiket Komplain #${disputeTicket.id} - ${disputeTicket.reason}`} />
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href={isSeller ? '/seller/orders' : '/dashboard?tab=pesanan'}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke {isSeller ? 'Manajemen Pesanan Toko' : 'Daftar Pesanan'}
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-slate-100 bg-slate-50/80 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-base font-bold text-slate-900">
                                            Tiket Komplain #{disputeTicket.id}
                                        </h1>
                                        <span className="font-mono text-xs text-slate-400">
                                            ({new Date(disputeTicket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                                        Alasan: <span className="text-amber-700">{disputeTicket.reason}</span>
                                    </p>
                                </div>
                            </div>

                            <div>{getStatusBadge(disputeTicket.status)}</div>
                        </div>
                    </div>

                    {/* Dispute Info */}
                    <div className="p-6 space-y-6">
                        {/* Order & Store Details Card */}
                        {subOrder && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <StoreIcon className="h-4 w-4 text-slate-500" />
                                        <span className="font-bold text-slate-900">{disputeTicket.store?.name}</span>
                                    </div>
                                    <span className="font-mono text-slate-500">#{subOrder.sub_order_number}</span>
                                </div>

                                <div className="space-y-2">
                                    {subOrder.items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-slate-400" />
                                                <span className="font-medium text-slate-800">{item.product_title}</span>
                                                {item.sku_combination && (
                                                    <span className="text-[11px] text-slate-500">({item.sku_combination})</span>
                                                )}
                                                <span className="text-slate-400">× {item.quantity}</span>
                                            </div>
                                            <span className="font-semibold text-slate-900">{formatRupiah(item.total_price)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 border-t border-slate-200 pt-3 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Total Nilai Escrow Tertahan:</span>
                                    <span className="font-bold text-amber-700">{formatRupiah(subOrder.total_amount)}</span>
                                </div>
                            </div>
                        )}

                        {/* Complaint Description */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Deskripsi Keluhan Pembeli
                            </h3>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                                {disputeTicket.description}
                            </div>
                        </div>

                        {/* Evidence Photos Gallery */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Bukti Foto Lampiran ({disputeTicket.evidence_photos?.length || 0})
                            </h3>

                            {disputeTicket.evidence_photos && disputeTicket.evidence_photos.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {disputeTicket.evidence_photos.map((photo, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setPreviewPhoto(photo)}
                                            className="group relative h-28 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:opacity-90 transition"
                                        >
                                            <img
                                                src={photo}
                                                alt={`Bukti komplain ${idx + 1}`}
                                                className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Tidak ada foto bukti.</p>
                            )}
                        </div>

                        {/* Solution / Resolution section */}
                        {disputeTicket.solution && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs">
                                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    Hasil Kesepakatan Solusi:
                                </p>
                                <p className="mt-1 text-emerald-900">{disputeTicket.solution}</p>
                            </div>
                        )}

                        {/* Action buttons when dispute is open */}
                        {disputeTicket.status === 'open' && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                                <h4 className="text-xs font-bold text-slate-900">
                                    Penyelesaian & Resolusi Sengketa:
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Pilih opsi penyelesaian komplain untuk membuka pembekuan escrow:
                                </p>

                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        disabled={isResolving}
                                        onClick={() => handleResolve('resolved_completed')}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Terima Barang & Lepaskan Escrow ke Penjual
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isResolving}
                                        onClick={() => handleResolve('resolved_refund')}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition cursor-pointer"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Setujui Refund & Kembalikan Stok Barang
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Photo Lightbox Modal */}
            {previewPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setPreviewPhoto(null)}
                >
                    <div
                        className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewPhoto(null)}
                            className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition"
                        >
                            <X size={18} />
                        </button>
                        <img
                            src={previewPhoto}
                            alt="Bukti komplain besar"
                            className="max-h-[80vh] w-auto object-contain"
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
