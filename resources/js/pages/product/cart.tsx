import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    Trash2, 
    Minus, 
    Plus, 
    ChevronRight, 
    ShoppingBag, 
    Heart, 
    Check,
    Star,
    MoreHorizontal,
    ShoppingCart,
    Share2
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface CartItem {
    id: number;
    product_id: number;
    title: string;
    slug: string;
    price: number;
    original_price: number | null;
    discount: number | null;
    image: string;
    stock: number;
    city: string;
    quantity: number;
    selected?: boolean;
}

interface ProductItem {
    id: number;
    title: string;
    price: number;
    original_price: number | null;
    discount: number | null;
    city: string;
    rating: number | string;
    sold_count: string;
    image: string;
}

interface CartProps {
    cartItems: CartItem[];
    recommendations: ProductItem[];
}

const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(val);
};

// Komponen checkbox kustom
function CustomCheckbox({ 
    checked, 
    onChange 
}: { 
    checked: boolean; 
    onChange: () => void 
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={onChange}
            className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                checked 
                    ? 'bg-[#03ac0e] border border-[#03ac0e]' 
                    : 'bg-white border-2 border-slate-300 hover:border-[#03ac0e]'
            }`}
        >
            {checked && <Check size={13} strokeWidth={3.5} className="text-white" />}
        </button>
    );
}

export default function Cart({ cartItems: initialCartItems = [], recommendations = [] }: CartProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => 
        initialCartItems.map(item => ({ ...item, selected: item.selected ?? true }))
    );
    const [wishlist, setWishlist] = useState<number[]>([]);

    // State menu titik tiga untuk rekomendasi bawah
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        setCartItems(initialCartItems.map(item => ({ ...item, selected: item.selected ?? true })));
    }, [initialCartItems]);

    const isAllSelected = useMemo(() => {
        return cartItems.length > 0 && cartItems.every((item) => item.selected);
    }, [cartItems]);

    const { totalSelectedItems, totalPrice } = useMemo(() => {
        let totalItems = 0;
        let price = 0;

        cartItems.forEach((item) => {
            if (item.selected) {
                totalItems += item.quantity;
                price += item.price * item.quantity;
            }
        });

        return {
            totalSelectedItems: totalItems,
            totalPrice: price,
        };
    }, [cartItems]);

    const handleSelectAll = () => {
        const nextState = !isAllSelected;
        setCartItems((prev) => prev.map((item) => ({ ...item, selected: nextState })));
    };

    const handleToggleItem = (id: number) => {
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
        );
    };

    const handleQuantityChange = (id: number, type: 'inc' | 'dec') => {
        const item = cartItems.find((i) => i.id === id);
        if (!item) return;

        let nextQty = item.quantity;
        if (type === 'inc' && item.quantity < item.stock) nextQty += 1;
        if (type === 'dec' && item.quantity > 1) nextQty -= 1;

        if (nextQty !== item.quantity) {
            setCartItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i))
            );

            router.patch(`/cart/${id}`, { quantity: nextQty }, { 
                preserveScroll: true, 
                preserveState: true,
                showProgress: false 
            });
        }
    };

    const handleDeleteItem = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        router.delete(`/cart/${id}`, { 
            preserveScroll: true, 
            preserveState: true,
            showProgress: false 
        });
    };

    const handleToggleWishlist = (productId: number) => {
        setWishlist((prev) =>
            prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
    };

    // Tambah ke cart dari rekomendasi bawah
    const handleAddToCartItem = useCallback((e: React.MouseEvent, productId: number) => {
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

    // Salin tautan produk rekomendasi
    const handleShareItem = useCallback((e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        e.preventDefault();
        const productUrl = `${window.location.origin}/products/${productId}`;
        navigator.clipboard.writeText(productUrl);
        setCopiedId(productId);
        setTimeout(() => {
            setCopiedId(null);
            setOpenMenuId(null);
        }, 1200);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
            <Head title="Keranjang Belanja" />

            <Navbar cartCount={cartItems.length} />

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 lg:px-6 py-6 space-y-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Keranjang</h1>

                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 w-full space-y-6">
                            
                            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between shadow-xs">
                                <div className="flex items-center gap-3 select-none">
                                    <CustomCheckbox 
                                        checked={isAllSelected} 
                                        onChange={handleSelectAll} 
                                    />
                                    <span className="text-sm font-extrabold text-slate-900">
                                        Pilih Semua ({cartItems.length})
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {cartItems.map((item) => {
                                    const isLiked = wishlist.includes(item.product_id);

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CustomCheckbox
                                                    checked={!!item.selected}
                                                    onChange={() => handleToggleItem(item.id)}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-extrabold text-slate-900 hover:text-[#03ac0e] cursor-pointer transition">
                                                        Official Store
                                                    </span>
                                                    <span className="text-xs text-slate-400">• {item.city}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 items-start pl-8">
                                                <Link
                                                    href={`/products/${item.product_id}`}
                                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 relative"
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                                    />
                                                    {item.discount && (
                                                        <div className="absolute top-0 left-0 bg-[#ef144a] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-br-lg">
                                                            {item.discount}%
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <Link
                                                        href={`/products/${item.product_id}`}
                                                        className="text-[13px] sm:text-sm font-semibold text-slate-800 line-clamp-2 hover:text-[#03ac0e] transition leading-snug"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                    
                                                    <p className="text-xs text-slate-400">Varian: Default</p>

                                                    <div className="pt-1 flex items-baseline gap-2">
                                                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                                                            {formatRupiah(item.price)}
                                                        </span>
                                                        {item.original_price && (
                                                            <span className="text-xs text-slate-400 line-through">
                                                                {formatRupiah(item.original_price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center gap-6 pt-3 border-t border-slate-100 pl-8">
                                                <button
                                                    type="button"
                                                    aria-label="Simpan ke wishlist"
                                                    onClick={() => handleToggleWishlist(item.product_id)}
                                                    className={`transition cursor-pointer ${
                                                        isLiked ? 'text-[#ef144a]' : 'text-slate-400 hover:text-[#ef144a]'
                                                    }`}
                                                >
                                                    <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label="Hapus barang"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="text-slate-400 hover:text-[#ef144a] transition cursor-pointer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                                <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-white">
                                                    <button
                                                        type="button"
                                                        aria-label="Kurangi kuantitas"
                                                        onClick={() => handleQuantityChange(item.id, 'dec')}
                                                        disabled={item.quantity <= 1}
                                                        className="p-1 text-slate-400 hover:text-[#03ac0e] disabled:opacity-30 cursor-pointer transition"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-10 text-center text-xs font-bold text-slate-900">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        aria-label="Tambah kuantitas"
                                                        onClick={() => handleQuantityChange(item.id, 'inc')}
                                                        disabled={item.quantity >= item.stock}
                                                        className="p-1 text-[#03ac0e] hover:text-emerald-700 disabled:opacity-30 cursor-pointer transition"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Panel Ringkasan Belanja */}
                        <div className="w-full lg:w-[350px] shrink-0 sticky top-24 space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                                <h2 className="font-extrabold text-base text-slate-900">Ringkasan belanja</h2>

                                <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                                    <span>Total</span>
                                    <span className="font-black text-slate-900 text-base">
                                        {totalSelectedItems > 0 ? formatRupiah(totalPrice) : '-'}
                                    </span>
                                </div>

                                <div className="bg-white rounded-xl border border-emerald-300 p-3 flex items-center justify-between cursor-pointer hover:border-[#03ac0e] hover:shadow-xs transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                            %
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 leading-snug">
                                            Pilih barang dulu sebelum pakai promo
                                        </span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 shrink-0 ml-2" />
                                </div>

                                <button
                                    type="button"
                                    disabled={totalSelectedItems === 0}
                                    className="w-full py-3 bg-[#03ac0e] text-white rounded-xl text-sm font-black hover:bg-[#029b0c] transition cursor-pointer shadow-xs disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                    Beli {totalSelectedItems > 0 ? `(${totalSelectedItems})` : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs space-y-4">
                        <div className="w-20 h-20 mx-auto bg-emerald-50 text-[#03ac0e] rounded-full flex items-center justify-center">
                            <ShoppingBag size={38} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-slate-900">Wah, keranjang belanjamu kosong</h2>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Yuk, isi dengan barang-barang impianmu. Cek berbagai produk menarik sekarang!
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="inline-block px-8 py-3 bg-[#03ac0e] text-white font-extrabold text-xs rounded-xl hover:bg-[#029b0c] transition shadow-xs"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                )}

                {/* Section Rekomendasi Produk di Bawah Keranjang */}
                {recommendations && recommendations.length > 0 && (
                    <div className="pt-10 space-y-4 border-t border-slate-100">
                        <h2 className="text-lg font-black text-slate-900">Rekomendasi untukmu</h2>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {recommendations.map((item) => {
                                const isMenuOpen = openMenuId === item.id;
                                const isCopied = copiedId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className="group bg-white rounded-xl border border-slate-200 overflow-visible shadow-xs hover:shadow-md transition flex flex-col justify-between relative"
                                    >
                                        <Link
                                            href={`/products/${item.id}`}
                                            className="block cursor-pointer flex-1 flex flex-col justify-between"
                                        >
                                            <div className="aspect-square bg-slate-50 overflow-hidden relative rounded-t-xl">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {item.discount && (
                                                    <div className="absolute top-0 left-0 bg-[#ef144a] text-white text-[10px] font-black px-1.5 py-0.5 rounded-br-lg">
                                                        {item.discount}%
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                                                <h3 className="text-xs text-slate-800 line-clamp-2 leading-4 h-[32px]">
                                                    {item.title}
                                                </h3>

                                                <div>
                                                    <p className="text-[13px] font-extrabold text-slate-900 leading-tight">
                                                        {formatRupiah(Number(item.price))}
                                                    </p>
                                                    <div className="h-4 flex items-center">
                                                        {item.discount && item.original_price ? (
                                                            <span className="text-[10px] text-slate-400 line-through">
                                                                {formatRupiah(Number(item.original_price))}
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
                                                    <span className="font-bold text-slate-700">{item.rating}</span>
                                                    <span>•</span>
                                                    <span className="text-[10.5px]">{item.sold_count} terjual</span>
                                                </div>

                                                {/* Transisi slide nama toko ke kota & popover titik tiga */}
                                                <div className="flex items-center gap-1 text-[11px] pt-1.5 border-t border-slate-100 relative">
                                                    <div className="h-4 overflow-hidden relative flex-1 text-slate-500">
                                                        <div className="transition-transform duration-200 ease-out group-hover:-translate-y-4">
                                                            <p className="h-4 truncate leading-4 font-semibold text-slate-700">
                                                                Official Store
                                                            </p>
                                                            <p className="h-4 truncate leading-4 text-slate-500">
                                                                {item.city || 'Jakarta Pusat'}
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
                                                                    onClick={(e) => handleAddToCartItem(e, item.id)}
                                                                    className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#03ac0e] flex items-center gap-2 transition cursor-pointer"
                                                                >
                                                                    <ShoppingCart size={13} className="text-[#03ac0e]" />
                                                                    + Keranjang
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleShareItem(e, item.id)}
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
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}