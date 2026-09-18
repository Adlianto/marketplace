import { Link } from '@inertiajs/react';
import { Package, Star, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { PaginatedData, Product } from '@/types';

interface StoreProductGridProps {
    products: PaginatedData<Product>;
}

const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;

    return new Intl.NumberFormat('id-ID').format(num || 0);
};

export default function StoreProductGrid({ products }: StoreProductGridProps) {
    const items = products.data || [];

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Toko ini belum memiliki produk</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Penjual belum menambahkan katalog barang ke etalase toko ini. Silakan kembali lagi nanti!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Product Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        className="group flex flex-col bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                            <img
                                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                                alt={item.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {item.discount && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {item.discount}%
                                </span>
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                            <div>
                                <h3 className="text-xs sm:text-sm font-normal text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                                    {item.title}
                                </h3>

                                <div className="mt-1.5">
                                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                                        Rp{formatRupiah(item.price)}
                                    </span>

                                    {item.discount && item.original_price ? (
                                        <span className="text-[10px] text-slate-400 line-through">
                                            Rp{formatRupiah(item.original_price)}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-slate-700">{item.rating || 5.0}</span>
                                    <span>•</span>
                                    <span>{item.sold_count || 0} terjual</span>
                                </div>

                                {item.city && (
                                    <div className="flex items-center gap-0.5 text-slate-400 text-[10px]">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        <span className="truncate max-w-[80px]">{item.city}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {products.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    {products.prev_page_url ? (
                        <Link
                            href={products.prev_page_url}
                            className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1 transition"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Sebelumnya</span>
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-400 flex items-center gap-1 cursor-not-allowed opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Sebelumnya</span>
                        </button>
                    )}

                    <span className="text-xs text-slate-500 font-medium px-2">
                        Halaman {products.current_page} dari {products.last_page}
                    </span>

                    {products.next_page_url ? (
                        <Link
                            href={products.next_page_url}
                            className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1 transition"
                        >
                            <span>Berikutnya</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-400 flex items-center gap-1 cursor-not-allowed opacity-50"
                        >
                            <span>Berikutnya</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
