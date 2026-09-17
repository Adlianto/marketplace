import { Head, Link, router } from '@inertiajs/react';
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
    Share2,
} from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

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
    onChange,
}: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={onChange}
            className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] transition-all ${
                checked
                    ? 'border border-[#03ac0e] bg-[#03ac0e]'
                    : 'border-2 border-slate-300 bg-white hover:border-[#03ac0e]'
            }`}
        >
            {checked && (
                <Check size={13} strokeWidth={3.5} className="text-white" />
            )}
        </button>
    );
}

export default function Cart({
    cartItems: initialCartItems = [],
    recommendations = [],
}: CartProps) {
    const safeInitial = Array.isArray(initialCartItems) ? initialCartItems : [];
    const safeRecommendations = Array.isArray(recommendations)
        ? recommendations
        : [];

    const [cartItems, setCartItems] = useState<CartItem[]>(() =>
        safeInitial.map((item) => ({
            ...item,
            selected: item.selected ?? true,
        })),
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartItems(
            (Array.isArray(initialCartItems) ? initialCartItems : []).map(
                (item) => ({
                    ...item,
                    selected: item.selected ?? true,
                }),
            ),
        );
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
                const unitPrice =
                    typeof item.price === 'string'
                        ? parseFloat(item.price)
                        : Number(item.price) || 0;
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
        setCartItems((prev) =>
            prev.map((item) => ({ ...item, selected: nextState })),
        );

        router.post(
            '/cart/toggle-all',
            { selected: nextState },
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
            },
        );
    };

    const handleToggleItem = (id: number) => {
        const target = cartItems.find((item) => item.id === id);
        const nextSelected = target ? !target.selected : false;

        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, selected: nextSelected } : item,
            ),
        );

        router.patch(
            `/cart/${id}`,
            { selected: nextSelected },
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
            },
        );
    };

    const handleQuantityChange = (id: number, type: 'inc' | 'dec') => {
        const item = cartItems.find((i) => i.id === id);

        if (!item) {
            return;
        }

        let nextQty = Number(item.quantity) || 1;
        const maxStock = Number(item.stock) || 99;

        if (type === 'inc' && nextQty < maxStock) {
            nextQty += 1;
        }

        if (type === 'dec' && nextQty > 1) {
            nextQty -= 1;
        }

        if (nextQty !== item.quantity) {
            setCartItems((prev) =>
                prev.map((i) =>
                    i.id === id ? { ...i, quantity: nextQty } : i,
                ),
            );

            router.patch(
                `/cart/${id}`,
                { quantity: nextQty },
                {
                    preserveScroll: true,
                    preserveState: true,
                    showProgress: false,
                },
            );
        }
    };

    const confirmDeleteSingle = (id: number) => {
        setDeleteModal({
            isOpen: true,
            type: 'single',
            id,
            count: 1,
        });
    };

    const confirmDeleteSelected = () => {
        if (selectedCount === 0) {
            return;
        }

        setDeleteModal({
            isOpen: true,
            type: 'selected',
            count: selectedCount,
        });
    };

    const executeDelete = () => {
        if (deleteModal.type === 'single' && deleteModal.id) {
            const deleteId = deleteModal.id;
            setCartItems((prev) => prev.filter((item) => item.id !== deleteId));
            router.delete(`/cart/${deleteId}`, {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
            });
        } else if (deleteModal.type === 'selected') {
            setCartItems((prev) => prev.filter((item) => !item.selected));
            router.delete('/cart/selected/delete', {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
            });
        }

        setDeleteModal({ isOpen: false, type: 'single', count: 1 });
    };

    const handleAddToCartItem = useCallback(
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

    const handleShareItem = useCallback(
        (e: React.MouseEvent, productId: number) => {
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
        },
        [],
    );

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-800 antialiased">
            <Head title="Keranjang Belanja" />

            <Navbar />

            <main className="mx-auto w-full max-w-[1200px] flex-1 space-y-8 px-4 py-6 lg:px-6">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    Keranjang
                </h1>

                {cartItems.length > 0 ? (
                    <div className="flex flex-col items-start gap-8 lg:flex-row">
                        <div className="w-full flex-1 space-y-6">
                            {/* Header Section Pilih Semua & Tombol Hapus */}
                            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-5 py-4 shadow-xs">
                                <div className="flex items-center gap-3 select-none">
                                    <CustomCheckbox
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                    <span className="text-sm font-extrabold text-slate-900">
                                        Pilih Semua{' '}
                                        {selectedCount > 0
                                            ? `(${selectedCount})`
                                            : ''}
                                    </span>
                                </div>

                                {selectedCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={confirmDeleteSelected}
                                        className="cursor-pointer p-1 text-xs font-bold text-[#03ac0e] transition hover:text-[#029b0c]"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="space-y-5 rounded-md border border-slate-200 bg-white p-5 shadow-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CustomCheckbox
                                                checked={!!item.selected}
                                                onChange={() =>
                                                    handleToggleItem(item.id)
                                                }
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="cursor-pointer text-[13px] font-extrabold text-slate-900 transition hover:text-[#03ac0e]">
                                                    Official Store
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    •{' '}
                                                    {item.city ||
                                                        'Jakarta Pusat'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 pl-8">
                                            <Link
                                                href={`/products/${item.product_id}`}
                                                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 sm:h-24 sm:w-24"
                                            >
                                                <img
                                                    src={
                                                        item.image ||
                                                        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200'
                                                    }
                                                    alt={item.title || 'Produk'}
                                                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                                />
                                                {item.discount ? (
                                                    <div className="absolute top-0 left-0 rounded-br-md bg-[#ef144a] px-1.5 py-0.5 text-[9.5px] font-black text-white">
                                                        {item.discount}%
                                                    </div>
                                                ) : null}
                                            </Link>

                                            <div className="min-w-0 flex-1 space-y-1">
                                                <Link
                                                    href={`/products/${item.product_id}`}
                                                    className="line-clamp-2 text-[13px] leading-snug font-semibold text-slate-800 transition hover:text-[#03ac0e] sm:text-sm"
                                                >
                                                    {item.title ||
                                                        'Nama Produk'}
                                                </Link>

                                                <p className="text-xs text-slate-400">
                                                    Varian: Default
                                                </p>

                                                <div className="flex items-baseline gap-2 pt-1">
                                                    <span className="text-sm font-extrabold text-slate-900 sm:text-base">
                                                        {formatRupiah(
                                                            item.price,
                                                        )}
                                                    </span>
                                                    {item.original_price ? (
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {formatRupiah(
                                                                item.original_price,
                                                            )}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-3 pl-8">
                                            <button
                                                type="button"
                                                aria-label="Hapus barang"
                                                onClick={() =>
                                                    confirmDeleteSingle(item.id)
                                                }
                                                className="cursor-pointer p-1 text-slate-400 transition hover:text-[#ef144a]"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <div className="flex items-center rounded-md border border-slate-300 bg-white p-0.5">
                                                <button
                                                    type="button"
                                                    aria-label="Kurangi kuantitas"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            'dec',
                                                        )
                                                    }
                                                    disabled={
                                                        (Number(
                                                            item.quantity,
                                                        ) || 1) <= 1
                                                    }
                                                    className="cursor-pointer p-1 text-slate-400 transition hover:text-[#03ac0e] disabled:opacity-30"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center text-xs font-bold text-slate-900">
                                                    {item.quantity || 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label="Tambah kuantitas"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            'inc',
                                                        )
                                                    }
                                                    disabled={
                                                        (Number(
                                                            item.quantity,
                                                        ) || 1) >=
                                                        (Number(item.stock) ||
                                                            99)
                                                    }
                                                    className="cursor-pointer p-1 text-[#03ac0e] transition hover:text-emerald-700 disabled:opacity-30"
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
                        <div className="sticky top-24 w-full shrink-0 space-y-4 lg:w-[350px]">
                            <div className="space-y-5 rounded-md border border-slate-200 bg-white p-6 shadow-xs">
                                <h2 className="text-base font-extrabold text-slate-900">
                                    Ringkasan belanja
                                </h2>

                                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                    <span>Total</span>
                                    <span className="text-base font-black text-slate-900">
                                        {totalSelectedItems > 0
                                            ? formatRupiah(totalPrice)
                                            : '-'}
                                    </span>
                                </div>

                                <div className="flex cursor-pointer items-center justify-between rounded-md border border-emerald-300 bg-white p-3 transition hover:border-[#03ac0e] hover:shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-400 text-xs font-bold text-white shadow-xs">
                                            %
                                        </div>
                                        <span className="text-xs leading-snug font-bold text-slate-700">
                                            Pilih barang dulu sebelum pakai
                                            promo
                                        </span>
                                    </div>
                                    <ChevronRight
                                        size={16}
                                        className="ml-2 shrink-0 text-slate-400"
                                    />
                                </div>

                                <button
                                    type="button"
                                    disabled={totalSelectedItems === 0}
                                    className="w-full cursor-pointer rounded-md bg-[#03ac0e] py-3 text-sm font-black text-white shadow-xs transition hover:bg-[#029b0c] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                >
                                    Beli{' '}
                                    {totalSelectedItems > 0
                                        ? `(${totalSelectedItems})`
                                        : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 rounded-md border border-slate-200 bg-white p-16 text-center shadow-xs">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-emerald-50 text-[#03ac0e]">
                            <ShoppingBag size={32} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-slate-900">
                                Wah, keranjang belanjamu kosong
                            </h2>
                            <p className="mx-auto max-w-sm text-xs text-slate-500">
                                Yuk, isi dengan barang-barang impianmu. Cek
                                berbagai produk menarik sekarang!
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="inline-block rounded-md bg-[#03ac0e] px-8 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#029b0c]"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                )}

                {/* Rekomendasi Produk */}
                {safeRecommendations.length > 0 && (
                    <div className="space-y-4 border-t border-slate-100 pt-10">
                        <h2 className="text-lg font-black text-slate-900">
                            Rekomendasi untukmu
                        </h2>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {safeRecommendations.map((item, idx) => {
                                const isMenuOpen = openMenuId === item.id;
                                const isCopied = copiedId === item.id;

                                return (
                                    <div
                                        key={item.id || idx}
                                        className="group relative flex flex-col justify-between overflow-visible rounded-md border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                                    >
                                        <Link
                                            href={`/products/${item.id}`}
                                            className="block flex flex-1 cursor-pointer flex-col justify-between"
                                        >
                                            <div className="relative aspect-square overflow-hidden rounded-t-md bg-slate-50">
                                                <img
                                                    src={
                                                        item.image ||
                                                        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200'
                                                    }
                                                    alt={item.title || 'Produk'}
                                                    className="h-full w-full object-cover"
                                                />
                                                {item.discount ? (
                                                    <div className="absolute top-0 left-0 rounded-br-md bg-[#ef144a] px-1.5 py-0.5 text-[10px] font-black text-white">
                                                        {item.discount}%
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between space-y-1 p-2.5">
                                                <h3 className="line-clamp-2 h-[32px] text-xs leading-4 text-slate-800">
                                                    {item.title ||
                                                        'Nama Produk'}
                                                </h3>

                                                <div>
                                                    <p className="text-[13px] leading-tight font-extrabold text-slate-900">
                                                        {formatRupiah(
                                                            item.price,
                                                        )}
                                                    </p>
                                                    <div className="flex h-4 items-center">
                                                        {item.discount &&
                                                        item.original_price ? (
                                                            <span className="text-[10px] text-slate-400 line-through">
                                                                {formatRupiah(
                                                                    item.original_price,
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="flex h-4 items-center">
                                                    <span className="text-[10px] font-bold text-[#f26522]">
                                                        Hemat s.d 3% Pakai Bonus
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 pt-0.5 text-[11px] text-slate-500">
                                                    <Star
                                                        size={11}
                                                        className="fill-amber-400 text-amber-400"
                                                    />
                                                    <span className="font-bold text-slate-700">
                                                        {item.rating || '5.0'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="text-[10.5px]">
                                                        {item.sold_count ||
                                                            '10+'}{' '}
                                                        terjual
                                                    </span>
                                                </div>

                                                <div className="relative flex items-center justify-between gap-1 border-t border-slate-100 pt-1.5 text-[11px]">
                                                    <div className="relative h-4 flex-1 overflow-hidden text-slate-500">
                                                        <div className="transition-transform duration-200 ease-out group-hover:-translate-y-4">
                                                            <p className="h-4 truncate leading-4 font-semibold text-slate-700">
                                                                Official Store
                                                            </p>
                                                            <p className="h-4 truncate leading-4 text-slate-500">
                                                                {item.city ||
                                                                    'Jakarta Pusat'}
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
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                                className="absolute right-0 bottom-full z-40 mb-1.5 w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        handleAddToCartItem(
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
                                                                    + Keranjang
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        handleShareItem(
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
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Dialog Konfirmasi Hapus Clone Persis Tokopedia */}
            {deleteModal.isOpen && (
                <div
                    onClick={() =>
                        setDeleteModal({
                            isOpen: false,
                            type: 'single',
                            count: 1,
                        })
                    }
                    className="fixed inset-0 z-[9999] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-[1px] duration-150 fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[420px] animate-in space-y-6 rounded-lg bg-white p-6 text-center shadow-2xl duration-150 zoom-in-95"
                    >
                        {/* Judul Modal Bersih & Tegas */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                Hapus {deleteModal.count} produk?
                            </h3>
                            <p className="text-[13px] leading-relaxed font-medium text-slate-500">
                                Produk yang kamu pilih akan dihapus dari
                                Keranjang.
                            </p>
                        </div>

                        {/* Dua Tombol Aksi Khas Tokopedia */}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({
                                        isOpen: false,
                                        type: 'single',
                                        count: 1,
                                    })
                                }
                                className="flex-1 cursor-pointer rounded-lg border border-[#03ac0e] px-5 py-2.5 text-sm font-bold text-[#03ac0e] transition hover:bg-emerald-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="flex-1 cursor-pointer rounded-lg bg-[#03ac0e] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#029b0c]"
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
