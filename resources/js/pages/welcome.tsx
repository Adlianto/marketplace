import { Head, Link, router, useRemember } from '@inertiajs/react';
import { MoreHorizontal, ShoppingCart, Share2, Check } from 'lucide-react';
import {
    useState,
    useEffect,
    useRef,
    useCallback,
    lazy,
    Suspense,
} from 'react';
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

export default function Welcome({
    products,
    categories,
    filters,
}: WelcomeProps) {
    const [search, setSearch] = useRemember(
        filters.search || '',
        'welcome-search',
    );
    const [activeBanner, setActiveBanner] = useState(0);
    const [activeTopupTab, setActiveTopupTab] = useState('Pulsa');
    const [phoneNumber, setPhoneNumber] = useState('0123456789');

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const [allProducts, setAllProducts] = useState<ProductItem[]>(
        products?.data || [],
    );
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(
        products?.next_page_url || null,
    );

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [visibleCount, setVisibleCount] = useRemember(
        12,
        'welcome-visible-count',
    );
    const [hasAutoScrolled, setHasAutoScrolled] = useRemember(
        false,
        'welcome-autoscroll-flag',
    );
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
            { threshold: 0.1 },
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
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
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
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onFinish: () => setIsLoading(false),
                    },
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
                    const newProductsData = page.props
                        .products as PaginatedData<ProductItem>;

                    setTimeout(() => {
                        setAllProducts((prev) => [
                            ...prev,
                            ...(newProductsData?.data || []),
                        ]);
                        setNextPageUrl(newProductsData?.next_page_url || null);
                        setVisibleCount(
                            (prev) =>
                                prev + (newProductsData?.data?.length || 0),
                        );
                        setIsLoadingMore(false);
                    }, 400);
                },
                onError: () => setIsLoadingMore(false),
            },
        );
    };

    const handleAddToCart = useCallback(
        (e: React.MouseEvent, productId: number) => {
            e.stopPropagation();
            e.preventDefault();

            router.post(
                '/cart',
                {
                    product_id: productId,
                    quantity: 1,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    showProgress: false,
                },
            );

            setOpenMenuId(null);
        },
        [],
    );

    const handleShareProduct = useCallback(
        (e: React.MouseEvent, productId: number) => {
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
        },
        [],
    );

    const displayedProducts = allProducts.slice(0, visibleCount);

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-800 antialiased">
            <Head title="Marketplace" />

            <Navbar searchQuery={search} onSearchChange={setSearch} />

            <main className="mx-auto w-full max-w-[1240px] flex-1 space-y-6 bg-white px-4 py-5 lg:px-6">
                {/* Banner Promo Utama */}
                <div className="group relative aspect-[24/9] overflow-hidden rounded-md bg-slate-900 shadow-xs sm:aspect-[30/9]">
                    {BANNERS.map((banner, idx) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 flex items-center justify-between bg-gradient-to-r p-6 transition-opacity duration-500 ease-out sm:p-9 ${banner.bg} text-white ${
                                activeBanner === idx
                                    ? 'z-10 opacity-100'
                                    : 'pointer-events-none z-0 opacity-0'
                            }`}
                        >
                            <div className="z-10 max-w-md space-y-1.5">
                                <span className="inline-block rounded bg-white/20 px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider uppercase backdrop-blur-md">
                                    {banner.badge}
                                </span>
                                <h2 className="text-xl leading-tight font-black sm:text-2xl">
                                    {banner.title}
                                </h2>
                                <p className="line-clamp-1 text-xs font-medium text-white/90 sm:text-[13px]">
                                    {banner.subtitle}
                                </p>
                                <button className="mt-2.5 cursor-pointer rounded-md bg-white px-4 py-1.5 text-xs font-bold text-[#03ac0e] shadow-sm transition hover:bg-slate-100">
                                    Cek Sekarang
                                </button>
                            </div>

                            <div className="relative hidden h-full w-[45%] sm:block">
                                <img
                                    src={banner.img}
                                    alt={banner.title}
                                    width={500}
                                    height={200}
                                    loading={idx === 0 ? 'eager' : 'lazy'}
                                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                                    decoding="async"
                                    className="h-full w-full rounded-md border border-white/20 object-cover shadow-md"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() =>
                            setActiveBanner((prev) =>
                                prev === 0 ? BANNERS.length - 1 : prev - 1,
                            )
                        }
                        aria-label="Banner Sebelumnya"
                        className="absolute top-1/2 left-3 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-slate-800 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
                    >
                        <svg
                            className="h-4 w-4 text-slate-700"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <button
                        onClick={() =>
                            setActiveBanner(
                                (prev) => (prev + 1) % BANNERS.length,
                            )
                        }
                        aria-label="Banner Selanjutnya"
                        className="absolute top-1/2 right-3 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-slate-800 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
                    >
                        <svg
                            className="h-4 w-4 text-slate-700"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>

                {/* Kategori Populer dan Top Up */}
                <div className="space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-3">
                            <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                                Kategori Populer
                            </h3>
                            <div className="relative flex min-h-[140px] items-center justify-between overflow-hidden rounded-md bg-gradient-to-r from-[#219653] to-[#27ae60] p-5 text-white">
                                <div className="z-10 max-w-[200px] space-y-1.5">
                                    <h4 className="text-sm leading-tight font-extrabold">
                                        Spesial Rakit PC & Laptop
                                    </h4>
                                    <p className="text-[11px] text-white/90">
                                        10.000+ Komponen Resmi & Garansi
                                        Distributor
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                                    Top Up & Tagihan
                                </h3>
                                <a
                                    href="#"
                                    className="text-xs font-bold text-[#03ac0e] hover:underline"
                                >
                                    Lihat Semua
                                </a>
                            </div>

                            <div className="space-y-3 rounded-md border border-slate-200 p-3.5">
                                <div className="flex scrollbar-none items-center gap-4 overflow-x-auto border-b border-slate-100 pb-2 text-xs font-bold text-slate-500">
                                    {TOPUP_TABS.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() =>
                                                setActiveTopupTab(tab)
                                            }
                                            className={`cursor-pointer pb-1 whitespace-nowrap transition ${
                                                activeTopupTab === tab
                                                    ? 'border-b-2 border-[#03ac0e] text-[#03ac0e]'
                                                    : 'hover:text-slate-800'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 items-end gap-2.5 pt-1 sm:grid-cols-3">
                                    <div className="space-y-1 sm:col-span-1">
                                        <label
                                            htmlFor="phone-input"
                                            className="text-[11px] font-semibold text-slate-500"
                                        >
                                            Nomor Telepon
                                        </label>
                                        <input
                                            id="phone-input"
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) =>
                                                setPhoneNumber(e.target.value)
                                            }
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#03ac0e] focus:outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1 sm:col-span-1">
                                        <label
                                            htmlFor="nominal-select"
                                            className="text-[11px] font-semibold text-slate-500"
                                        >
                                            Nominal
                                        </label>
                                        <select
                                            id="nominal-select"
                                            className="w-full cursor-pointer rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#03ac0e] focus:outline-none"
                                        >
                                            <option value="">
                                                Pilih Nominal
                                            </option>
                                            <option value="50000">
                                                Rp50.000
                                            </option>
                                            <option value="100000">
                                                Rp100.000
                                            </option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <button className="w-full cursor-pointer rounded-md bg-[#e4e7ea] py-1.5 text-xs font-bold text-slate-400 transition hover:bg-[#03ac0e] hover:text-white">
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
                    <div className="sticky top-16 z-30 flex scrollbar-none gap-2 overflow-x-auto border-b border-slate-100 bg-white py-2">
                        <button
                            onClick={() => handleCategoryChange('semua')}
                            className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shadow-xs transition ${
                                filters.category === 'semua'
                                    ? 'bg-[#03ac0e] text-white'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shadow-xs transition ${
                                    filters.category === cat.slug
                                        ? 'bg-[#03ac0e] text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <ProductSkeleton key={index} />
                            ))}
                        </div>
                    ) : displayedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {displayedProducts.map((item) => {
                                    const isMenuOpen = openMenuId === item.id;
                                    const isCopied = copiedId === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className="group relative flex flex-col justify-between overflow-visible rounded-md border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                                        >
                                            <Link
                                                href={`/products/${item.id}`}
                                                className="block flex flex-1 cursor-pointer flex-col justify-between"
                                            >
                                                {/* Gambar Produk */}
                                                <div className="relative aspect-square overflow-hidden rounded-t-md bg-slate-100">
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        width={200}
                                                        height={200}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    {item.discount && (
                                                        <div className="absolute top-0 left-0 rounded-br-md bg-[#ef144a] px-2 py-0.5 text-[10.5px] font-black text-white">
                                                            {item.discount}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Informasi Produk */}
                                                <div className="flex flex-1 flex-col justify-between space-y-1 p-2.5">
                                                    <h3 className="line-clamp-2 h-[32px] text-xs leading-4 text-slate-800">
                                                        {item.title}
                                                    </h3>

                                                    <div>
                                                        <p className="text-[13px] leading-tight font-extrabold text-slate-900">
                                                            Rp
                                                            {formatRupiah(
                                                                item.price,
                                                            )}
                                                        </p>

                                                        <div className="flex h-4 items-center">
                                                            {item.discount &&
                                                            item.original_price ? (
                                                                <span className="text-[10px] text-slate-400 line-through">
                                                                    Rp
                                                                    {formatRupiah(
                                                                        item.original_price,
                                                                    )}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <div className="flex h-4 items-center">
                                                        <span className="text-[10px] font-bold text-[#f26522]">
                                                            Hemat s.d 3% Pakai
                                                            Bonus
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1 pt-0.5 text-[11px] text-slate-500">
                                                        <span className="font-bold text-amber-400">
                                                            ★ {item.rating}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="text-[10.5px]">
                                                            {item.sold_count}{' '}
                                                            terjual
                                                        </span>
                                                    </div>

                                                    <div className="relative flex items-center justify-between gap-1 border-t border-slate-100 pt-1.5 text-[11px]">
                                                        <div className="relative h-4 flex-1 overflow-hidden text-slate-500">
                                                            <div className="transition-transform duration-200 ease-out group-hover:-translate-y-4">
                                                                <p className="h-4 truncate leading-4 font-semibold text-slate-700">
                                                                    Official
                                                                    Store
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
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    setOpenMenuId(
                                                                        isMenuOpen
                                                                            ? null
                                                                            : item.id,
                                                                    );
                                                                }}
                                                                className={`shrink-0 cursor-pointer rounded p-1 transition ${
                                                                    isMenuOpen
                                                                        ? 'bg-emerald-50 text-[#03ac0e]'
                                                                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                                                                }`}
                                                            >
                                                                <MoreHorizontal
                                                                    size={14}
                                                                />
                                                            </button>

                                                            {isMenuOpen && (
                                                                <div
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                    className="absolute right-0 bottom-full z-40 mb-1.5 w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            handleAddToCart(
                                                                                e,
                                                                                item.id,
                                                                            )
                                                                        }
                                                                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#03ac0e]"
                                                                    >
                                                                        <ShoppingCart
                                                                            size={
                                                                                13
                                                                            }
                                                                            className="text-[#03ac0e]"
                                                                        />
                                                                        +
                                                                        Keranjang
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            handleShareProduct(
                                                                                e,
                                                                                item.id,
                                                                            )
                                                                        }
                                                                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                                                                    >
                                                                        {isCopied ? (
                                                                            <>
                                                                                <Check
                                                                                    size={
                                                                                        13
                                                                                    }
                                                                                    className="text-emerald-500"
                                                                                />
                                                                                <span className="font-bold text-emerald-600">
                                                                                    Tersalin!
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Share2
                                                                                    size={
                                                                                        13
                                                                                    }
                                                                                    className="text-blue-500"
                                                                                />
                                                                                Salin
                                                                                Link
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
                                        <ProductSkeleton
                                            key={`loadmore-${idx}`}
                                        />
                                    ))}
                            </div>

                            {!hasAutoScrolled && (
                                <div ref={triggerRef} className="h-10 w-full" />
                            )}
                        </>
                    ) : (
                        <div className="py-16 text-center text-slate-400">
                            <p className="text-sm font-semibold">
                                Tidak ada produk yang ditemukan.
                            </p>
                        </div>
                    )}

                    {hasAutoScrolled && nextPageUrl && (
                        <div className="pt-4 pb-2 text-center">
                            <button
                                disabled={isLoadingMore}
                                onClick={handleLoadMore}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#03ac0e] bg-white px-8 py-2.5 text-xs font-bold text-[#03ac0e] shadow-xs transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <svg
                                            className="h-4 w-4 animate-spin text-[#03ac0e]"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
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

            <Suspense
                fallback={
                    <div className="bg-slate-50 py-10 text-center text-xs text-slate-400">
                        Memuat footer...
                    </div>
                }
            >
                <Footer />
            </Suspense>
        </div>
    );
}
