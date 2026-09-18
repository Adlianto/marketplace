import { Head } from '@inertiajs/react';
import { Package, Grid } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import StoreHeader from '@/components/store/StoreHeader';
import StoreProductGrid from '@/components/store/StoreProductGrid';
import type { PaginatedData, Product, Store } from '@/types';

interface StoreShowProps {
    store: Store;
    products: PaginatedData<Product>;
    stats: {
        total_products: number;
        rating_avg: number;
    };
}

export default function StoreShow({ store, products, stats }: StoreShowProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'latest'>('all');

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
            <Head title={`${store.name} - Marketplace`} />
            <Navbar />

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
                {/* Store Profile Header */}
                <StoreHeader store={store} stats={stats} />

                {/* Store Catalog Section */}
                <div className="space-y-4">
                    {/* Navigation Tabs Bar */}
                    <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    activeTab === 'all'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <Grid className="w-3.5 h-3.5" />
                                <span>Semua Produk ({stats.total_products})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('latest')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    activeTab === 'latest'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <Package className="w-3.5 h-3.5" />
                                <span>Produk Terbaru</span>
                            </button>
                        </div>

                        <div className="text-xs text-slate-500 hidden sm:block">
                            Menampilkan etalase resmi <strong className="text-slate-700">{store.name}</strong>
                        </div>
                    </div>

                    {/* Catalog Grid */}
                    <StoreProductGrid products={products} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
