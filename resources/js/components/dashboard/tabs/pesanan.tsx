import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Package,
    ShieldAlert,
    ShieldCheck,
    Star,
    Store as StoreIcon,
    Truck,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import ReviewFormModal from '@/components/review/ReviewFormModal';
import type { SubOrder, SubOrderItem } from '@/types';

interface PesananTabProps {
    orders?: SubOrder[];
}

const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function PesananTab({ orders = [] }: PesananTabProps) {
    const [selectedOrderForComplete, setSelectedOrderForComplete] = useState<SubOrder | null>(null);
    const [selectedItemForReview, setSelectedItemForReview] = useState<SubOrderItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const handleOpenCompleteModal = (order: SubOrder) => {
        setSelectedOrderForComplete(order);
    };

    const handleCloseCompleteModal = () => {
        setSelectedOrderForComplete(null);
    };

    const handleConfirmComplete = () => {
        if (!selectedOrderForComplete) return;

        setIsSubmitting(true);
        router.post(
            `/orders/${selectedOrderForComplete.id}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseCompleteModal();
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedTracking(text);
        setTimeout(() => setCopiedTracking(null), 2000);
    };

    const filteredOrders = orders.filter((order) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') {
            return ['waiting_payment', 'paid', 'processing', 'shipped', 'delivered'].includes(order.status);
        }
        if (statusFilter === 'shipped') {
            return ['shipped', 'delivered'].includes(order.status);
        }
        if (statusFilter === 'completed') {
            return order.status === 'completed';
        }
        if (statusFilter === 'cancelled') {
            return order.status === 'cancelled';
        }
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'waiting_payment':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Clock className="h-3.5 w-3.5" />
                        Menunggu Pembayaran
                    </span>
                );
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Sudah Dibayar
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/20">
                        <Package className="h-3.5 w-3.5" />
                        Diproses Penjual
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/20">
                        <Truck className="h-3.5 w-3.5" />
                        Dalam Pengiriman
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-700/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tiba di Tujuan
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selesai
                    </span>
                );
            case 'complaint':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                        Komplain Diajukan
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                        <XCircle className="h-3.5 w-3.5" />
                        Dibatalkan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Daftar Transaksi Saya</h2>
                    <p className="text-xs text-gray-500">
                        Pantau status pesanan belanja Anda dan konfirmasi penerimaan barang.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'Semua' },
                        { key: 'active', label: 'Berlangsung' },
                        { key: 'shipped', label: 'Dikirim' },
                        { key: 'completed', label: 'Selesai' },
                        { key: 'cancelled', label: 'Dibatalkan' },
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            type="button"
                            onClick={() => setStatusFilter(filter.key)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                                statusFilter === filter.key
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                        <Package className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">
                        Belum Ada Pesanan
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-gray-500">
                        Anda belum memiliki riwayat pesanan dengan filter status ini. Yuk jelajahi produk menarik lainnya!
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const canComplete = ['shipped', 'delivered'].includes(order.status);

                        return (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition hover:border-gray-300"
                            >
                                {/* Card Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3 text-xs">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                            <StoreIcon className="h-4 w-4 text-emerald-600" />
                                            {order.store?.slug ? (
                                                <Link
                                                    href={`/toko/${order.store.slug}`}
                                                    className="hover:text-emerald-600 transition flex items-center gap-1"
                                                >
                                                    <span>{order.store.name}</span>
                                                    <ExternalLink className="h-3 w-3 text-gray-400" />
                                                </Link>
                                            ) : (
                                                <span>{order.store?.name || 'Toko'}</span>
                                            )}
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <span className="font-mono text-gray-600 font-medium">
                                            #{order.sub_order_number}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-gray-500">{formatDate(order.created_at)}</span>
                                    </div>

                                    <div>{getStatusBadge(order.status)}</div>
                                </div>

                                {/* Items & Details */}
                                <div className="p-5">
                                    <div className="space-y-3">
                                        {order.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-3"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">
                                                            {item.product_title}
                                                        </p>
                                                        {item.sku_combination && (
                                                            <p className="text-xs text-gray-500">
                                                                Varian: {item.sku_combination}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {item.quantity} barang × {formatRupiah(item.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right font-semibold text-gray-900 text-sm">
                                                    <div>{formatRupiah(item.total_price)}</div>
                                                    {order.status === 'completed' && (
                                                        <div className="mt-2 flex justify-end">
                                                            {item.review ? (
                                                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                                                                    <Check className="h-3 w-3" />
                                                                    Sudah Diulas
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedItemForReview(item)}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#03ac0e] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#03ac0e] hover:bg-emerald-50 transition cursor-pointer"
                                                                >
                                                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                    Beri Ulasan
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tracking Number Section */}
                                    {order.tracking_number && (
                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2.5 text-xs text-indigo-950">
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-indigo-600" />
                                                <span>
                                                    Kurir: <strong>{order.courier_name.toUpperCase()} ({order.courier_service})</strong>
                                                </span>
                                                <span className="text-indigo-200">|</span>
                                                <span>
                                                    Resi: <strong className="font-mono">{order.tracking_number}</strong>
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(order.tracking_number || '')}
                                                className="flex items-center gap-1 rounded bg-white px-2 py-1 font-semibold text-indigo-700 shadow-2xs border border-indigo-200 hover:bg-indigo-50"
                                            >
                                                <Copy className="h-3 w-3" />
                                                {copiedTracking === order.tracking_number ? 'Disalin' : 'Salin'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Footer / Total & Actions */}
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                                        <div className="text-xs">
                                            <span className="text-gray-500">Total Belanja Toko Ini: </span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {formatRupiah(order.total_amount)}
                                            </span>
                                            <span className="text-gray-400 text-[11px] ml-1">
                                                (termasuk ongkir {formatRupiah(order.shipping_cost)})
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {canComplete && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCompleteModal(order)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Pesanan Diterima & Selesai
                                                </button>
                                            )}

                                            {(order.status === 'delivered' || order.status === 'shipped') && (
                                                <Link
                                                    href={`/orders/${order.id}/dispute`}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100/70 transition"
                                                >
                                                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                                                    Ajukan Komplain
                                                </Link>
                                            )}

                                            {order.status === 'complaint' && (
                                                <Link
                                                    href={`/disputes/${order.dispute_ticket?.id || order.dispute?.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
                                                >
                                                    <ShieldAlert className="h-4 w-4 text-amber-700" />
                                                    Lihat Tiket Komplain
                                                </Link>
                                            )}

                                            {order.status === 'completed' && (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    Pesanan Telah Selesai
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Dialog Konfirmasi Penerimaan Barang */}
            {selectedOrderForComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                                <CheckCircle2 className="h-6 w-6" />
                                <h3>Konfirmasi Pesanan Diterima</h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseCompleteModal}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-gray-600">
                            <p>
                                Anda akan mengonfirmasi penerimaan barang untuk pesanan{' '}
                                <strong className="text-gray-900 font-mono">
                                    #{selectedOrderForComplete.sub_order_number}
                                </strong>{' '}
                                dari toko{' '}
                                <strong className="text-gray-900">
                                    {selectedOrderForComplete.store?.name}
                                </strong>.
                            </p>

                            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-900 flex items-start gap-2.5">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-amber-950">Penting diperhatikan:</p>
                                    <p className="mt-0.5">
                                        Pastikan paket telah sampai dan barang dalam kondisi baik. Setelah dikonfirmasi, dana penjualan sebesar{' '}
                                        <strong>{formatRupiah(selectedOrderForComplete.items_subtotal)}</strong>{' '}
                                        akan otomatis dicairkan ke saldo toko penjual.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseCompleteModal}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleConfirmComplete}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                                {isSubmitting ? 'Memproses...' : 'Ya, Barang Sudah Diterima'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ulasan Produk Terverifikasi */}
            {selectedItemForReview && (
                <ReviewFormModal
                    isOpen={!!selectedItemForReview}
                    onClose={() => setSelectedItemForReview(null)}
                    subOrderItem={selectedItemForReview}
                    onSuccess={() => setSelectedItemForReview(null)}
                />
            )}
        </div>
    );
}
