import { Head, Link, router, useRemember } from '@inertiajs/react';
import { MoreHorizontal, ShoppingCart, Share2, Check } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import Navbar from '@/components/navbar';
import ProductSkeleton from '@/components/productSkeleton';

const Footer = lazy(() => import('@/components/footer'));

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
        img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=720&auto=format&fit=crop&q=70',
    },
    {
        id: 2,
        title: 'Festival Laptop Gaming Spek Sultan',
        subtitle: 'Cashback Ekstra s.d Rp2.000.000 Bebas Ongkir',
        bg: 'from-blue-600 to-indigo-800',
        badge: 'LAPTOP DEALS',
        img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=720&auto=format&fit=crop&q=70',
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
    const [phoneNumber, setPhoneNumber] = useState('0123456789');

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const [allProducts, setAllProducts] = useState<ProductItem[]>(products?.data || []);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(products?.next_page_url || null);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [visibleCount, setVisibleCount] = useRemember(12, 'welcome-visible-count');
    const [hasAutoScrolled, setHasAutoScrolled] = useRemember(false, 'welcome-autoscroll-flag');
    const [isAutoLoading, setIsAutoLoading] = useState(false);
    const triggerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);

        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAllProducts(products?.data || []);
        setNextPageUrl(products?.next_page_url || null);
    }, [products]);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveBanner((prev) => (prev + 1) % BANNERS.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (hasAutoScrolled || isLoading || allProducts.length <= 12) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsAutoLoading(true);
                    setTimeout(() => {
                        setVisibleCount(18);
                        setHasAutoScrolled(true);
                        setIsAutoLoading(false);
                    }, 350);
                }
            },
            { threshold: 0.1 }
        );

        if (triggerRef.current) {
            observer.observe(triggerRef.current);
        }

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasAutoScrolled, isLoading, allProducts]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleLoadMore = () => {

        if (!nextPageUrl || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);

        router.get(
            nextPageUrl,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['products'],
                onSuccess: (page) => {
                    const newProductsData = (page.props.products as PaginatedData<ProductItem>);

                    setTimeout(() => {
                        setAllProducts((prev) => [...prev, ...(newProductsData?.data || [])]);
                        setNextPageUrl(newProductsData?.next_page_url || null);
                        setVisibleCount((prev) => prev + (newProductsData?.data?.length || 0));
                        setIsLoadingMore(false);
                    }, 400);
                },
                onError: () => setIsLoadingMore(false)
            }
        );
    };

    const handleAddToCart = useCallback((e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        e.preventDefault();

        router.post('/cart', {
            product_id: productId,
            quantity: 1
        }, {
            preserveScroll: true,
            preserveState: true,
            showProgress: false
        });

        setOpenMenuId(null);
    }, []);

    const handleShareProduct = useCallback((e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        e.preventDefault();
        const productUrl = `${window.location.origin}/products/${productId}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(productUrl).then(() => {
                setCopiedId(productId);
                setTimeout(() => {
                    setCopiedId(null);
                    setOpenMenuId(null);
                }, 1200);
            });
        }
    }, []);

    const displayedProducts = allProducts.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
            <Head title="Marketplace" />

            <Navbar searchQuery={search} onSearchChange={setSearch} />

            <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 lg:px-6 py-5 space-y-6 bg-white">

                {/* Banner Promo Utama */}
                <div className="group relative rounded-md overflow-hidden shadow-xs aspect-[24/9] sm:aspect-[30/9] bg-slate-900">
                    {BANNERS.map((banner, idx) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-500 ease-out flex items-center justify-between p-6 sm:p-9 bg-gradient-to-r ${banner.bg} text-white ${activeBanner === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
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
                                <button className="mt-2.5 px-4 py-1.5 bg-white text-[#03ac0e] font-bold text-xs rounded-md hover:bg-slate-100 transition shadow-sm cursor-pointer">
                                    Cek Sekarang
                                </button>
                            </div>

                            <div className="hidden sm:block w-[45%] h-full relative">
                                <img
                                    src={banner.img}
                                    alt={banner.title}
                                    width={500}
                                    height={200}
                                    loading={idx === 0 ? "eager" : "lazy"}
                                    fetchPriority={idx === 0 ? "high" : "auto"}
                                    decoding="async"
                                    className="w-full h-full object-cover rounded-md shadow-md border border-white/20"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setActiveBanner((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1))}
                        aria-label="Banner Sebelumnya"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-opacity duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setActiveBanner((prev) => (prev + 1) % BANNERS.length)}
                        aria-label="Banner Selanjutnya"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-opacity duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Kategori Populer dan Top Up */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Kategori Populer</h3>
                            <div className="relative rounded-md overflow-hidden bg-gradient-to-r from-[#219653] to-[#27ae60] p-5 text-white flex items-center justify-between min-h-[140px]">
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

                            <div className="border border-slate-200 rounded-md p-3.5 space-y-3">
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
                                        <label htmlFor="phone-input" className="text-[11px] font-semibold text-slate-500">Nomor Telepon</label>
                                        <input
                                            id="phone-input"
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#03ac0e]"
                                        />
                                    </div>

                                    <div className="space-y-1 sm:col-span-1">
                                        <label htmlFor="nominal-select" className="text-[11px] font-semibold text-slate-500">Nominal</label>
                                        <select
                                            id="nominal-select"
                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:border-[#03ac0e] cursor-pointer"
                                        >
                                            <option value="">Pilih Nominal</option>
                                            <option value="50000">Rp50.000</option>
                                            <option value="100000">Rp100.000</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <button className="w-full py-1.5 bg-[#e4e7ea] hover:bg-[#03ac0e] text-slate-400 hover:text-white font-bold text-xs rounded-md transition cursor-pointer">
                                            Beli
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Daftar Produk */}
                <div className="space-y-3.5 pt-2">
                    <div className="sticky top-16 z-30 bg-white py-2 flex gap-2 overflow-x-auto scrollbar-none border-b border-slate-100">
                        <button
                            onClick={() => handleCategoryChange('semua')}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-xs ${filters.category === 'semua' ? 'bg-[#03ac0e] text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`px-3.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-xs ${filters.category === cat.slug ? 'bg-[#03ac0e] text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
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
                                    const isMenuOpen = openMenuId === item.id;
                                    const isCopied = copiedId === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className="group bg-white rounded-md border border-slate-200 overflow-visible shadow-xs hover:shadow-md transition flex flex-col justify-between relative"
                                        >
                                            <Link href={`/products/${item.id}`} className="block cursor-pointer flex-1 flex flex-col justify-between">
                                                {/* Gambar Produk */}
                                                <div className="aspect-square bg-slate-100 overflow-hidden relative rounded-t-md">
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        width={200}
                                                        height={200}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {item.discount && (
                                                        <div className="absolute top-0 left-0 bg-[#ef144a] text-white text-[10.5px] font-black px-2 py-0.5 rounded-br-md">
                                                            {item.discount}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Informasi Produk */}
                                                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                                                    <h3 className="text-xs text-slate-800 line-clamp-2 leading-4 h-[32px]">
                                                        {item.title}
                                                    </h3>

                                                    <div>
                                                        <p className="text-[13px] font-extrabold text-slate-900 leading-tight">
                                                            Rp{formatRupiah(item.price)}
                                                        </p>

                                                        <div className="h-4 flex items-center">
                                                            {item.discount && item.original_price ? (
                                                                <span className="text-[10px] text-slate-400 line-through">
                                                                    Rp{formatRupiah(item.original_price)}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <div className="h-4 flex items-center">
                                                        <span className="text-[10px] font-bold text-[#f26522]">
                                                            Hemat s.d 3% Pakai Bonus
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
                                                        <span className="text-amber-400 font-bold">★ {item.rating}</span>
                                                        <span>•</span>
                                                        <span className="text-[10.5px]">{item.sold_count} terjual</span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-1 text-[11px] pt-1.5 border-t border-slate-100 relative">
                                                        <div className="h-4 overflow-hidden relative flex-1 text-slate-500">
                                                            <div className="transition-transform duration-200 ease-out group-hover:-translate-y-4">
                                                                <p className="h-4 truncate leading-4 font-semibold text-slate-700">
                                                                    Official Store
                                                                </p>
                                                                <p className="h-4 truncate leading-4 text-slate-500">
                                                                    {item.city}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                aria-label="Opsi lainnya"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    setOpenMenuId(isMenuOpen ? null : item.id);
                                                                }}
                                                                className={`p-1 rounded transition cursor-pointer shrink-0 ${
                                                                    isMenuOpen ? 'text-[#03ac0e] bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                <MoreHorizontal size={14} />
                                                            </button>

                                                           
                                                            {isMenuOpen && (
                                                                <div 
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="absolute bottom-full right-0 mb-1.5 w-36 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-40"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => handleAddToCart(e, item.id)}
                                                                        className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#03ac0e] flex items-center gap-2 transition cursor-pointer"
                                                                    >
                                                                        <ShoppingCart size={13} className="text-[#03ac0e]" />
                                                                        + Keranjang
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => handleShareProduct(e, item.id)}
                                                                        className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition cursor-pointer"
                                                                    >
                                                                        {isCopied ? (
                                                                            <>
                                                                                <Check size={13} className="text-emerald-500" />
                                                                                <span className="text-emerald-600 font-bold">Tersalin!</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Share2 size={13} className="text-blue-500" />
                                                                                Salin Link
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}

                                {isAutoLoading &&
                                    Array.from({ length: 6 }).map((_, idx) => (
                                        <ProductSkeleton key={`auto-${idx}`} />
                                    ))}

                                {isLoadingMore &&
                                    Array.from({ length: 12 }).map((_, idx) => (
                                        <ProductSkeleton key={`loadmore-${idx}`} />
                                    ))}
                            </div>

                            {!hasAutoScrolled && <div ref={triggerRef} className="h-10 w-full" />}
                        </>
                    ) : (
                        <div className="py-16 text-center text-slate-400">
                            <p className="text-sm font-semibold">Tidak ada produk yang ditemukan.</p>
                        </div>
                    )}

                    {hasAutoScrolled && nextPageUrl && (
                        <div className="pt-4 pb-2 text-center">
                            <button
                                disabled={isLoadingMore}
                                onClick={handleLoadMore}
                                className="px-8 py-2.5 bg-white border border-[#03ac0e] text-[#03ac0e] font-bold text-xs rounded-md hover:bg-emerald-50 transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-[#03ac0e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memuat Produk...
                                    </>
                                ) : (
                                    'Muat Lebih Banyak'
                                )}
                            </button>
                        </div>
                    )}
                </div>

            </main>

            <Suspense fallback={<div className="py-10 bg-slate-50 text-center text-slate-400 text-xs">Memuat footer...</div>}>
                <Footer />
            </Suspense>
        </div>
    );
}