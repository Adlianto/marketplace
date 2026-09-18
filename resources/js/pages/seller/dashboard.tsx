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
    AlertCircle,
    CheckCircle2,
    Clock,
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

export default function SellerDashboard({ store, metrics, recent_products = [] }: SellerDashboardProps) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
            <Head title={`Seller Dashboard - ${store.name}`} />
            <Navbar />

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
                {/* Store Header Summary */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                            {store.logo ? (
                                <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                            ) : (
                                <StoreIcon className="w-8 h-8 text-emerald-600" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900">{store.name}</h1>
                                <span
                                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                        store.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                >
                                    {store.status === 'active' ? 'Toko Buka' : 'Toko Libur'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                <span>Gudang Asal:</span>
                                <strong className="text-slate-700 font-semibold">{store.city}</strong>
                                <span>•</span>
                                <span>Slug: /toko/{store.slug}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                        <Link
                            href={`/toko/${store.slug}`}
                            className="flex-1 md:flex-initial px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Lihat Toko Publik</span>
                        </Link>
                        <Link
                            href="/seller/settings"
                            className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Pengaturan Toko & Gudang</span>
                        </Link>
                    </div>
                </div>

                {/* Performance Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Active Products */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Produk Aktif</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.active_products_count}</h3>
                            <span className="text-[11px] text-emerald-600 mt-1 inline-block">Siap diperjualbelikan</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Incoming Orders */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Pesanan Masuk</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.incoming_orders_count}</h3>
                            <span className="text-[11px] text-slate-400 mt-1 inline-block">Total pesanan toko</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Orders to Ship */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Perlu Dikirim</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.orders_to_ship_count}</h3>
                            <span className="text-[11px] text-amber-600 mt-1 inline-block">Menunggu nomor resi</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Truck className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Wallet Balance */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Saldo Dompet Toko</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(metrics.wallet_balance)}</h3>
                            <span className="text-[11px] text-emerald-600 mt-1 inline-block">Siap ditarik</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Quick Notice Banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-8 flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 space-y-1">
                        <strong className="text-slate-900 font-semibold text-sm block">
                            Gudang Logistik Asal Toko Aktif
                        </strong>
                        <p>
                            Alamat gudang asal penjemputan barang berlokasi di{' '}
                            <span className="font-semibold text-slate-800">{store.origin_address}, {store.city} ({store.postal_code})</span>.
                            Kurir logistik Tokopedia-grade akan menggunakan koordinat dan titik ini untuk kalkulasi ongkos kirim.
                        </p>
                    </div>
                </div>

                {/* Catalog Overview Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Katalog Produk Terkini</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Produk yang terdaftar di bawah kendali toko Anda</p>
                        </div>
                        <button
                            type="button"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition"
                            onClick={() => alert('Fitur penambahan produk toko akan hadir di modul katalog.')}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Produk</span>
                        </button>
                    </div>

                    {recent_products.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {recent_products.map((product) => (
                                <div key={product.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                            <img
                                                src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{product.title}</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Stok: <span className="font-semibold text-slate-600">{product.stock ?? 0}</span> • Harga:{' '}
                                                <span className="font-semibold text-emerald-600">{formatRupiah(product.price)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                    >
                                        <span>Lihat PDP</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h4 className="text-sm font-semibold text-slate-700">Belum ada produk di toko ini</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Mulai jual produk pertama Anda dan raih pembeli dari seluruh penjuru Indonesia.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
