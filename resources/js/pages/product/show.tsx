import { Head, Link, router } from '@inertiajs/react';
import {
    Star,
    Heart,
    Share2,
    Minus,
    Plus,
    ShoppingCart,
    MessageCircle,
    Check,
    ThumbsUp,
    MoreVertical,
    ChevronDown,
    X,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import SkuStockNotice from '@/components/product/SkuStockNotice';
import VariantSelector from '@/components/product/VariantSelector';
import ProductSkeleton from '@/components/productSkeleton';
import type { Product } from '@/types';

interface ProductShowProps {
    product: Product;
    relatedProducts: Product[];
}

function LazySection({
    children,
    minHeight = '400px',
}: {
    children: ReactNode;
    minHeight?: string;
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' },
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ minHeight: isVisible ? 'auto' : minHeight }}
            className="transition-opacity duration-500"
        >
            {isVisible && children}
        </div>
    );
}

function getInitialVariantOptions(product: Product): Record<string, string> {
    if (
        product?.has_variants &&
        product.variants &&
        product.variants.length > 0 &&
        product.skus &&
        product.skus.length > 0
    ) {
        const defaultSku =
            product.skus.find((s) => s.stock > 0) || product.skus[0];

        if (defaultSku) {
            const parts = defaultSku.combination_key.split('-');
            const initial: Record<string, string> = {};
            product.variants.forEach((v, index) => {
                if (parts[index]) {
                    initial[v.name] = parts[index];
                }
            });

            return initial;
        }
    }

    return {};
}

export default function ProductShow({
    product,
    relatedProducts,
}: ProductShowProps) {
    const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
        null,
    );
    const [modalData, setModalData] = useState<{
        images: string[];
        index: number;
    } | null>(null);

    const [quantity, setQuantity] = useState(1);
    const [isWishlist, setIsWishlist] = useState(false);
    const [activeTab, setActiveTab] = useState<'detail' | 'spesifikasi'>(
        'detail',
    );
    const [isCopiedMain, setIsCopiedMain] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [previewModalPhoto, setPreviewModalPhoto] = useState<string | null>(null);

    const hasVariants = Boolean(
        product?.has_variants &&
        product.variants &&
        product.variants.length > 0 &&
        product.skus &&
        product.skus.length > 0,
    );

    const [selectedOptions, setSelectedOptions] = useState<
        Record<string, string>
    >(() => getInitialVariantOptions(product));

    const [prevProductId, setPrevProductId] = useState(product?.id);

    if (product?.id !== prevProductId) {
        setPrevProductId(product?.id);
        setSelectedOptions(getInitialVariantOptions(product));
        setSelectedThumbnail(null);
    }

    const handleSelectOption = (variantName: string, optionValue: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [variantName]: optionValue,
        }));
        setSelectedThumbnail(null);
    };

    const isSelectionComplete = useMemo(() => {
        if (!hasVariants) {
            return true;
        }

        return product.variants!.every((v) => Boolean(selectedOptions[v.name]));
    }, [hasVariants, product.variants, selectedOptions]);

    const activeSku = useMemo(() => {
        if (!hasVariants || !isSelectionComplete || !product.skus) {
            return null;
        }

        const key = product
            .variants!.map((v) => selectedOptions[v.name])
            .join('-');

        return (
            product.skus.find(
                (s) => s.combination_key.toLowerCase() === key.toLowerCase(),
            ) ?? null
        );
    }, [
        hasVariants,
        isSelectionComplete,
        product.variants,
        product.skus,
        selectedOptions,
    ]);

    const activeImage =
        selectedThumbnail ||
        activeSku?.image ||
        product?.image ||
        'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80';

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const [visibleRelated, setVisibleRelated] = useState(6);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    const observer = useRef<IntersectionObserver | null>(null);
    const observerTarget = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoadingRelated) {
                return;
            }

            if (observer.current) {
                observer.current.disconnect();
            }

            observer.current = new IntersectionObserver((entries) => {
                if (
                    entries[0].isIntersecting &&
                    relatedProducts &&
                    visibleRelated < relatedProducts.length
                ) {
                    setIsLoadingRelated(true);
                    setTimeout(() => {
                        setVisibleRelated((prev) =>
                            Math.min(prev + 6, relatedProducts.length),
                        );
                        setIsLoadingRelated(false);
                    }, 600);
                }
            });

            if (node) {
                observer.current.observe(node);
            }
        },
        [isLoadingRelated, visibleRelated, relatedProducts],
    );

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);

        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const productImage =
        product?.image ||
        'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80';

    useEffect(() => {
        if (modalData) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [modalData]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);

        if (element) {
            const y =
                element.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handlePrevModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalData((prev) =>
            prev
                ? {
                      ...prev,
                      index:
                          prev.index === 0
                              ? prev.images.length - 1
                              : prev.index - 1,
                  }
                : null,
        );
    };

    const handleNextModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalData((prev) =>
            prev
                ? {
                      ...prev,
                      index:
                          prev.index === prev.images.length - 1
                              ? 0
                              : prev.index + 1,
                  }
                : null,
        );
    };

    const currentPrice = activeSku
        ? Number(activeSku.price)
        : Number(product?.price || 0);
    const currentOriginalPrice = activeSku?.original_price
        ? Number(activeSku.original_price)
        : product?.original_price
          ? Number(product.original_price)
          : null;

    const rawStock = hasVariants
        ? activeSku
            ? activeSku.stock
            : 0
        : (product?.stock ?? 143);
    const stock = Math.max(0, rawStock);

    const effectiveQuantity =
        stock <= 0 ? 0 : Math.min(Math.max(1, quantity), stock);

    const sold = product?.sold_count ?? 40;
    const ratingDisplay = product?.rating_avg ?? product?.rating ?? 5.0;
    const reviewsCount =
        product?.reviews_count ?? product?.reviews?.length ?? 0;

    const formatRupiah = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : Number(val);

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(isNaN(num) ? 0 : num);
    };

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (stock <= 0) {
            return;
        }

        if (type === 'inc') {
            setQuantity((prev) => Math.min(stock, prev + 1));
        } else if (type === 'dec') {
            setQuantity((prev) => Math.max(1, Math.min(stock, prev - 1)));
        }
    };

    const handleAddMainToCart = () => {
        if (!isSelectionComplete || stock <= 0) {
            return;
        }

        setIsAddingToCart(true);
        router.post(
            '/cart',
            {
                product_id: product.id,
                product_sku_id: activeSku?.id ?? null,
                quantity: Math.max(1, effectiveQuantity),
            },
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
                onFinish: () => setIsAddingToCart(false),
            },
        );
    };

    const handleBuyNow = () => {
        if (!isSelectionComplete || stock <= 0) {
            return;
        }

        setIsAddingToCart(true);
        router.post(
            '/cart',
            {
                product_id: product.id,
                product_sku_id: activeSku?.id ?? null,
                quantity: Math.max(1, effectiveQuantity),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit('/cart');
                },
                onFinish: () => setIsAddingToCart(false),
            },
        );
    };

    const handleShareMain = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopiedMain(true);
        setTimeout(() => setIsCopiedMain(false), 1500);
    };

    const handleAddToCartItem = (e: React.MouseEvent, productId: number) => {
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
    };

    const handleShareItem = (e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        e.preventDefault();
        const productUrl = `${window.location.origin}/products/${productId}`;
        navigator.clipboard.writeText(productUrl);
        setCopiedId(productId);
        setTimeout(() => {
            setCopiedId(null);
            setOpenMenuId(null);
        }, 1200);
    };

    const reviewPhotos = [
        'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
    ];

    const galleryImages = [
        productImage,
        'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    ];

    return (
        <div className="relative flex min-h-screen flex-col bg-white font-sans text-slate-800 antialiased">
            <Head title={product?.title || 'Detail Produk'} />

            {/* Modal preview gambar penuh */}
            {modalData && (
                <div
                    className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md select-none sm:p-8"
                    onClick={() => setModalData(null)}
                >
                    <button
                        type="button"
                        aria-label="Tutup preview"
                        onClick={() => setModalData(null)}
                        className="absolute top-6 right-6 z-[110] cursor-pointer rounded-full bg-black/40 p-2.5 text-white/80 transition hover:bg-black/60 hover:text-white"
                    >
                        <X size={22} />
                    </button>

                    {modalData.images.length > 1 && (
                        <button
                            type="button"
                            aria-label="Gambar sebelumnya"
                            onClick={handlePrevModal}
                            className="absolute top-1/2 left-4 z-[110] -translate-y-1/2 cursor-pointer rounded-full bg-black/40 p-3 text-white/80 transition hover:bg-black/60 hover:text-white sm:left-8"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    <div
                        className="relative flex h-auto max-h-[82vh] w-auto max-w-[85vw] items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={modalData.images[modalData.index]}
                            alt="Preview pembesaran gambar"
                            className="h-auto max-h-[82vh] w-auto max-w-full animate-in rounded-xl object-contain shadow-2xl duration-200 zoom-in-95 fade-in"
                        />
                    </div>

                    {modalData.images.length > 1 && (
                        <button
                            type="button"
                            aria-label="Gambar selanjutnya"
                            onClick={handleNextModal}
                            className="absolute top-1/2 right-4 z-[110] -translate-y-1/2 cursor-pointer rounded-full bg-black/40 p-3 text-white/80 transition hover:bg-black/60 hover:text-white sm:right-8"
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}
                </div>
            )}

            <Navbar />

            {/* Navigasi breadcrumb */}
            <div className="mx-auto flex w-full max-w-[1240px] items-center gap-1.5 border-b border-slate-100 px-4 py-3 text-[13px] text-slate-500">
                <Link href="/" className="hover:text-[#03ac0e]">
                    Home
                </Link>
                <span>/</span>
                <span className="text-slate-400">Komputer & Laptop</span>
                <span>/</span>
                <span className="text-slate-400">Komponen Komputer</span>
                <span>/</span>
                <span className="max-w-[280px] truncate font-semibold text-slate-800">
                    {product?.title}
                </span>
            </div>

            <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6">
                <div className="flex flex-col items-start gap-8 lg:flex-row">
                    {/* Area informasi produk */}
                    <div className="w-full flex-1 space-y-10">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-9">
                            {/* Galeri gambar dan thumbnail */}
                            <div className="space-y-4 md:col-span-4">
                                <div
                                    className="group relative flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                    onClick={() =>
                                        setModalData({
                                            images: galleryImages,
                                            index:
                                                galleryImages.indexOf(
                                                    activeImage,
                                                ) >= 0
                                                    ? galleryImages.indexOf(
                                                          activeImage,
                                                      )
                                                    : 0,
                                        })
                                    }
                                >
                                    <img
                                        src={activeImage}
                                        alt={product?.title}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                    <div className="pointer-events-none absolute right-3 bottom-3 rounded bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-600 opacity-0 shadow-sm backdrop-blur-sm transition group-hover:opacity-100">
                                        Klik untuk perbesar
                                    </div>
                                </div>

                                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                                    {galleryImages.map((img, i) => (
                                        <div
                                            key={i}
                                            onClick={() =>
                                                setSelectedThumbnail(img)
                                            }
                                            className={`h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 p-0.5 transition-all duration-200 ${
                                                activeImage === img
                                                    ? 'border-[#03ac0e] opacity-100'
                                                    : 'border-transparent opacity-60 hover:border-slate-300 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={img}
                                                alt="Thumbnail preview"
                                                className="h-full w-full rounded-lg object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ringkasan harga dan tab spesifikasi */}
                            <div className="space-y-5 md:col-span-5">
                                <div>
                                    <h1 className="text-lg leading-snug font-bold text-slate-900 sm:text-xl">
                                        {product?.title}
                                    </h1>
                                    <div className="mt-2 flex items-center gap-3 text-[13px] text-slate-600">
                                        <span>
                                            Terjual{' '}
                                            <strong className="text-slate-900">
                                                {sold}
                                            </strong>
                                        </span>
                                        <span className="text-slate-300">
                                            •
                                        </span>
                                        <button
                                            onClick={() =>
                                                scrollToSection('ulasan')
                                            }
                                            className="flex cursor-pointer items-center gap-1 transition hover:text-[#03ac0e]"
                                        >
                                            <Star
                                                size={14}
                                                className="fill-amber-400 text-amber-400"
                                            />
                                            <strong className="text-slate-900">
                                                {ratingDisplay}
                                            </strong>{' '}
                                            ({reviewsCount} rating)
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-3xl font-extrabold text-slate-900">
                                        {formatRupiah(currentPrice)}
                                    </div>
                                    {currentOriginalPrice &&
                                        currentOriginalPrice > currentPrice && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-600">
                                                    {Math.round(
                                                        ((currentOriginalPrice -
                                                            currentPrice) /
                                                            currentOriginalPrice) *
                                                            100,
                                                    )}
                                                    %
                                                </span>
                                                <span className="text-slate-400 line-through">
                                                    {formatRupiah(
                                                        currentOriginalPrice,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                </div>

                                {/* Multi-Dimension Variant Selector UI */}
                                {hasVariants &&
                                    product.variants &&
                                    product.skus && (
                                        <VariantSelector
                                            variants={product.variants}
                                            skus={product.skus}
                                            selectedOptions={selectedOptions}
                                            onSelectOption={handleSelectOption}
                                        />
                                    )}

                                <div className="flex gap-6 border-b border-slate-200 text-[13px] font-bold">
                                    <button
                                        onClick={() => setActiveTab('detail')}
                                        className={`cursor-pointer border-b-2 pb-2.5 transition ${activeTab === 'detail' ? 'border-[#03ac0e] text-[#03ac0e]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Detail Produk
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveTab('spesifikasi')
                                        }
                                        className={`cursor-pointer border-b-2 pb-2.5 transition ${activeTab === 'spesifikasi' ? 'border-[#03ac0e] text-[#03ac0e]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Spesifikasi
                                    </button>
                                </div>

                                <div
                                    id="detail"
                                    className="scroll-mt-24 space-y-3 pt-2 text-sm leading-relaxed text-slate-700"
                                >
                                    {activeTab === 'detail' && (
                                        <p className="whitespace-pre-line">
                                            {product?.description ||
                                                'Barang dijamin original, garansi resmi distributor. \n\nSilakan langsung diorder, stok terbatas!'}
                                        </p>
                                    )}

                                    {activeTab === 'spesifikasi' && (
                                        <div className="grid max-w-sm grid-cols-2 gap-y-2 text-[13px]">
                                            {product?.specifications &&
                                            product.specifications.length >
                                                0 ? (
                                                product.specifications.map(
                                                    (spek) => (
                                                        <div
                                                            key={spek.id}
                                                            className="contents"
                                                        >
                                                            <span className="text-slate-500">
                                                                {spek.name}:
                                                            </span>
                                                            <span className="font-semibold text-slate-900">
                                                                {spek.value}
                                                            </span>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <div className="col-span-2 text-slate-400 italic">
                                                    Spesifikasi belum
                                                    ditambahkan.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bagian ulasan pembeli */}
                        <div
                            id="ulasan"
                            className="scroll-mt-24 border-t border-slate-200 pt-8"
                        >
                            <LazySection minHeight="500px">
                                <h2 className="mb-6 text-base font-extrabold tracking-wider text-slate-900 uppercase">
                                    Ulasan Pembeli
                                </h2>

                                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                                    <div className="space-y-6 md:col-span-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-2">
                                                    <Star
                                                        size={36}
                                                        className="fill-amber-400 text-amber-400"
                                                    />
                                                    <span className="text-5xl font-black text-slate-900">
                                                        {ratingDisplay}
                                                        <span className="text-xl font-bold text-slate-400">
                                                            /5.0
                                                        </span>
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-[13px] font-bold text-slate-800">
                                                    100% pembeli merasa puas
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-500">
                                                    {reviewsCount} rating •{' '}
                                                    {reviewsCount} ulasan
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full space-y-1.5">
                                            {[5, 4, 3, 2, 1].map((star) => (
                                                <div
                                                    key={star}
                                                    className="flex items-center gap-2 text-[11px] font-bold text-slate-500"
                                                >
                                                    <Star
                                                        size={12}
                                                        className="fill-amber-400 text-amber-400"
                                                    />
                                                    <span className="w-2">
                                                        {star}
                                                    </span>
                                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className={`h-full ${star === 5 ? 'w-full bg-[#03ac0e]' : star === 4 ? 'w-1/4 bg-[#03ac0e]' : 'w-0 bg-slate-200'}`}
                                                        ></div>
                                                    </div>
                                                    <span className="w-4 text-right">
                                                        {star >= 4
                                                            ? Math.ceil(
                                                                  reviewsCount /
                                                                      (6 -
                                                                          star),
                                                              )
                                                            : '0'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                                            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500">
                                                Filter Ulasan
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {[
                                                    'Media',
                                                    'Rating',
                                                    'Topik Ulasan',
                                                ].map((filter) => (
                                                    <button
                                                        key={filter}
                                                        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-[13px] font-bold text-slate-800 transition hover:bg-slate-50"
                                                    >
                                                        {filter}{' '}
                                                        <ChevronDown
                                                            size={14}
                                                            className="text-slate-400"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8 md:col-span-8">
                                        <div>
                                            <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-800 uppercase">
                                                Foto & Video Pembeli
                                            </h3>
                                            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
                                                {reviewPhotos.map(
                                                    (src, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() =>
                                                                setModalData({
                                                                    images: reviewPhotos,
                                                                    index: idx,
                                                                })
                                                            }
                                                            className="relative h-20 w-20 shrink-0 cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 transition hover:opacity-80"
                                                        >
                                                            <img
                                                                src={src}
                                                                alt="Lampiran review"
                                                                className="h-full w-full object-cover"
                                                            />
                                                            {idx ===
                                                                reviewPhotos.length -
                                                                    1 && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-white">
                                                                    +2
                                                                </div>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                                                    Ulasan Pilihan
                                                </h3>
                                                <div className="flex items-center gap-2 text-[13px]">
                                                    <span className="text-slate-500">
                                                        Urutkan
                                                    </span>
                                                    <button className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 font-bold transition hover:bg-slate-50">
                                                        Paling Membantu{' '}
                                                        <ChevronDown
                                                            size={14}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {product?.reviews &&
                                                product.reviews.length > 0 ? (
                                                    product.reviews.map(
                                                        (rev) => {
                                                            const reviewDate =
                                                                new Date(
                                                                    rev.created_at,
                                                                ).toLocaleDateString(
                                                                    'id-ID',
                                                                    {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    },
                                                                );

                                                            return (
                                                                <div
                                                                    key={rev.id}
                                                                    className="border-b border-slate-100 pb-6"
                                                                >
                                                                    <div className="mb-2 flex items-start justify-between">
                                                                        <div className="flex gap-1 text-amber-400">
                                                                            {Array.from(
                                                                                {
                                                                                    length: rev.rating,
                                                                                },
                                                                            ).map(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) => (
                                                                                    <Star
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className="fill-current"
                                                                                    />
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[11px] text-slate-400">
                                                                            {
                                                                                reviewDate
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="mb-3 flex items-center gap-2">
                                                                        <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-100 bg-slate-200">
                                                                            <img
                                                                                src={
                                                                                    rev.user_avatar ||
                                                                                    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
                                                                                        rev.user_name ||
                                                                                            'User',
                                                                                    )}`
                                                                                }
                                                                                alt={
                                                                                    rev.user_name
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-[13px] leading-tight font-bold text-slate-800">
                                                                                    {
                                                                                        rev.user_name
                                                                                    }
                                                                                </p>
                                                                                {(rev.sub_order_item_id ||
                                                                                    rev.is_verified_purchase) && (
                                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                                                        <Check
                                                                                            size={
                                                                                                11
                                                                                            }
                                                                                            className="stroke-[2.5]"
                                                                                        />
                                                                                        Verified Purchase
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <p className="mb-3 text-[13px] leading-relaxed text-slate-700">
                                                                        {
                                                                            rev.review ||
                                                                                rev.comment
                                                                        }
                                                                    </p>
                                                                    {rev.photos &&
                                                                        Array.isArray(
                                                                            rev.photos,
                                                                        ) &&
                                                                        rev.photos
                                                                            .length >
                                                                            0 && (
                                                                            <div className="mb-3 flex flex-wrap gap-2">
                                                                                {rev.photos.map(
                                                                                    (
                                                                                        photo,
                                                                                        pIdx,
                                                                                    ) => (
                                                                                        <button
                                                                                            key={
                                                                                                pIdx
                                                                                            }
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                setPreviewModalPhoto(
                                                                                                    photo,
                                                                                                )
                                                                                            }
                                                                                            className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition"
                                                                                        >
                                                                                            <img
                                                                                                src={
                                                                                                    photo
                                                                                                }
                                                                                                alt={`Foto ulasan ${pIdx + 1}`}
                                                                                                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                                                                            />
                                                                                        </button>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    <div className="flex items-center justify-between text-slate-400">
                                                                        <button className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold transition hover:text-[#03ac0e]">
                                                                            <ThumbsUp
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />{' '}
                                                                            Membantu
                                                                        </button>
                                                                        <button className="cursor-pointer transition hover:text-slate-600">
                                                                            <MoreVertical
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )
                                                ) : (
                                                    <p className="text-[13px] text-slate-400 italic">
                                                        Belum ada ulasan untuk
                                                        produk ini.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </LazySection>
                        </div>
                    </div>

                    {/* Panel samping untuk transaksi (Sticky) */}
                    <div className="sticky top-24 z-10 w-full shrink-0 lg:w-[320px]">
                        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-[13px] font-bold text-slate-900">
                                Atur jumlah dan catatan
                            </h3>

                            {/* Ringkasan varian terpilih */}
                            {hasVariants && activeSku && (
                                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                                    <span className="text-slate-500">
                                        Varian:
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {activeSku.combination_key}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="flex w-fit items-center rounded-lg border border-slate-300 p-1">
                                    <button
                                        onClick={() =>
                                            handleQuantityChange('dec')
                                        }
                                        disabled={
                                            effectiveQuantity <= 1 || stock <= 0
                                        }
                                        className="cursor-pointer p-1 text-slate-500 transition hover:text-[#03ac0e] disabled:opacity-30"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center text-sm font-bold text-slate-900">
                                        {effectiveQuantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleQuantityChange('inc')
                                        }
                                        disabled={
                                            effectiveQuantity >= stock ||
                                            stock <= 0
                                        }
                                        className="cursor-pointer p-1 text-[#03ac0e] transition hover:text-emerald-700 disabled:opacity-30"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <span className="text-[13px] font-medium text-slate-600">
                                    Stok Total:{' '}
                                    <strong className="text-slate-900">
                                        {stock}
                                    </strong>
                                </span>
                            </div>

                            {/* Peringatan stok sisa / habis */}
                            <SkuStockNotice
                                stock={stock}
                                isVariantProduct={hasVariants}
                                isSelectionComplete={isSelectionComplete}
                            />

                            <div className="flex items-center justify-between pt-2 text-[13px]">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-lg font-extrabold text-slate-900">
                                    {formatRupiah(
                                        currentPrice * effectiveQuantity,
                                    )}
                                </span>
                            </div>

                            <div className="space-y-2.5 pt-2">
                                {/* Tombol Tambah ke Keranjang */}
                                <button
                                    type="button"
                                    onClick={handleAddMainToCart}
                                    disabled={
                                        isAddingToCart ||
                                        !isSelectionComplete ||
                                        stock <= 0
                                    }
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#03ac0e] py-2.5 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-[#029b0c] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus size={16} strokeWidth={3} />{' '}
                                    {isAddingToCart
                                        ? 'Menambahkan...'
                                        : stock <= 0
                                          ? 'Stok Habis'
                                          : !isSelectionComplete
                                            ? 'Pilih Varian'
                                            : 'Keranjang'}
                                </button>

                                {/* Tombol Beli Langsung */}
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    disabled={
                                        isAddingToCart ||
                                        !isSelectionComplete ||
                                        stock <= 0
                                    }
                                    className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-[#03ac0e] py-2.5 text-[13px] font-extrabold text-[#03ac0e] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent"
                                >
                                    Beli Langsung
                                </button>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[13px] font-bold text-slate-600">
                                <button className="flex cursor-pointer items-center gap-1.5 py-2 transition hover:text-[#03ac0e]">
                                    <MessageCircle size={16} /> Chat
                                </button>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <button
                                    onClick={() => setIsWishlist(!isWishlist)}
                                    className={`flex cursor-pointer items-center gap-1.5 py-2 transition ${isWishlist ? 'text-[#ef144a]' : 'hover:text-[#ef144a]'}`}
                                >
                                    <Heart
                                        size={16}
                                        className={
                                            isWishlist ? 'fill-current' : ''
                                        }
                                    />{' '}
                                    Wishlist
                                </button>
                                <div className="h-4 w-px bg-slate-200"></div>

                                {/* Tombol Share Produk */}
                                <button
                                    onClick={handleShareMain}
                                    className={`flex cursor-pointer items-center gap-1.5 py-2 transition ${isCopiedMain ? 'text-[#03ac0e]' : 'hover:text-[#03ac0e]'}`}
                                >
                                    {isCopiedMain ? (
                                        <Check size={16} />
                                    ) : (
                                        <Share2 size={16} />
                                    )}
                                    {isCopiedMain ? 'Tersalin!' : 'Share'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian rekomendasi produk di toko ini dengan menu titik tiga */}
                <div
                    id="rekomendasi"
                    className="mt-16 scroll-mt-24 border-t border-slate-200 pt-8"
                >
                    <LazySection minHeight="400px">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-base font-extrabold text-slate-900">
                                Lainnya di toko ini
                            </h2>
                            <Link
                                href="/"
                                className="text-[13px] font-bold text-[#03ac0e] hover:underline"
                            >
                                Lihat Semua
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {(relatedProducts && relatedProducts.length > 0
                                ? relatedProducts
                                : []
                            )
                                .slice(0, visibleRelated)
                                .map((rel: any, idx) => {
                                    const isMenuOpen = openMenuId === rel.id;
                                    const isCopied = copiedId === rel.id;

                                    return (
                                        <div
                                            key={rel?.id || idx}
                                            className="group relative flex flex-col justify-between overflow-visible rounded-lg border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                                        >
                                            <Link
                                                href={`/products/${rel.id}`}
                                                className="block flex flex-1 cursor-pointer flex-col justify-between"
                                            >
                                                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-slate-50">
                                                    <img
                                                        src={
                                                            rel?.image ||
                                                            `https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80&sig=${idx}`
                                                        }
                                                        alt={rel?.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    {rel?.discount && (
                                                        <div className="absolute top-0 left-0 rounded-br-lg bg-[#ef144a] px-1.5 py-0.5 text-[10px] font-black text-white">
                                                            {rel.discount}%
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between space-y-1 p-2.5">
                                                    <h3 className="line-clamp-2 h-[32px] text-xs leading-4 text-slate-800">
                                                        {rel?.title}
                                                    </h3>
                                                    <div>
                                                        <p className="text-[13px] leading-tight font-extrabold text-slate-900">
                                                            {formatRupiah(
                                                                rel?.price,
                                                            )}
                                                        </p>
                                                        <div className="flex h-4 items-center">
                                                            {rel?.discount &&
                                                            rel?.original_price ? (
                                                                <span className="text-[10px] text-slate-400 line-through">
                                                                    {formatRupiah(
                                                                        rel.original_price,
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
                                                        <Star
                                                            size={11}
                                                            className="fill-amber-400 text-amber-400"
                                                        />
                                                        <span className="font-bold text-slate-700">
                                                            {rel?.rating ||
                                                                '5.0'}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="text-[10.5px]">
                                                            {rel?.sold_count ||
                                                                '10+'}{' '}
                                                            terjual
                                                        </span>
                                                    </div>

                                                    {/* Transisi slide nama toko ke lokasi & tombol menu titik tiga */}
                                                    <div className="relative flex items-center gap-1 border-t border-slate-100 pt-1.5 text-[11px]">
                                                        <div className="relative h-4 flex-1 overflow-hidden text-slate-500">
                                                            <div className="transition-transform duration-200 ease-out group-hover:-translate-y-4">
                                                                <p className="h-4 truncate leading-4 font-semibold text-slate-700">
                                                                    Official
                                                                    Store
                                                                </p>
                                                                <p className="h-4 truncate leading-4 text-slate-500">
                                                                    {rel?.city ||
                                                                        'Jakarta Pusat'}
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
                                                                            : rel.id,
                                                                    );
                                                                }}
                                                                className={`shrink-0 cursor-pointer rounded-md p-1 transition ${
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
                                                                    className="absolute right-0 bottom-full z-40 mb-1.5 w-36 animate-in rounded-lg border border-slate-200 bg-white py-1 shadow-lg duration-150 zoom-in-95 fade-in"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            handleAddToCartItem(
                                                                                e,
                                                                                rel.id,
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
                                                                            handleShareItem(
                                                                                e,
                                                                                rel.id,
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

                            {isLoadingRelated &&
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <ProductSkeleton key={`skeleton-${idx}`} />
                                ))}
                        </div>

                        {relatedProducts &&
                            visibleRelated < relatedProducts.length && (
                                <div
                                    ref={observerTarget}
                                    className="mt-4 h-10 w-full"
                                />
                            )}
                    </LazySection>
                </div>
            </main>

            {/* Modal Preview Foto Lampiran Ulasan */}
            {previewModalPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setPreviewModalPhoto(null)}
                >
                    <div
                        className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewModalPhoto(null)}
                            className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition"
                        >
                            <X size={18} />
                        </button>
                        <img
                            src={previewModalPhoto}
                            alt="Lampiran ulasan"
                            className="max-h-[80vh] w-auto object-contain"
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
