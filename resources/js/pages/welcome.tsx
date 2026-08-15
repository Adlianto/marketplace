import { Head, router, useRemember } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProductSkeleton from '@/components/productSkeleton';

interface ProductItem {
    id: number;
    title: string;
    slug: string;
    price: number | string;
    original_price: number | string | null;
    discount: number | null;
    city: string;
    rating: number | string;
    sold_count: string;
    is_official: boolean;
    image: string;
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    total: number;
}

interface WelcomeProps {
    products: PaginatedData<ProductItem>;
    categories: CategoryItem[];
    filters: {
        search: string;
        category: string;
    };
}

const BANNERS = [
    {
        id: 1,
        title: 'Super Hardware & PC Day Diskon Hingga 50%',
        subtitle: 'RTX 40 Series & Gen 14th Intel Ready Stock',
        bg: 'from-emerald-600 to-teal-800',
        badge: 'PC MASTER RACE',
        img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&auto=format&fit=crop&q=80',
    },
    {
        id: 2,
        title: 'Festival Laptop Gaming Spek Sultan',
        subtitle: 'Cashback Ekstra s.d Rp2.000.000 Bebas Ongkir',
        bg: 'from-blue-600 to-indigo-800',
        badge: 'LAPTOP DEALS',
        img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=900&auto=format&fit=crop&q=80',
    },
];

const TOPUP_TABS = ['Pulsa', 'Paket Data', 'Listrik PLN', 'Roaming'];

const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID').format(num || 0);
};

export default function Welcome({ products, categories, filters }: WelcomeProps) {
    const [search, setSearch] = useRemember(filters.search || '', 'welcome-search');
    const [activeBanner, setActiveBanner] = useState(0);
    const [activeTopupTab, setActiveTopupTab] = useState('Pulsa');
    const [phoneNumber, setPhoneNumber] = useState('081234567890');
    const [wishlist, setWishlist] = useRemember<number[]>([], 'welcome-wishlist');
    const [cartCount, setCartCount] = useRemember(4, 'welcome-cart-count');

    const [visibleCount, setVisibleCount] = useRemember(12, 'welcome-visible-count');
    const [hasAutoScrolled, setHasAutoScrolled] = useRemember(false, 'welcome-autoscroll-flag');
    const [isLoading, setIsLoading] = useState(false);
    const [isAutoLoading, setIsAutoLoading] = useState(false);
    const triggerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveBanner((prev) => (prev + 1) % BANNERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (hasAutoScrolled || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsAutoLoading(true);
                    setTimeout(() => {
                        setVisibleCount(18);
                        setHasAutoScrolled(true);
                        setIsAutoLoading(false);
                    }, 400);
                }
            },
            { threshold: 0.1 }
        );

        if (triggerRef.current) {
            observer.observe(triggerRef.current);
        }

        return () => observer.disconnect();
    }, [hasAutoScrolled, isLoading, products]);

    const handleCategoryChange = (slug: string) => {
        setIsLoading(true);
        setVisibleCount(12);
        setHasAutoScrolled(false);
        router.get(
            '/',
            { search, category: slug },
            { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                setIsLoading(true);
                setVisibleCount(12);
                setHasAutoScrolled(false);
                router.get(
                    '/',
                    { search, category: filters.category },
                    { preserveState: true, preserveScroll: true, replace: true, onFinish: () => setIsLoading(false) }
                );
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const toggleWishlist = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setWishlist((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCartCount((prev) => prev + 1);
    };

    const displayedProducts = useMemo(() => {
        return products.data.slice(0, visibleCount);
    }, [products.data, visibleCount]);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
            <Head title="Situs Jual Beli Komponen PC & Laptop Terlengkap | Tokopedia" />

            <Navbar searchQuery={search} onSearchChange={setSearch} cartCount={cartCount} />

            <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 lg:px-6 py-5 space-y-6 bg-white">

                <div className="group relative rounded-2xl overflow-hidden shadow-xs aspect-[24/9] sm:aspect-[30/9] bg-slate-900">
                    {BANNERS.map((banner, idx) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-between p-6 sm:p-9 bg-gradient-to-r ${banner.bg} text-white ${activeBanner === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                        >
                            <div className="max-w-md space-y-1.5 z-10">
                                <span className="inline-block px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10.5px] font-extrabold tracking-wider uppercase">
                                    {banner.badge}
                                </span>
                                <h2 className="text-xl sm:text-2xl font-black leading-tight">
                                    {banner.title}
                                </h2>
                                <p className="text-xs sm:text-[13px] text-white/90 font-medium line-clamp-1">
                                    {banner.subtitle}
                                </p>
                                <button className="mt-2.5 px-4 py-1.5 bg-white text-[#03ac0e] font-bold text-xs rounded-lg hover:bg-slate-100 transition shadow-sm cursor-pointer">
                                    Cek Sekarang
                                </button>
                            </div>

                            <div className="hidden sm:block w-[45%] h-full relative">
                                <img
                                    src={banner.img}
                                    alt={banner.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover rounded-xl shadow-md border border-white/20"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setActiveBanner((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-opacity duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setActiveBanner((prev) => (prev + 1) % BANNERS.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-opacity duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Kategori Populer</h3>
                            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#219653] to-[#27ae60] p-5 text-white flex items-center justify-between min-h-[140px]">
                                <div className="space-y-1.5 z-10 max-w-[200px]">
                                    <h4 className="font-extrabold text-sm leading-tight">Spesial Rakit PC & Laptop</h4>
                                    <p className="text-[11px] text-white/90">10.000+ Komponen Resmi & Garansi Distributor</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Top Up & Tagihan</h3>
                                <a href="#" className="text-xs font-bold text-[#03ac0e] hover:underline">Lihat Semua</a>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-2 text-xs font-bold text-slate-500 overflow-x-auto scrollbar-none">
                                    {TOPUP_TABS.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTopupTab(tab)}
                                            className={`pb-1 cursor-pointer transition whitespace-nowrap ${activeTopupTab === tab ? 'text-[#03ac0e] border-b-2 border-[#03ac0e]' : 'hover:text-slate-800'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                    <div className="space-y-1 sm:col-span-1">
                                        <label className="text-[11px] font-semibold text-slate-500">Nomor Telepon</label>
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#03ac0e]"
                                        />
                                    </div>

                                    <div className="space-y-1 sm:col-span-1">
                                        <label className="text-[11px] font-semibold text-slate-500">Nominal</label>
                                        <select className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:border-[#03ac0e] cursor-pointer">
                                            <option value="">Pilih Nominal</option>
                                            <option value="50000">Rp50.000</option>
                                            <option value="100000">Rp100.000</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <button className="w-full py-1.5 bg-[#e4e7ea] hover:bg-[#03ac0e] text-slate-400 hover:text-white font-bold text-xs rounded-lg transition cursor-pointer">
                                            Beli
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3.5 pt-2">
                    <div className="sticky top-16 z-30 bg-white py-2 flex gap-2 overflow-x-auto scrollbar-none border-b border-slate-100">
                        <button
                            onClick={() => handleCategoryChange('semua')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-xs ${filters.category === 'semua' ? 'bg-[#03ac0e] text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            Semua ({products.total || 0})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-xs ${filters.category === cat.slug ? 'bg-[#03ac0e] text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <ProductSkeleton key={index} />
                            ))}
                        </div>
                    ) : displayedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {displayedProducts.map((item) => {
                                    const isLiked = wishlist.includes(item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="aspect-square bg-slate-100 overflow-hidden relative">
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="p-2.5 space-y-1">
                                                    <h3 className="text-xs text-slate-800 line-clamp-2 leading-tight group-hover:text-[#03ac0e] transition">
                                                        {item.title}
                                                    </h3>

                                                    <div>
                                                        <p className="text-[13px] font-extrabold text-slate-900 leading-tight">
                                                            Rp{formatRupiah(item.price)}
                                                        </p>

                                                        {item.discount && item.original_price && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className="text-[9.5px] font-black text-[#ef144a] bg-red-50 px-1 py-0.2 rounded">
                                                                    {item.discount}%
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 line-through">
                                                                    Rp{formatRupiah(item.original_price)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
                                                        {item.is_official ? (
                                                            <span className="text-[9.5px] font-black text-purple-600 bg-purple-50 px-1 rounded">OS</span>
                                                        ) : (
                                                            <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">PM</span>
                                                        )}
                                                        <span className="truncate">{item.city}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-2.5 pb-2.5 pt-1.5 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-amber-500 font-bold">★ {item.rating}</span>
                                                    <span>•</span>
                                                    <span className="text-[10px]">Terjual {item.sold_count}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleWishlist(e, item.id)}
                                                        className={`p-1 rounded-md transition cursor-pointer ${isLiked ? 'text-[#ef144a] bg-red-50' : 'text-slate-400 hover:text-[#ef144a] hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleAddToCart}
                                                        className="p-1 text-slate-400 hover:text-[#03ac0e] hover:bg-emerald-50 rounded-md transition cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {isAutoLoading &&
                                    Array.from({ length: 6 }).map((_, idx) => (
                                        <ProductSkeleton key={`auto-${idx}`} />
                                    ))}
                            </div>

                            {!hasAutoScrolled && <div ref={triggerRef} className="h-10 w-full" />}
                        </>
                    ) : (
                        <div className="py-16 text-center text-slate-400">
                            <p className="text-sm font-semibold">Tidak ada produk yang ditemukan.</p>
                        </div>
                    )}

                    {hasAutoScrolled && products.next_page_url && (
                        <div className="pt-4 pb-2 text-center">
                            <button
                                onClick={() => router.get(products.next_page_url!, {}, { preserveState: true, preserveScroll: true })}
                                className="px-8 py-2 bg-white border border-[#03ac0e] text-[#03ac0e] font-bold text-xs rounded-lg hover:bg-emerald-50 transition shadow-xs cursor-pointer"
                            >
                                Muat Lebih Banyak
                            </button>
                        </div>
                    )}
                </div>

            </main>

            <Footer />
        </div>
    );
}