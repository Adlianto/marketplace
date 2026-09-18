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
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
            <Head title={`${store.name} - Marketplace`} />
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Store Profile Header */}
                <StoreHeader store={store} stats={stats} />

                {/* Store Catalog Section */}
                <div className="space-y-4">
                    {/* Navigation Tabs Bar */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                                    activeTab === 'all'
                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Grid className="h-3.5 w-3.5" />
                                <span>
                                    Semua Produk ({stats.total_products})
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('latest')}
                                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                                    activeTab === 'latest'
                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Package className="h-3.5 w-3.5" />
                                <span>Produk Terbaru</span>
                            </button>
                        </div>

                        <div className="hidden text-xs text-slate-500 sm:block">
                            Menampilkan etalase resmi{' '}
                            <strong className="text-slate-700">
                                {store.name}
                            </strong>
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
