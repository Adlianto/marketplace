import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    Trash2, 
    Minus, 
    Plus, 
    ChevronRight, 
    ShoppingBag, 
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
    slug?: string;
    price: number | string;
    original_price?: number | string | null;
    discount?: number | null;
    image?: string;
    stock?: number;
    city?: string;
    quantity: number;
    selected?: boolean;
}

interface ProductItem {
    id: number;
    title: string;
    price: number | string;
    original_price?: number | string | null;
    discount?: number | null;
    city?: string;
    rating?: number | string;
    sold_count?: string | number;
    image?: string;
}

interface CartProps {
    cartItems?: CartItem[];
    recommendations?: ProductItem[];
}

const formatRupiah = (val: number | string | null | undefined) => {
    const num = typeof val === 'string' ? parseFloat(val) : Number(val);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num);
};

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
            className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                checked 
                    ? 'bg-[#03ac0e] border border-[#03ac0e]' 
                    : 'bg-white border-2 border-slate-300 hover:border-[#03ac0e]'
            }`}
        >
            {checked && <Check size={13} strokeWidth={3.5} className="text-white" />}
        </button>
    );
}

export default function Cart({ 
    cartItems: initialCartItems = [], 
    recommendations = [] 
}: CartProps) {
    const safeInitial = Array.isArray(initialCartItems) ? initialCartItems : [];
    const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];

    const [cartItems, setCartItems] = useState<CartItem[]>(() => 
        safeInitial.map(item => ({ ...item, selected: item.selected ?? true }))
    );

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'single' | 'selected';
        id?: number;
        count: number;
    }>({ isOpen: false, type: 'single', count: 1 });

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        setCartItems((Array.isArray(initialCartItems) ? initialCartItems : []).map(item => ({ 
            ...item, 
            selected: item.selected ?? true 
        })));
    }, [initialCartItems]);

    const isAllSelected = useMemo(() => {
        return cartItems.length > 0 && cartItems.every((item) => item.selected);
    }, [cartItems]);

    const selectedCount = useMemo(() => {
        return cartItems.filter((item) => item.selected).length;
    }, [cartItems]);

    const { totalSelectedItems, totalPrice } = useMemo(() => {
        let totalItems = 0;
        let price = 0;

        cartItems.forEach((item) => {
            if (item && item.selected) {
                const qty = Number(item.quantity) || 1;
                const unitPrice = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0;
                totalItems += qty;
                price += unitPrice * qty;
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
        
        router.post('/cart/toggle-all', { selected: nextState }, {
            preserveScroll: true,
            preserveState: true,
            showProgress: false
        });
    };

    const handleToggleItem = (id: number) => {
        const target = cartItems.find(item => item.id === id);
        const nextSelected = target ? !target.selected : false;

        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, selected: nextSelected } : item))
        );

        router.patch(`/cart/${id}`, { selected: nextSelected }, {
            preserveScroll: true,
            preserveState: true,
            showProgress: false
        });
    };

    const handleQuantityChange = (id: number, type: 'inc' | 'dec') => {
        const item = cartItems.find((i) => i.id === id);
        if (!item) return;

        let nextQty = Number(item.quantity) || 1;
        const maxStock = Number(item.stock) || 99;

        if (type === 'inc' && nextQty < maxStock) nextQty += 1;
        if (type === 'dec' && nextQty > 1) nextQty -= 1;

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

    const confirmDeleteSingle = (id: number) => {
        setDeleteModal({
            isOpen: true,
            type: 'single',
            id,
            count: 1
        });
    };

    const confirmDeleteSelected = () => {
        if (selectedCount === 0) return;
        setDeleteModal({
            isOpen: true,
            type: 'selected',
            count: selectedCount
        });
    };

    const executeDelete = () => {
        if (deleteModal.type === 'single' && deleteModal.id) {
            const deleteId = deleteModal.id;
            setCartItems((prev) => prev.filter((item) => item.id !== deleteId));
            router.delete(`/cart/${deleteId}`, { 
                preserveScroll: true, 
                preserveState: true,
                showProgress: false 
            });
        } else if (deleteModal.type === 'selected') {
            setCartItems((prev) => prev.filter((item) => !item.selected));
            router.delete('/cart/selected/delete', {
                preserveScroll: true,
                preserveState: true,
                showProgress: false
            });
        }

        setDeleteModal({ isOpen: false, type: 'single', count: 1 });
    };

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

    const handleShareItem = useCallback((e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        e.preventDefault();
        const productUrl = `${window.location.origin}/products/${productId}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(productUrl);
            setCopiedId(productId);
            setTimeout(() => {
                setCopiedId(null);
                setOpenMenuId(null);
            }, 1200);
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans">
            <Head title="Keranjang Belanja" />

            <Navbar />

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 lg:px-6 py-6 space-y-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Keranjang</h1>

                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 w-full space-y-6">
                            
                            {/* Header Section Pilih Semua & Tombol Hapus */}
                            <div className="bg-white rounded-md border border-slate-200 px-5 py-4 flex items-center justify-between shadow-xs">
                                <div className="flex items-center gap-3 select-none">
                                    <CustomCheckbox 
                                        checked={isAllSelected} 
                                        onChange={handleSelectAll} 
                                    />
                                    <span className="text-sm font-extrabold text-slate-900">
                                        Pilih Semua {selectedCount > 0 ? `(${selectedCount})` : ''}
                                    </span>
                                </div>

                                {selectedCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={confirmDeleteSelected}
                                        className="text-xs font-bold text-[#03ac0e] hover:text-[#029b0c] transition cursor-pointer p-1"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-md border border-slate-200 p-5 shadow-xs space-y-5"
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
                                                <span className="text-xs text-slate-400">• {item.city || 'Jakarta Pusat'}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start pl-8">
                                            <Link
                                                href={`/products/${item.product_id}`}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-slate-50 border border-slate-200 shrink-0 relative"
                                            >
                                                <img
                                                    src={item.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200'}
                                                    alt={item.title || 'Produk'}
                                                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                                />
                                                {item.discount ? (
                                                    <div className="absolute top-0 left-0 bg-[#ef144a] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-br-md">
                                                        {item.discount}%
                                                    </div>
                                                ) : null}
                                            </Link>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <Link
                                                    href={`/products/${item.product_id}`}
                                                    className="text-[13px] sm:text-sm font-semibold text-slate-800 line-clamp-2 hover:text-[#03ac0e] transition leading-snug"
                                                >
                                                    {item.title || 'Nama Produk'}
                                                </Link>
                                                
                                                <p className="text-xs text-slate-400">Varian: Default</p>

                                                <div className="pt-1 flex items-baseline gap-2">
                                                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                                                        {formatRupiah(item.price)}
                                                    </span>
                                                    {item.original_price ? (
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {formatRupiah(item.original_price)}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end items-center gap-4 pt-3 border-t border-slate-100 pl-8">
                                            <button
                                                type="button"
                                                aria-label="Hapus barang"
                                                onClick={() => confirmDeleteSingle(item.id)}
                                                className="text-slate-400 hover:text-[#ef144a] transition cursor-pointer p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <div className="flex items-center border border-slate-300 rounded-md p-0.5 bg-white">
                                                <button
                                                    type="button"
                                                    aria-label="Kurangi kuantitas"
                                                    onClick={() => handleQuantityChange(item.id, 'dec')}
                                                    disabled={(Number(item.quantity) || 1) <= 1}
                                                    className="p-1 text-slate-400 hover:text-[#03ac0e] disabled:opacity-30 cursor-pointer transition"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center text-xs font-bold text-slate-900">
                                                    {item.quantity || 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label="Tambah kuantitas"
                                                    onClick={() => handleQuantityChange(item.id, 'inc')}
                                                    disabled={(Number(item.quantity) || 1) >= (Number(item.stock) || 99)}
                                                    className="p-1 text-[#03ac0e] hover:text-emerald-700 disabled:opacity-30 cursor-pointer transition"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Panel Ringkasan Belanja */}
                        <div className="w-full lg:w-[350px] shrink-0 sticky top-24 space-y-4">
                            <div className="bg-white rounded-md border border-slate-200 p-6 shadow-xs space-y-5">
                                <h2 className="font-extrabold text-base text-slate-900">Ringkasan belanja</h2>

                                <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                                    <span>Total</span>
                                    <span className="font-black text-slate-900 text-base">
                                        {totalSelectedItems > 0 ? formatRupiah(totalPrice) : '-'}
                                    </span>
                                </div>

                                <div className="bg-white rounded-md border border-emerald-300 p-3 flex items-center justify-between cursor-pointer hover:border-[#03ac0e] hover:shadow-xs transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-md bg-amber-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
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
                                    className="w-full py-3 bg-[#03ac0e] text-white rounded-md text-sm font-black hover:bg-[#029b0c] transition cursor-pointer shadow-xs disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                    Beli {totalSelectedItems > 0 ? `(${totalSelectedItems})` : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-md border border-slate-200 p-16 text-center shadow-xs space-y-4">
                        <div className="w-16 h-16 mx-auto bg-emerald-50 text-[#03ac0e] rounded-md flex items-center justify-center">
                            <ShoppingBag size={32} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-slate-900">Wah, keranjang belanjamu kosong</h2>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Yuk, isi dengan barang-barang impianmu. Cek berbagai produk menarik sekarang!
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="inline-block px-8 py-2.5 bg-[#03ac0e] text-white font-extrabold text-xs rounded-md hover:bg-[#029b0c] transition shadow-xs"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                )}

                {/* Rekomendasi Produk */}
                {safeRecommendations.length > 0 && (
                    <div className="pt-10 space-y-4 border-t border-slate-100">
                        <h2 className="text-lg font-black text-slate-900">Rekomendasi untukmu</h2>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {safeRecommendations.map((item, idx) => {
                                const isMenuOpen = openMenuId === item.id;
                                const isCopied = copiedId === item.id;

                                return (
                                    <div
                                        key={item.id || idx}
                                        className="group bg-white rounded-md border border-slate-200 overflow-visible shadow-xs hover:shadow-md transition flex flex-col justify-between relative"
                                    >
                                        <Link
                                            href={`/products/${item.id}`}
                                            className="block cursor-pointer flex-1 flex flex-col justify-between"
                                        >
                                            <div className="aspect-square bg-slate-50 overflow-hidden relative rounded-t-md">
                                                <img
                                                    src={item.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200'}
                                                    alt={item.title || 'Produk'}
                                                    className="w-full h-full object-cover"
                                                />
                                                {item.discount ? (
                                                    <div className="absolute top-0 left-0 bg-[#ef144a] text-white text-[10px] font-black px-1.5 py-0.5 rounded-br-md">
                                                        {item.discount}%
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                                                <h3 className="text-xs text-slate-800 line-clamp-2 leading-4 h-[32px]">
                                                    {item.title || 'Nama Produk'}
                                                </h3>

                                                <div>
                                                    <p className="text-[13px] font-extrabold text-slate-900 leading-tight">
                                                        {formatRupiah(item.price)}
                                                    </p>
                                                    <div className="h-4 flex items-center">
                                                        {item.discount && item.original_price ? (
                                                            <span className="text-[10px] text-slate-400 line-through">
                                                                {formatRupiah(item.original_price)}
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
                                                    <span className="font-bold text-slate-700">{item.rating || '5.0'}</span>
                                                    <span>•</span>
                                                    <span className="text-[10.5px]">{item.sold_count || '10+'} terjual</span>
                                                </div>

                                                <div className="flex items-center justify-between gap-1 text-[11px] pt-1.5 border-t border-slate-100 relative">
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

            {/* Modal Dialog Konfirmasi Hapus Clone Persis Tokopedia */}
            {deleteModal.isOpen && (
                <div 
                    onClick={() => setDeleteModal({ isOpen: false, type: 'single', count: 1 })}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150 backdrop-blur-[1px]"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[420px] bg-white rounded-lg p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 text-center"
                    >
                        {/* Judul Modal Bersih & Tegas */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                Hapus {deleteModal.count} produk?
                            </h3>
                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                Produk yang kamu pilih akan dihapus dari Keranjang.
                            </p>
                        </div>

                        {/* Dua Tombol Aksi Khas Tokopedia */}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, type: 'single', count: 1 })}
                                className="flex-1 py-2.5 px-5 text-sm font-bold text-[#03ac0e] border border-[#03ac0e] hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="flex-1 py-2.5 px-5 text-sm font-bold bg-[#03ac0e] hover:bg-[#029b0c] text-white rounded-lg transition shadow-xs cursor-pointer"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}