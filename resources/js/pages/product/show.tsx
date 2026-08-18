import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
    Star,
    ShieldCheck,
    Truck,
    Heart,
    Share2,
    Minus,
    Plus,
    ShoppingCart,
    Store,
    MessageCircle,
    Check,
    ThumbsUp,
    MoreVertical,
    ChevronDown,
    X,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProductSkeleton from '@/components/productSkeleton';

interface Review {
    id: number;
    user_name: string;
    user_avatar: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface Specification {
    id: number;
    name: string;
    value: string;
}

interface ProductItem {
    id: number;
    title: string;
    slug?: string;
    price: number;
    original_price?: number | null;
    discount?: number | null;
    city?: string;
    description?: string;
    image?: string;
    stock?: number;
    rating?: number;
    sold_count?: string | number;
    category_id?: number;
    rating_avg?: number;
    reviews_count?: number;
    specifications?: Specification[];
    reviews?: Review[];
}

interface ProductShowProps {
    product: ProductItem;
    relatedProducts: ProductItem[];
}

function LazySection({ children, minHeight = '400px' }: { children: ReactNode; minHeight?: string }) {
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
            { rootMargin: '300px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ minHeight: isVisible ? 'auto' : minHeight }} className="transition-opacity duration-500">
            {isVisible && children}
        </div>
    );
}

export default function ProductShow({ product, relatedProducts }: ProductShowProps) {
    const productImage = product?.image || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80';
    
    const [activeImage, setActiveImage] = useState(productImage);
    const [modalData, setModalData] = useState<{ images: string[]; index: number } | null>(null);

    const [quantity, setQuantity] = useState(1);
    const [isWishlist, setIsWishlist] = useState(false);
    const [activeTab, setActiveTab] = useState<'detail' | 'spesifikasi'>('detail');
    const [isCopiedMain, setIsCopiedMain] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const [visibleRelated, setVisibleRelated] = useState(6);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);
    
    const observer = useRef<IntersectionObserver | null>(null);
    const observerTarget = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingRelated) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && relatedProducts && visibleRelated < relatedProducts.length) {
                setIsLoadingRelated(true);
                setTimeout(() => {
                    setVisibleRelated((prev) => Math.min(prev + 6, relatedProducts.length));
                    setIsLoadingRelated(false);
                }, 600);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoadingRelated, visibleRelated, relatedProducts]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        setActiveImage(product?.image || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80');
    }, [product]);

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
            const y = element.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handlePrevModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalData((prev) => (prev ? { ...prev, index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1 } : null));
    };

    const handleNextModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalData((prev) => (prev ? { ...prev, index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1 } : null));
    };

    const stock = product?.stock ?? 143;
    const sold = product?.sold_count ?? 40;
    const ratingDisplay = product?.rating_avg ?? product?.rating ?? 5.0;
    const reviewsCount = product?.reviews_count ?? product?.reviews?.length ?? 0;

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc' && quantity < stock) setQuantity(quantity + 1);
        else if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    };

    const handleAddMainToCart = () => {
        setIsAddingToCart(true);
        router.post('/cart', {
            product_id: product.id,
            quantity: quantity
        }, {
            preserveScroll: true,
            preserveState: true,
            showProgress: false,
            onFinish: () => setIsAddingToCart(false)
        });
    };

    const handleShareMain = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopiedMain(true);
        setTimeout(() => setIsCopiedMain(false), 1500);
    };

    const handleAddToCartItem = (e: React.MouseEvent, productId: number) => {
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
        <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans antialiased relative">
            <Head title={product?.title || 'Detail Produk'} />

            {/* Modal preview gambar penuh */}
            {modalData && (
                <div 
                    className="fixed inset-0 z-[100] h-screen w-screen bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none"
                    onClick={() => setModalData(null)}
                >
                    <button 
                        type="button"
                        aria-label="Tutup preview"
                        onClick={() => setModalData(null)} 
                        className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-2.5 rounded-full transition cursor-pointer z-[110]"
                    >
                        <X size={22} />
                    </button>

                    {modalData.images.length > 1 && (
                        <button 
                            type="button"
                            aria-label="Gambar sebelumnya"
                            onClick={handlePrevModal}
                            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-3 rounded-full transition cursor-pointer z-[110]"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    <div 
                        className="relative flex items-center justify-center max-w-[85vw] max-h-[82vh] w-auto h-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={modalData.images[modalData.index]} 
                            alt="Preview pembesaran gambar" 
                            className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200" 
                        />
                    </div>

                    {modalData.images.length > 1 && (
                        <button 
                            type="button"
                            aria-label="Gambar selanjutnya"
                            onClick={handleNextModal}
                            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-3 rounded-full transition cursor-pointer z-[110]"
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}
                </div>
            )}

            <Navbar />

            {/* Navigasi breadcrumb */}
            <div className="max-w-[1240px] w-full mx-auto px-4 py-3 text-[13px] text-slate-500 flex items-center gap-1.5 border-b border-slate-100">
                <Link href="/" className="hover:text-[#03ac0e]">Home</Link>
                <span>/</span>
                <span className="text-slate-400">Komputer & Laptop</span>
                <span>/</span>
                <span className="text-slate-400">Komponen Komputer</span>
                <span>/</span>
                <span className="text-slate-800 font-semibold truncate max-w-[280px]">{product?.title}</span>
            </div>

            <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Area informasi produk */}
                    <div className="flex-1 w-full space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-9 gap-8">
                            
                            {/* Galeri gambar dan thumbnail */}
                            <div className="md:col-span-4 space-y-4">
                                <div 
                                    className="aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative flex items-center justify-center cursor-zoom-in group"
                                    onClick={() => setModalData({ images: galleryImages, index: galleryImages.indexOf(activeImage) >= 0 ? galleryImages.indexOf(activeImage) : 0 })}
                                >
                                    <img
                                        src={activeImage}
                                        alt={product?.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm opacity-0 group-hover:opacity-100 transition pointer-events-none">
                                        Klik untuk perbesar
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                    {galleryImages.map((img, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setActiveImage(img)}
                                            className={`w-16 h-16 rounded-xl border-2 flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-200 p-0.5 ${
                                                activeImage === img ? 'border-[#03ac0e] opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'
                                            }`}
                                        >
                                            <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ringkasan harga dan tab spesifikasi */}
                            <div className="md:col-span-5 space-y-5">
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                                        {product?.title}
                                    </h1>
                                    <div className="flex items-center gap-3 text-[13px] text-slate-600 mt-2">
                                        <span>Terjual <strong className="text-slate-900">{sold}</strong></span>
                                        <span className="text-slate-300">•</span>
                                        <button onClick={() => scrollToSection('ulasan')} className="flex items-center gap-1 hover:text-[#03ac0e] transition cursor-pointer">
                                            <Star size={14} className="fill-amber-400 text-amber-400" />
                                            <strong className="text-slate-900">{ratingDisplay}</strong> ({reviewsCount} rating)
                                        </button>
                                    </div>
                                </div>

                                <div className="text-3xl font-extrabold text-slate-900">
                                    {formatRupiah(product?.price || 0)}
                                </div>

                                <div className="flex gap-6 border-b border-slate-200 text-[13px] font-bold">
                                    <button onClick={() => setActiveTab('detail')} className={`pb-2.5 border-b-2 cursor-pointer transition ${activeTab === 'detail' ? 'border-[#03ac0e] text-[#03ac0e]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Detail Produk</button>
                                    <button onClick={() => setActiveTab('spesifikasi')} className={`pb-2.5 border-b-2 cursor-pointer transition ${activeTab === 'spesifikasi' ? 'border-[#03ac0e] text-[#03ac0e]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Spesifikasi</button>
                                </div>

                                <div id="detail" className="text-sm text-slate-700 leading-relaxed space-y-3 pt-2 scroll-mt-24">
                                    {activeTab === 'detail' && (
                                        <p className="whitespace-pre-line">
                                            {product?.description || "Barang dijamin original, garansi resmi distributor. \n\nSilakan langsung diorder, stok terbatas!"}
                                        </p>
                                    )}

                                    {activeTab === 'spesifikasi' && (
                                        <div className="grid grid-cols-2 gap-y-2 text-[13px] max-w-sm">
                                            {product?.specifications && product.specifications.length > 0 ? (
                                                product.specifications.map((spek) => (
                                                    <div key={spek.id} className="contents">
                                                        <span className="text-slate-500">{spek.name}:</span>
                                                        <span className="font-semibold text-slate-900">{spek.value}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-slate-400 italic">Spesifikasi belum ditambahkan.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bagian ulasan pembeli */}
                        <div id="ulasan" className="pt-8 border-t border-slate-200 scroll-mt-24">
                            <LazySection minHeight="500px">
                                <h2 className="text-base font-extrabold text-slate-900 mb-6 uppercase tracking-wider">Ulasan Pembeli</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    <div className="md:col-span-4 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-2">
                                                    <Star size={36} className="fill-amber-400 text-amber-400" />
                                                    <span className="text-5xl font-black text-slate-900">{ratingDisplay}<span className="text-xl text-slate-400 font-bold">/5.0</span></span>
                                                </div>
                                                <p className="text-[13px] font-bold text-slate-800 mt-2">100% pembeli merasa puas</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{reviewsCount} rating • {reviewsCount} ulasan</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 w-full">
                                            {[5, 4, 3, 2, 1].map((star) => (
                                                <div key={star} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    <span className="w-2">{star}</span>
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${star === 5 ? 'bg-[#03ac0e] w-full' : (star === 4 ? 'bg-[#03ac0e] w-1/4' : 'bg-slate-200 w-0')}`}></div>
                                                    </div>
                                                    <span className="w-4 text-right">{star >= 4 ? Math.ceil(reviewsCount / (6 - star)) : '0'}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border border-slate-200 rounded-lg overflow-hidden mt-6">
                                            <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500 border-b border-slate-200">Filter Ulasan</div>
                                            <div className="divide-y divide-slate-100">
                                                {['Media', 'Rating', 'Topik Ulasan'].map((filter) => (
                                                    <button key={filter} className="w-full px-4 py-3 text-[13px] font-bold text-slate-800 flex justify-between items-center hover:bg-slate-50 transition cursor-pointer">
                                                        {filter} <ChevronDown size={14} className="text-slate-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-8 space-y-8">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Foto & Video Pembeli</h3>
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                                {reviewPhotos.map((src, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        onClick={() => setModalData({ images: reviewPhotos, index: idx })}
                                                        className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 cursor-zoom-in hover:opacity-80 transition relative"
                                                    >
                                                        <img src={src} alt="Lampiran review" className="w-full h-full object-cover" />
                                                        {idx === reviewPhotos.length - 1 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xs">
                                                                +2
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ulasan Pilihan</h3>
                                                <div className="flex items-center gap-2 text-[13px]">
                                                    <span className="text-slate-500">Urutkan</span>
                                                    <button className="border border-slate-300 rounded-md px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition">
                                                        Paling Membantu <ChevronDown size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {product?.reviews && product.reviews.length > 0 ? (
                                                    product.reviews.map((rev) => {
                                                        const reviewDate = new Date(rev.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'long', year: 'numeric'
                                                        });
                                                        return (
                                                            <div key={rev.id} className="border-b border-slate-100 pb-6">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex gap-1 text-amber-400">
                                                                        {Array.from({ length: rev.rating }).map((_, i) => (
                                                                            <Star key={i} size={14} className="fill-current" />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-[11px] text-slate-400">{reviewDate}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                                                                        <img src={rev.user_avatar} alt={rev.user_name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-bold text-slate-800 leading-tight">{rev.user_name}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[13px] text-slate-700 leading-relaxed mb-3">
                                                                    {rev.comment}
                                                                </p>
                                                                <div className="flex items-center justify-between text-slate-400">
                                                                    <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-[#03ac0e] transition cursor-pointer">
                                                                        <ThumbsUp size={14} /> Membantu
                                                                    </button>
                                                                    <button className="hover:text-slate-600 transition cursor-pointer">
                                                                        <MoreVertical size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-[13px] text-slate-400 italic">Belum ada ulasan untuk produk ini.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </LazySection>
                        </div>
                    </div>

                    {/* Panel samping untuk transaksi (Sticky) */}
                    <div className="w-full lg:w-[320px] shrink-0 sticky top-24 z-10">
                        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-5">
                            <h3 className="font-bold text-[13px] text-slate-900">Atur jumlah dan catatan</h3>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-slate-300 rounded-lg p-1 w-fit">
                                    <button onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1} className="p-1 text-slate-500 hover:text-[#03ac0e] disabled:opacity-30 cursor-pointer transition">
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center text-sm font-bold text-slate-900">
                                        {quantity}
                                    </span>
                                    <button onClick={() => handleQuantityChange('inc')} disabled={quantity >= stock} className="p-1 text-[#03ac0e] hover:text-emerald-700 disabled:opacity-30 cursor-pointer transition">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <span className="text-[13px] text-slate-600 font-medium">
                                    Stok Total: <strong className="text-slate-900">{stock}</strong>
                                </span>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-[13px]">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-lg font-extrabold text-slate-900">
                                    {formatRupiah((product?.price || 0) * quantity)}
                                </span>
                            </div>

                            <div className="space-y-2.5 pt-2">
                                {/* Tombol Tambah ke Keranjang Database */}
                                <button 
                                    onClick={handleAddMainToCart}
                                    disabled={isAddingToCart}
                                    className="w-full py-2.5 bg-[#03ac0e] text-white rounded-lg text-[13px] font-extrabold hover:bg-[#029b0c] transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Plus size={16} strokeWidth={3} /> {isAddingToCart ? 'Menambahkan...' : 'Keranjang'}
                                </button>
                                <Link 
                                    href="/cart"
                                    onClick={handleAddMainToCart}
                                    className="w-full py-2.5 border border-[#03ac0e] text-[#03ac0e] rounded-lg text-[13px] font-extrabold hover:bg-emerald-50 transition cursor-pointer flex items-center justify-center"
                                >
                                    Beli Langsung
                                </Link>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-[13px] font-bold text-slate-600 border-t border-slate-100">
                                <button className="flex items-center gap-1.5 hover:text-[#03ac0e] cursor-pointer py-2 transition">
                                    <MessageCircle size={16} /> Chat
                                </button>
                                <div className="w-px h-4 bg-slate-200"></div>
                                <button onClick={() => setIsWishlist(!isWishlist)} className={`flex items-center gap-1.5 cursor-pointer py-2 transition ${isWishlist ? 'text-[#ef144a]' : 'hover:text-[#ef144a]'}`}>
                                    <Heart size={16} className={isWishlist ? 'fill-current' : ''} /> Wishlist
                                </button>
                                <div className="w-px h-4 bg-slate-200"></div>
                                
                                {/* Tombol Share Produk */}
                                <button 
                                    onClick={handleShareMain} 
                                    className={`flex items-center gap-1.5 cursor-pointer py-2 transition ${isCopiedMain ? 'text-[#03ac0e]' : 'hover:text-[#03ac0e]'}`}
                                >
                                    {isCopiedMain ? <Check size={16} /> : <Share2 size={16} />}
                                    {isCopiedMain ? 'Tersalin!' : 'Share'}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bagian rekomendasi produk di toko ini dengan menu titik tiga */}
                <div id="rekomendasi" className="mt-16 pt-8 border-t border-slate-200 scroll-mt-24">
                    <LazySection minHeight="400px">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base font-extrabold text-slate-900">Lainnya di toko ini</h2>
                            <Link href="/" className="text-[13px] font-bold text-[#03ac0e] hover:underline">Lihat Semua</Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {(relatedProducts && relatedProducts.length > 0 ? relatedProducts : []).slice(0, visibleRelated).map((rel: any, idx) => {
                                const isMenuOpen = openMenuId === rel.id;
                                const isCopied = copiedId === rel.id;

                                return (
                                    <div
                                        key={rel?.id || idx}
                                        className="group bg-white rounded-lg border border-slate-200 overflow-visible shadow-xs hover:shadow-md transition flex flex-col justify-between relative"
                                    >
                                        <Link
                                            href={`/products/${rel.id}`}
                                            className="block cursor-pointer flex-1 flex flex-col justify-between"
                                        >
                                            <div className="aspect-square bg-slate-50 overflow-hidden relative rounded-t-lg">
                                                <img
                                                    src={rel?.image || `https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80&sig=${idx}`}
                                                    alt={rel?.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {rel?.discount && (
                                                    <div className="absolute top-0 left-0 bg-[#ef144a] text-white text-[10px] font-black px-1.5 py-0.5 rounded-br-lg">
                                                        {rel.discount}%
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                                                <h3 className="text-xs text-slate-800 line-clamp-2 leading-4 h-[32px]">
                                                    {rel?.title}
                                                </h3>
                                                <div>
                                                    <p className="text-[13px] font-extrabold text-slate-900 leading-tight">
                                                        {formatRupiah(rel?.price)}
                                                    </p>
                                                    <div className="h-4 flex items-center">
                                                        {rel?.discount && rel?.original_price ? (
                                                            <span className="text-[10px] text-slate-400 line-through">
                                                                {formatRupiah(rel.original_price)}
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
                                                    <Star size={11} className="fill-amber-400 text-amber-400" />
                                                    <span className="font-bold text-slate-700">{rel?.rating || '5.0'}</span>
                                                    <span>•</span>
                                                    <span className="text-[10.5px]">{rel?.sold_count || '10+'} terjual</span>
                                                </div>

                                                {/* Transisi slide nama toko ke lokasi & tombol menu titik tiga */}
                                                <div className="flex items-center gap-1 text-[11px] pt-1.5 border-t border-slate-100 relative">
                                                    <div className="h-4 overflow-hidden relative flex-1 text-slate-500">
                                                        <div className="transition-transform duration-200 ease-out group-hover:-translate-y-4">
                                                            <p className="h-4 truncate leading-4 font-semibold text-slate-700">
                                                                Official Store
                                                            </p>
                                                            <p className="h-4 truncate leading-4 text-slate-500">
                                                                {rel?.city || 'Jakarta Pusat'}
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
                                                                setOpenMenuId(isMenuOpen ? null : rel.id);
                                                            }}
                                                            className={`p-1 rounded-md transition cursor-pointer shrink-0 ${
                                                                isMenuOpen ? 'text-[#03ac0e] bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <MoreHorizontal size={14} />
                                                        </button>

                                                        {isMenuOpen && (
                                                            <div 
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="absolute bottom-full right-0 mb-1.5 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 animate-in fade-in zoom-in-95 duration-150"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleAddToCartItem(e, rel.id)}
                                                                    className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#03ac0e] flex items-center gap-2 transition cursor-pointer"
                                                                >
                                                                    <ShoppingCart size={13} className="text-[#03ac0e]" />
                                                                    + Keranjang
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleShareItem(e, rel.id)}
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

                            {isLoadingRelated && Array.from({ length: 6 }).map((_, idx) => (
                                <ProductSkeleton key={`skeleton-${idx}`} />
                            ))}
                        </div>

                        {relatedProducts && visibleRelated < relatedProducts.length && (
                            <div ref={observerTarget} className="h-10 w-full mt-4" />
                        )}
                    </LazySection>
                </div>

            </main>

            <Footer />
        </div>
    );
}