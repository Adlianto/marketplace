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
            <div className="my-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">
                    Toko ini belum memiliki produk
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
                    Penjual belum menambahkan katalog barang ke etalase toko
                    ini. Silakan kembali lagi nanti!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Product Card Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-emerald-500 hover:shadow-md"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                            <img
                                src={
                                    item.image ||
                                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
                                }
                                alt={item.title}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {item.discount && (
                                <span className="absolute top-2 left-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {item.discount}%
                                </span>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                            <div>
                                <h3 className="line-clamp-2 text-xs leading-snug font-normal text-slate-800 transition group-hover:text-emerald-700 sm:text-sm">
                                    {item.title}
                                </h3>

                                <div className="mt-1.5">
                                    <span className="block text-xs font-bold text-slate-900 sm:text-sm">
                                        Rp{formatRupiah(item.price)}
                                    </span>

                                    {item.discount && item.original_price ? (
                                        <span className="text-[10px] text-slate-400 line-through">
                                            Rp
                                            {formatRupiah(item.original_price)}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-slate-700">
                                        {item.rating || 5.0}
                                    </span>
                                    <span>•</span>
                                    <span>{item.sold_count || 0} terjual</span>
                                </div>

                                {item.city && (
                                    <div className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                        <span className="max-w-[80px] truncate">
                                            {item.city}
                                        </span>
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
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Sebelumnya</span>
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="flex cursor-not-allowed items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400 opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Sebelumnya</span>
                        </button>
                    )}

                    <span className="px-2 text-xs font-medium text-slate-500">
                        Halaman {products.current_page} dari{' '}
                        {products.last_page}
                    </span>

                    {products.next_page_url ? (
                        <Link
                            href={products.next_page_url}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300"
                        >
                            <span>Berikutnya</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="flex cursor-not-allowed items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400 opacity-50"
                        >
                            <span>Berikutnya</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
