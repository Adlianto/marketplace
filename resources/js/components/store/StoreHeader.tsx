import {
    Store as StoreIcon,
    MapPin,
    ShieldCheck,
    Award,
    Star,
    Package,
    Share2,
    MessageCircle,
} from 'lucide-react';
import type { Store } from '@/types';

interface StoreHeaderProps {
    store: Store;
    stats: {
        total_products: number;
        rating_avg: number;
    };
}

export default function StoreHeader({ store, stats }: StoreHeaderProps) {
    const handleShare = () => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            alert('Tautan toko berhasil disalin ke clipboard!');
        }
    };

    return (
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Store Banner */}
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-800 sm:h-52">
                {store.banner ? (
                    <img
                        src={store.banner}
                        alt={`${store.name} banner`}
                        className="h-full w-full object-cover opacity-90"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                )}
            </div>

            {/* Store Profile Bar */}
            <div className="relative px-6 pt-0 pb-6">
                <div className="-mt-12 mb-4 flex flex-col items-start justify-between gap-4 sm:-mt-16 md:flex-row md:items-end">
                    {/* Logo & Identity */}
                    <div className="flex items-end gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md sm:h-28 sm:w-28">
                            {store.logo ? (
                                <img
                                    src={store.logo}
                                    alt={store.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-600">
                                    <StoreIcon className="h-12 w-12" />
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                    {store.name}
                                </h1>

                                {store.is_official && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        <span>Official Store</span>
                                    </span>
                                )}

                                {store.power_merchant && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                        <Award className="h-3.5 w-3.5" />
                                        <span>Power Merchant</span>
                                    </span>
                                )}
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-medium text-slate-600">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Dikirim dari {store.city}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <strong className="font-bold text-slate-700">
                                        {stats.rating_avg}
                                    </strong>
                                    <span>Rating Toko</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Package className="h-3.5 w-3.5 text-slate-400" />
                                    <strong className="font-semibold text-slate-700">
                                        {stats.total_products}
                                    </strong>
                                    <span>Produk</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex w-full items-center gap-2 pt-2 md:w-auto md:pt-0">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 md:flex-initial"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Bagikan</span>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                alert(
                                    'Fitur chat dengan penjual akan segera tersedia.',
                                )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 md:flex-initial"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Chat Penjual</span>
                        </button>
                    </div>
                </div>

                {/* Bio / Description */}
                {store.description && (
                    <div className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-600">
                        <p>{store.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
