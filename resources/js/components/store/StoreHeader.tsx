import {
    Store as StoreIcon,
    MapPin,
    ShieldCheck,
    Award,
    Star,
    Package,
    Share2,
    MessageCircle,
    Calendar,
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            {/* Store Banner */}
            <div className="h-40 sm:h-52 w-full relative bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-800 overflow-hidden">
                {store.banner ? (
                    <img
                        src={store.banner}
                        alt={`${store.name} banner`}
                        className="w-full h-full object-cover opacity-90"
                    />
                ) : (
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                )}
            </div>

            {/* Store Profile Bar */}
            <div className="px-6 pb-6 pt-0 relative">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                    {/* Logo & Identity */}
                    <div className="flex items-end gap-4">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                            {store.logo ? (
                                <img
                                    src={store.logo}
                                    alt={store.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <StoreIcon className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{store.name}</h1>

                                {store.is_official && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Official Store</span>
                                    </span>
                                )}

                                {store.power_merchant && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                        <Award className="w-3.5 h-3.5" />
                                        <span>Power Merchant</span>
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                                <span className="flex items-center gap-1 text-slate-600 font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Dikirim dari {store.city}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <strong className="text-slate-700 font-bold">{stats.rating_avg}</strong>
                                    <span>Rating Toko</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Package className="w-3.5 h-3.5 text-slate-400" />
                                    <strong className="text-slate-700 font-semibold">{stats.total_products}</strong>
                                    <span>Produk</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex-1 md:flex-initial px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Bagikan</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => alert('Fitur chat dengan penjual akan segera tersedia.')}
                            className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat Penjual</span>
                        </button>
                    </div>
                </div>

                {/* Bio / Description */}
                {store.description && (
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                        <p>{store.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
