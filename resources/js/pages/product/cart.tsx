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
import StoreCartSection from '@/components/cart/StoreCartSection';
import type { CartItem, Product, StoreCartGroup } from '@/types';

interface CartProps {
    storeGroups?: StoreCartGroup[];
    cartItems?: CartItem[];
    recommendations?: Product[];
}

const formatRupiah = (val: number | string | null | undefined): string => {
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
    'aria-label': ariaLabel,
}: {
    checked: boolean;
    onChange: () => void;
    'aria-label'?: string;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={ariaLabel}
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

function recalculateGroup(group: StoreCartGroup): StoreCartGroup {
    let subtotal = 0;
    let totalWeight = 0;
    let selectedSubtotal = 0;
    let selectedWeight = 0;
    let selectedCount = 0;

    group.items.forEach((it) => {
        const p = typeof it.price === 'string' ? parseFloat(it.price) : Number(it.price) || 0;
        const w = it.weight_gram ?? 200;
        const q = it.quantity || 1;
        subtotal += p * q;
        totalWeight += w * q;
        if (it.selected) {
            selectedSubtotal += p * q;
            selectedWeight += w * q;
            selectedCount += 1;
        }
    });

    return {
        ...group,
        subtotal,
        total_weight_gram: totalWeight,
        selected_subtotal: selectedSubtotal,
        selected_weight_gram: selectedWeight,
        selected_count: selectedCount,
        total_items: group.items.length,
        is_all_selected: group.items.length > 0 && selectedCount === group.items.length,
    };
}

function buildGroupsFromItems(items: CartItem[]): StoreCartGroup[] {
    const storeMap = new Map<number, { store: StoreCartGroup['store']; items: CartItem[] }>();

    items.forEach((item) => {
        const storeId = item.store_id ?? (item.product?.store_id ?? 0);
        const store = item.product?.store;

        if (!storeMap.has(storeId)) {
            storeMap.set(storeId, {
                store: {
                    id: store?.id ?? storeId,
                    name: store?.name ?? 'Toko Marketplace',
                    slug: store?.slug ?? '',
                    city: store?.city || (item.city || 'Jakarta Pusat'),
                    is_official: Boolean(store?.is_official),
                    power_merchant: Boolean(store?.power_merchant),
                    logo: store?.logo,
                },
                items: [],
            });
        }

        storeMap.get(storeId)!.items.push(item);
    });

    return Array.from(storeMap.values()).map(({ store, items: storeItems }) => {
        return recalculateGroup({
            store,
            items: storeItems,
            subtotal: 0,
            total_weight_gram: 0,
            selected_subtotal: 0,
            selected_weight_gram: 0,
            selected_count: 0,
            total_items: storeItems.length,
            is_all_selected: false,
        });
    });
}

export default function Cart({
    storeGroups: initialStoreGroups = [],
    cartItems: initialCartItems = [],
    recommendations = [],
}: CartProps) {
    const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];

    const [groups, setGroups] = useState<StoreCartGroup[]>(() => {
        if (Array.isArray(initialStoreGroups) && initialStoreGroups.length > 0) {
            return initialStoreGroups;
        }
        return buildGroupsFromItems(Array.isArray(initialCartItems) ? initialCartItems : []);
    });

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
        if (Array.isArray(initialStoreGroups) && initialStoreGroups.length > 0) {
            setGroups(initialStoreGroups);
        } else if (Array.isArray(initialCartItems)) {
            setGroups(buildGroupsFromItems(initialCartItems));
        }
    }, [initialStoreGroups, initialCartItems]);

    const totalCartItemsCount = useMemo(() => {
        return groups.reduce((acc, g) => acc + g.items.length, 0);
    }, [groups]);

    const isAllSelected = useMemo(() => {
        return totalCartItemsCount > 0 && groups.every((g) => g.is_all_selected);
    }, [groups, totalCartItemsCount]);

    const selectedCount = useMemo(() => {
        return groups.reduce((acc, g) => acc + g.selected_count, 0);
    }, [groups]);

    const { totalSelectedItems, totalPrice } = useMemo(() => {
        let totalItems = 0;
        let price = 0;

        groups.forEach((g) => {
            g.items.forEach((item) => {
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
        });

        return {
            totalSelectedItems: totalItems,
            totalPrice: price,
        };
    }, [groups]);

    const handleSelectAll = () => {
        const nextState = !isAllSelected;
        setGroups((prev) =>
            prev.map((g) =>
                recalculateGroup({
                    ...g,
                    items: g.items.map((it) => ({ ...it, selected: nextState })),
                }),
            ),
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

    const handleToggleStore = (storeId: number) => {
        const targetGroup = groups.find((g) => g.store.id === storeId);
        if (!targetGroup) {
            return;
        }

        const nextSelected = !targetGroup.is_all_selected;

        setGroups((prev) =>
            prev.map((g) => {
                if (g.store.id === storeId) {
                    return recalculateGroup({
                        ...g,
                        items: g.items.map((it) => ({ ...it, selected: nextSelected })),
                    });
                }
                return g;
            }),
        );

        router.post(
            '/cart/toggle-store',
            { store_id: storeId, selected: nextSelected },
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
            },
        );
    };

    const handleToggleItem = (id: number) => {
        let nextSelected = false;

        setGroups((prev) =>
            prev.map((g) => {
                const hasItem = g.items.some((it) => it.id === id);
                if (!hasItem) {
                    return g;
                }

                const updatedItems = g.items.map((it) => {
                    if (it.id === id) {
                        nextSelected = !it.selected;
                        return { ...it, selected: nextSelected };
                    }
                    return it;
                });

                return recalculateGroup({
                    ...g,
                    items: updatedItems,
                });
            }),
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
        let nextQty: number | null = null;

        setGroups((prev) =>
            prev.map((g) => {
                const item = g.items.find((it) => it.id === id);
                if (!item) {
                    return g;
                }

                let qty = Number(item.quantity) || 1;
                const maxStock = Number(item.stock) || 99;

                if (type === 'inc' && qty < maxStock) {
                    qty += 1;
                } else if (type === 'dec' && qty > 1) {
                    qty -= 1;
                }

                if (qty === item.quantity) {
                    return g;
                }
                nextQty = qty;

                const updatedItems = g.items.map((it) =>
                    it.id === id ? { ...it, quantity: qty } : it,
                );

                return recalculateGroup({
                    ...g,
                    items: updatedItems,
                });
            }),
        );

        if (nextQty !== null) {
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
            setGroups((prev) =>
                prev
                    .map((g) =>
                        recalculateGroup({
                            ...g,
                            items: g.items.filter((it) => it.id !== deleteId),
                        }),
                    )
                    .filter((g) => g.items.length > 0),
            );

            router.delete(`/cart/${deleteId}`, {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
            });
        } else if (deleteModal.type === 'selected') {
            setGroups((prev) =>
                prev
                    .map((g) =>
                        recalculateGroup({
                            ...g,
                            items: g.items.filter((it) => !it.selected),
                        }),
                    )
                    .filter((g) => g.items.length > 0),
            );

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

                {totalCartItemsCount > 0 ? (
                    <div className="flex flex-col items-start gap-8 lg:flex-row">
                        <div className="w-full flex-1 space-y-6">
                            {/* Header Section Pilih Semua & Tombol Hapus */}
                            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-5 py-4 shadow-xs">
                                <div className="flex items-center gap-3 select-none">
                                    <CustomCheckbox
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        aria-label="Pilih semua barang di keranjang"
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

                            {/* Section Toko-Toko Terpisah */}
                            <div className="space-y-4">
                                {groups.map((group) => (
                                    <StoreCartSection
                                        key={group.store.id}
                                        group={group}
                                        onToggleStore={handleToggleStore}
                                        onToggleItem={handleToggleItem}
                                        onQuantityChange={handleQuantityChange}
                                        onDeleteSingle={confirmDeleteSingle}
                                    />
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
                                    onClick={() => router.visit('/checkout')}
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
