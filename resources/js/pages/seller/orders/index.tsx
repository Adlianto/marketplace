import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Copy,
    Package,
    Search,
    Send,
    Truck,
    X,
    XCircle,
    AlertCircle,
    Store as StoreIcon,
} from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { PaginatedData, Store, SubOrder } from '@/types';

interface OrderCounts {
    all: number;
    paid: number;
    processing: number;
    shipped: number;
    completed: number;
    cancelled: number;
}

interface SellerOrdersProps {
    store: Store;
    orders: PaginatedData<SubOrder>;
    current_status: string;
    counts: OrderCounts;
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

export default function SellerOrders({
    store,
    orders,
    current_status = 'all',
    counts,
}: SellerOrdersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderForShip, setSelectedOrderForShip] = useState<SubOrder | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shipError, setShipError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

    const tabs = [
        { key: 'all', label: 'Semua', count: counts.all },
        { key: 'paid', label: 'Perlu Diproses', count: counts.paid },
        { key: 'processing', label: 'Sedang Diproses', count: counts.processing },
        { key: 'shipped', label: 'Sedang Dikirim', count: counts.shipped },
        { key: 'completed', label: 'Selesai', count: counts.completed },
        { key: 'cancelled', label: 'Dibatalkan', count: counts.cancelled },
    ];

    const handleAcceptOrder = (orderId: number) => {
        setIsSubmitting(true);
        router.post(
            `/seller/orders/${orderId}/accept`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleOpenShipModal = (order: SubOrder) => {
        setSelectedOrderForShip(order);
        setTrackingNumber('');
        setShipError(null);
    };

    const handleCloseShipModal = () => {
        setSelectedOrderForShip(null);
        setTrackingNumber('');
        setShipError(null);
    };

    const handleSubmitShip = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderForShip) return;

        const cleanTracking = trackingNumber.trim();
        if (!cleanTracking) {
            setShipError('Nomor resi wajib diisi.');
            return;
        }

        if (cleanTracking.length < 5) {
            setShipError('Nomor resi minimal 5 karakter.');
            return;
        }

        if (!/^[A-Z0-9-]+$/i.test(cleanTracking)) {
            setShipError('Nomor resi hanya boleh berisi huruf, angka, dan tanda hubung (-).');
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/seller/orders/${selectedOrderForShip.id}/ship`,
            { tracking_number: cleanTracking },
            {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseShipModal();
                },
                onError: (errors) => {
                    if (errors.tracking_number) {
                        setShipError(errors.tracking_number);
                    } else {
                        setShipError('Gagal memperbarui nomor resi. Silakan coba lagi.');
                    }
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedNumber(text);
        setTimeout(() => setCopiedNumber(null), 2000);
    };

    const filteredOrders = orders.data.filter((order) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.sub_order_number.toLowerCase().includes(q);
        const matchesReceiver = order.address?.receiver.toLowerCase().includes(q) || false;
        const matchesTracking = order.tracking_number?.toLowerCase().includes(q) || false;
        return matchesNumber || matchesReceiver || matchesTracking;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Clock className="h-3.5 w-3.5" />
                        Perlu Diproses
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/20">
                        <Package className="h-3.5 w-3.5" />
                        Sedang Diproses
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/20">
                        <Truck className="h-3.5 w-3.5" />
                        Sedang Dikirim
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selesai
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
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
            <Head title={`Kelola Pesanan Masuk - ${store.name}`} />
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Navigation */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                            <Link
                                href="/seller/dashboard"
                                className="flex items-center gap-1 font-medium hover:text-emerald-600 transition"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Dashboard Toko
                            </Link>
                            <span>/</span>
                            <span className="text-slate-800 font-semibold">Pesanan Masuk</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Manajemen Pesanan Toko
                        </h1>
                        <p className="text-sm text-slate-500">
                            Proses pesanan pelanggan dan masukkan resi pengiriman untuk meneruskan pesanan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/seller/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                        >
                            <StoreIcon className="h-4 w-4 text-slate-500" />
                            Ringkasan Toko
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs ala Tokopedia */}
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        {tabs.map((tab) => {
                            const isActive = current_status === tab.key;
                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.key === 'all' ? '/seller/orders' : `/seller/orders?status=${tab.key}`}
                                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            isActive
                                                ? 'bg-emerald-700 text-white'
                                                : 'bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Search Field */}
                    <div className="relative min-w-[260px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor sub-order atau penerima..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                            <Package className="h-8 w-8" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800">
                            Tidak Ada Pesanan Ditemukan
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            {searchQuery
                                ? 'Tidak ada pesanan yang sesuai dengan kata kunci pencarian Anda.'
                                : 'Belum ada pesanan dengan status yang dipilih untuk toko ini.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                            >
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3.5 text-sm">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-mono font-bold text-slate-900">
                                            #{order.sub_order_number}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs text-slate-500">
                                            {formatDate(order.created_at)}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs font-medium uppercase tracking-wide text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            {order.courier_name} - {order.courier_service}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                        {/* Items Column */}
                                        <div className="space-y-4 lg:col-span-2">
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Item Pesanan
                                            </h4>
                                            <div className="space-y-3">
                                                {order.items?.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/40 p-3.5"
                                                    >
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-800 text-sm truncate">
                                                                {item.product_title}
                                                            </p>
                                                            {item.sku_combination && (
                                                                <p className="text-xs text-slate-500">
                                                                    Varian: {item.sku_combination}
                                                                </p>
                                                            )}
                                                            <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                                                                <span>{item.quantity} barang</span>
                                                                <span>×</span>
                                                                <span className="font-medium text-slate-800">
                                                                    {formatRupiah(item.price)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right font-semibold text-slate-900 text-sm">
                                                            {formatRupiah(item.total_price)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Tracking Number Display if Shipped */}
                                            {order.tracking_number && (
                                                <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-900">
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-4 w-4 text-indigo-600" />
                                                        <span>
                                                            No. Resi Pengiriman: <strong>{order.tracking_number}</strong>
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(order.tracking_number || '')}
                                                        className="flex items-center gap-1 rounded bg-white px-2 py-1 font-medium text-indigo-700 shadow-sm border border-indigo-200 hover:bg-indigo-50"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                        {copiedNumber === order.tracking_number ? 'Disalin' : 'Salin'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details & Actions Column */}
                                        <div className="flex flex-col justify-between border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                                            {/* Recipient Info */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Informasi Penerima
                                                </h4>
                                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs">
                                                    <p className="font-semibold text-slate-900">
                                                        {order.address?.receiver || order.user?.name}
                                                    </p>
                                                    <p className="text-slate-500 mt-0.5">
                                                        {order.address?.phone || '-'}
                                                    </p>
                                                    <p className="text-slate-600 mt-2 line-clamp-2">
                                                        {order.address?.full_address || '-'}
                                                    </p>
                                                    <p className="text-slate-500 font-medium mt-1">
                                                        {order.address?.label}
                                                    </p>
                                                </div>

                                                {/* Total Breakdown */}
                                                <div className="space-y-1.5 pt-2 text-xs">
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Subtotal Produk:</span>
                                                        <span>{formatRupiah(order.items_subtotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Ongkos Kirim ({order.courier_name}):</span>
                                                        <span>{formatRupiah(order.shipping_cost)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
                                                        <span>Total Pembayaran:</span>
                                                        <span className="text-emerald-600">
                                                            {formatRupiah(order.total_amount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons based on status */}
                                            <div className="mt-6 pt-4 border-t border-slate-100">
                                                {order.status === 'paid' && (
                                                    <button
                                                        type="button"
                                                        disabled={isSubmitting}
                                                        onClick={() => handleAcceptOrder(order.id)}
                                                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                                                    >
                                                        Terima Pesanan
                                                    </button>
                                                )}

                                                {order.status === 'processing' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenShipModal(order)}
                                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                        Input Resi & Kirim
                                                    </button>
                                                )}

                                                {order.status === 'shipped' && (
                                                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 text-center text-xs text-indigo-700 font-medium">
                                                        Pesanan sedang dalam pengantaran kurir.
                                                    </div>
                                                )}

                                                {order.status === 'completed' && (
                                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 text-center text-xs text-emerald-700 font-medium">
                                                        Pesanan telah diterima dan diselesaikan oleh pembeli.
                                                    </div>
                                                )}

                                                {order.status === 'cancelled' && (
                                                    <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-center text-xs text-rose-700 font-medium">
                                                        Pesanan telah dibatalkan.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {orders.data.length > 0 && (
                            <p className="text-xs text-slate-500">
                                Halaman {orders.current_page} dari {orders.last_page} (Total {orders.total} pesanan)
                            </p>
                        )}
                    </div>
                )}
            </main>

            {/* Modal Input Nomor Resi */}
            {selectedOrderForShip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-900">
                                <Truck className="h-5 w-5 text-indigo-600" />
                                <h3 className="text-lg font-bold">Input Resi Pengiriman</h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseShipModal}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mb-4 text-xs text-slate-500">
                            Masukkan nomor resi resmi dari kurir{' '}
                            <strong>
                                {selectedOrderForShip.courier_name.toUpperCase()} (
                                {selectedOrderForShip.courier_service})
                            </strong>{' '}
                            untuk pesanan #{selectedOrderForShip.sub_order_number}.
                        </p>

                        <form onSubmit={handleSubmitShip} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="tracking_number"
                                    className="mb-1 block text-xs font-semibold text-slate-700"
                                >
                                    Nomor Resi / AWB
                                </label>
                                <input
                                    type="text"
                                    id="tracking_number"
                                    name="tracking_number"
                                    autoFocus
                                    placeholder="Contoh: JNE0123456789"
                                    value={trackingNumber}
                                    onChange={(e) => {
                                        setTrackingNumber(e.target.value.toUpperCase());
                                        setShipError(null);
                                    }}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {shipError && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        <span>{shipError}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseShipModal}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Kirim Pesanan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
