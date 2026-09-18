import { Head, Link } from '@inertiajs/react';
import {
    Store as StoreIcon,
    Package,
    ShoppingBag,
    Truck,
    Wallet,
    Settings,
    ExternalLink,
    Plus,
    CheckCircle2,
} from 'lucide-react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { Product, Store } from '@/types';

interface SellerDashboardProps {
    store: Store;
    metrics: {
        active_products_count: number;
        incoming_orders_count: number;
        orders_to_ship_count: number;
        wallet_balance: number;
    };
    recent_products: Product[];
}

const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
};

export default function SellerDashboard({
    store,
    metrics,
    recent_products = [],
}: SellerDashboardProps) {
    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
            <Head title={`Seller Dashboard - ${store.name}`} />
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Store Header Summary */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
                            {store.logo ? (
                                <img
                                    src={store.logo}
                                    alt={store.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <StoreIcon className="h-8 w-8 text-emerald-600" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900">
                                    {store.name}
                                </h1>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        store.status === 'active'
                                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border border-amber-200 bg-amber-50 text-amber-700'
                                    }`}
                                >
                                    {store.status === 'active'
                                        ? 'Toko Buka'
                                        : 'Toko Libur'}
                                </span>
                            </div>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <span>Gudang Asal:</span>
                                <strong className="font-semibold text-slate-700">
                                    {store.city}
                                </strong>
                                <span>•</span>
                                <span>Slug: /toko/{store.slug}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full items-center gap-2.5 md:w-auto">
                        <Link
                            href={`/toko/${store.slug}`}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 md:flex-initial"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Lihat Toko Publik</span>
                        </Link>
                        <Link
                            href="/seller/orders"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 md:flex-initial"
                        >
                            <Truck className="h-3.5 w-3.5" />
                            <span>Kelola Pesanan</span>
                        </Link>
                        <Link
                            href="/seller/settings"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:flex-initial"
                        >
                            <Settings className="h-3.5 w-3.5 text-slate-500" />
                            <span>Pengaturan Toko</span>
                        </Link>
                    </div>
                </div>

                {/* Performance Metric Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Active Products */}
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                Total Produk Aktif
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                {metrics.active_products_count}
                            </h3>
                            <span className="mt-1 inline-block text-[11px] text-emerald-600">
                                Siap diperjualbelikan
                            </span>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package className="h-6 w-6" />
                        </div>
                    </div>

                    {/* Incoming Orders */}
                    <Link
                        href="/seller/orders"
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md"
                    >
                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                Pesanan Masuk
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                {metrics.incoming_orders_count}
                            </h3>
                            <span className="mt-1 inline-block text-[11px] text-purple-600 font-medium">
                                Lihat semua pesanan &rarr;
                            </span>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                    </Link>

                    {/* Orders to Ship */}
                    <Link
                        href="/seller/orders?status=processing"
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
                    >
                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                Perlu Dikirim
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                {metrics.orders_to_ship_count}
                            </h3>
                            <span className="mt-1 inline-block text-[11px] text-amber-600 font-medium">
                                Masukkan resi &rarr;
                            </span>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Truck className="h-6 w-6" />
                        </div>
                    </Link>

                    {/* Wallet Balance */}
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                Saldo Dompet Toko
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                {formatRupiah(metrics.wallet_balance)}
                            </h3>
                            <span className="mt-1 inline-block text-[11px] text-emerald-600">
                                Siap ditarik
                            </span>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Wallet className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Quick Notice Banner */}
                <div className="mb-8 flex items-start gap-3.5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div className="space-y-1 text-xs text-slate-700">
                        <strong className="block text-sm font-semibold text-slate-900">
                            Gudang Logistik Asal Toko Aktif
                        </strong>
                        <p>
                            Alamat gudang asal penjemputan barang berlokasi di{' '}
                            <span className="font-semibold text-slate-800">
                                {store.origin_address}, {store.city} (
                                {store.postal_code})
                            </span>
                            . Kurir logistik Tokopedia-grade akan menggunakan
                            koordinat dan titik ini untuk kalkulasi ongkos
                            kirim.
                        </p>
                    </div>
                </div>

                {/* Catalog Overview Section */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 p-6">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Katalog Produk Terkini
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Produk yang terdaftar di bawah kendali toko Anda
                            </p>
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                            onClick={() =>
                                alert(
                                    'Fitur penambahan produk toko akan hadir di modul katalog.',
                                )
                            }
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Tambah Produk</span>
                        </button>
                    </div>

                    {recent_products.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {recent_products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 transition hover:bg-slate-50/50 sm:p-5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                            <img
                                                src={
                                                    product.image ||
                                                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
                                                }
                                                alt={product.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="line-clamp-1 text-sm font-semibold text-slate-800">
                                                {product.title}
                                            </h4>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                Stok:{' '}
                                                <span className="font-semibold text-slate-600">
                                                    {product.stock ?? 0}
                                                </span>{' '}
                                                • Harga:{' '}
                                                <span className="font-semibold text-emerald-600">
                                                    {formatRupiah(
                                                        product.price,
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                    >
                                        <span>Lihat PDP</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <Package className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                            <h4 className="text-sm font-semibold text-slate-700">
                                Belum ada produk di toko ini
                            </h4>
                            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
                                Mulai jual produk pertama Anda dan raih pembeli
                                dari seluruh penjuru Indonesia.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
