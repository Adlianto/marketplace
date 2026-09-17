import { Link, usePage } from '@inertiajs/react';
import {
    ShoppingCart,
    Bell,
    Mail,
    Store,
    Search,
    LogOut,
    Wallet,
    CreditCard,
    Plus,
    ChevronRight,
    Settings,
    Heart,
    ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, login, register } from '@/routes';
import type { User } from '@/types';

interface CartPreviewItem {
    id: number;
    title: string;
    price: number | string;
    image: string;
}

interface SharedPageProps {
    auth?: {
        user: User | null;
    };
    cart?: {
        count?: number;
        preview?: CartPreviewItem[];
    };
    [key: string]: unknown;
}

interface NavbarProps {
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    cartCount?: number;
    cartItemsPreview?: CartPreviewItem[];
    notificationCount?: number;
    messageCount?: number;
    shopLogo?: string;
}

const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num || 0);
};

export default function Navbar({
    searchQuery = '',
    onSearchChange,
    cartCount: propCartCount,
    cartItemsPreview: propCartPreview,
    notificationCount = 0,
    messageCount = 0,
    shopLogo,
}: NavbarProps) {
    const page = usePage<SharedPageProps>();
    const pageProps = page?.props || {};

    // Proteksi data cart agar selalu berupa array/angka valid
    const sharedCartCount = Number(pageProps.cart?.count) || 0;
    const sharedCartPreview: CartPreviewItem[] = Array.isArray(
        pageProps.cart?.preview,
    )
        ? pageProps.cart.preview
        : [];

    const activeCartCount =
        propCartCount !== undefined ? propCartCount : sharedCartCount;
    const activeCartPreview =
        Array.isArray(propCartPreview) && propCartPreview.length > 0
            ? propCartPreview
            : sharedCartPreview;

    const auth = pageProps.auth || { user: null };
    const [localQuery, setLocalQuery] = useState(searchQuery || '');
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${auth.user?.name || 'Bell'}`;

    const handleInputChange = (val: string) => {
        setLocalQuery(val);

        if (onSearchChange) {
            onSearchChange(val);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white font-sans shadow-xs">
            <div className="mx-auto max-w-[1240px] px-3 sm:px-4 lg:px-6">
                <div className="flex h-16 items-center justify-between gap-4 lg:gap-6">
                    {/* Logo & Kategori */}
                    <div className="flex h-full shrink-0 items-center gap-6">
                        <Link
                            href="/"
                            preserveState
                            preserveScroll
                            className="flex items-center"
                        >
                            <span className="text-2xl font-black tracking-tight text-[#03ac0e] select-none">
                                Marketplace
                            </span>
                        </Link>

                        <div className="group relative hidden h-full items-center lg:flex">
                            <span className="cursor-pointer py-5 text-sm font-semibold text-slate-700 transition group-hover:text-[#03ac0e]">
                                Kategori
                            </span>

                            <div className="absolute top-full left-0 z-50 hidden pt-2 group-hover:block">
                                <div className="w-[580px] rounded-md border border-slate-200 bg-white p-5 shadow-xl">
                                    <div className="grid grid-cols-3 gap-6 text-xs">
                                        <div>
                                            <h4 className="mb-3 text-sm font-bold text-slate-900">
                                                Laptop
                                            </h4>
                                            <ul className="space-y-2 text-slate-600">
                                                <li>
                                                    <Link
                                                        href="/?category=laptop-gaming"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        Laptop Gaming
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/?category=laptop-ultrabook"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        Laptop Ultrabook
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="mb-3 text-sm font-bold text-slate-900">
                                                Komponen Inti
                                            </h4>
                                            <ul className="space-y-2 text-slate-600">
                                                <li>
                                                    <Link
                                                        href="/?category=processor-cpu"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        Processor & CPU
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/?category=vga-graphic-card"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        VGA & Graphic Card
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/?category=motherboard"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        Motherboard
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="mb-3 text-sm font-bold text-slate-900">
                                                Storage & Part
                                            </h4>
                                            <ul className="space-y-2 text-slate-600">
                                                <li>
                                                    <Link
                                                        href="/?category=ram-memory"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        RAM & Memory
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/?category=ssd-storage"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        SSD & Storage
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/?category=power-supply-psu"
                                                        preserveState
                                                        preserveScroll
                                                        className="block transition hover:text-[#03ac0e]"
                                                    >
                                                        Power Supply
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-full flex-1 lg:max-w-2xl">
                        <div className="relative flex items-center">
                            <Search
                                size={16}
                                className="pointer-events-none absolute left-3.5 text-slate-400"
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={localQuery}
                                onChange={(e) =>
                                    handleInputChange(e.target.value)
                                }
                                className="w-full rounded-md border border-slate-300 bg-white py-2 pr-4 pl-10 text-xs transition placeholder:text-slate-400 focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e] focus:outline-none sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Right Navigation */}
                    <div className="flex h-full shrink-0 items-center gap-1 sm:gap-3">
                        {/* Cart Dropdown */}
                        <div className="group relative flex h-full items-center px-1.5">
                            <Link
                                href="/cart"
                                className="relative flex items-center py-5 text-slate-600 transition group-hover:text-[#03ac0e]"
                                title="Keranjang"
                            >
                                <ShoppingCart size={21} />
                                {activeCartCount > 0 && (
                                    <span className="absolute top-3.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-[#ef144a] px-1 text-[10px] font-bold text-white">
                                        {activeCartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Dropdown Hover Cart */}
                            <div className="absolute top-full -right-16 z-50 hidden animate-in pt-2 duration-150 fade-in slide-in-from-top-1 lg:group-hover:block">
                                <div className="w-[340px] space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-xl">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h4 className="text-xs font-bold text-slate-900">
                                            Keranjang ({activeCartCount})
                                        </h4>
                                        <Link
                                            href="/cart"
                                            className="text-xs font-bold text-[#03ac0e] hover:underline"
                                        >
                                            Lihat Sekarang
                                        </Link>
                                    </div>

                                    {activeCartCount > 0 &&
                                    activeCartPreview.length > 0 ? (
                                        <div className="max-h-[220px] divide-y divide-slate-100 overflow-y-auto">
                                            {activeCartPreview
                                                .slice(0, 3)
                                                .map(
                                                    (item: CartPreviewItem) => (
                                                        <Link
                                                            key={item.id}
                                                            href="/cart"
                                                            className="group/item flex items-center gap-3 rounded-md px-1 py-2 transition hover:bg-slate-50"
                                                        >
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-xs font-semibold text-slate-800 transition group-hover/item:text-[#03ac0e]">
                                                                    {item.title}
                                                                </p>
                                                                <p className="mt-0.5 text-[11px] font-bold text-[#ef144a]">
                                                                    {formatRupiah(
                                                                        item.price,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    ),
                                                )}
                                        </div>
                                    ) : (
                                        <p className="py-4 text-center text-xs text-slate-400">
                                            Keranjang belanjamu kosong
                                        </p>
                                    )}

                                    <Link
                                        href="/cart"
                                        className="block w-full rounded-md bg-[#03ac0e] py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#029b0c]"
                                    >
                                        Buka Keranjang
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Pesan */}
                        <div className="group relative flex h-full items-center px-1.5">
                            <Link
                                href="/chat"
                                preserveState
                                preserveScroll
                                className="relative text-slate-600 transition group-hover:text-[#03ac0e]"
                                title="Pesan"
                            >
                                <Mail size={21} />
                                {messageCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-[#ef144a] px-1 text-[10px] font-bold text-white">
                                        {messageCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Notifikasi */}
                        <div className="group relative hidden h-full items-center px-1.5 lg:flex">
                            <button
                                type="button"
                                className="relative cursor-pointer text-slate-600 transition group-hover:text-[#03ac0e]"
                                title="Notifikasi"
                            >
                                <Bell size={21} />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-[#ef144a] px-1 text-[10px] font-bold text-white">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="mx-1 hidden h-6 w-px bg-slate-200 lg:block" />

                        {/* Toko */}
                        <div className="group relative hidden h-full items-center px-2 lg:flex">
                            <div className="flex cursor-pointer items-center gap-1.5 py-5 text-sm font-semibold text-slate-700 transition group-hover:text-[#03ac0e]">
                                {shopLogo ? (
                                    <img
                                        src={shopLogo}
                                        alt="Toko"
                                        className="h-5 w-5 rounded-md object-cover"
                                    />
                                ) : (
                                    <Store
                                        size={20}
                                        className="text-slate-600 group-hover:text-[#03ac0e]"
                                    />
                                )}
                                <span>Toko</span>
                            </div>

                            <div className="absolute top-full -right-6 z-50 hidden pt-2 group-hover:block">
                                <div className="w-64 rounded-md border border-slate-200 bg-white p-4 text-center shadow-xl">
                                    <p className="mb-3 text-xs text-slate-600">
                                        Anda belum memiliki toko.
                                    </p>
                                    <button className="w-full cursor-pointer rounded-lg bg-[#03ac0e] py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#029b0c]">
                                        Buka Toko Gratis
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="flex h-full items-center">
                            {auth.user ? (
                                <div className="group relative flex h-full items-center pl-2">
                                    <Link
                                        href={dashboard()}
                                        preserveState
                                        preserveScroll
                                        className="flex items-center gap-2 py-5 text-sm font-semibold text-slate-800 transition group-hover:text-[#03ac0e]"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-orange-100">
                                            <img
                                                src={
                                                    auth.user.avatar ||
                                                    defaultAvatar
                                                }
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src = defaultAvatar;
                                                }}
                                                alt={auth.user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="max-w-[90px] truncate">
                                            {auth.user.name || 'Bell'}
                                        </span>
                                    </Link>

                                    <div className="absolute top-full right-0 z-50 hidden animate-in pt-2 duration-150 fade-in slide-in-from-top-1 group-hover:block">
                                        <div className="w-[390px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
                                            <Link
                                                href={dashboard()}
                                                className="m-2 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3.5 transition hover:bg-slate-100/80"
                                            >
                                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-orange-100">
                                                    <img
                                                        src={
                                                            auth.user.avatar ||
                                                            defaultAvatar
                                                        }
                                                        onError={(e) => {
                                                            (
                                                                e.target as HTMLImageElement
                                                            ).src =
                                                                defaultAvatar;
                                                        }}
                                                        alt={auth.user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-bold text-slate-800">
                                                        {auth.user.name}
                                                    </p>
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#03ac0e] uppercase">
                                                        Member Silver
                                                    </span>
                                                </div>
                                                <ChevronRight
                                                    size={16}
                                                    className="shrink-0 text-slate-400"
                                                />
                                            </Link>

                                            <div className="grid grid-cols-2">
                                                <div className="space-y-4 border-r border-slate-100 p-3.5">
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="rounded-md bg-[#03ac0e] p-1 text-white">
                                                            <Plus
                                                                size={13}
                                                                strokeWidth={3}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs leading-tight font-bold text-slate-800">
                                                                PLUS{' '}
                                                                <span className="text-[10px] font-bold text-[#03ac0e]">
                                                                    Langganan
                                                                </span>
                                                            </p>
                                                            <p className="mt-0.5 text-[10px] leading-tight text-slate-500">
                                                                Gratis Ongkir
                                                                tanpa batas!
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <AccountMiniLink
                                                        icon={
                                                            <Wallet
                                                                size={15}
                                                                className="text-blue-500"
                                                            />
                                                        }
                                                        label="GoPay"
                                                        action="Aktifkan"
                                                    />
                                                    <AccountMiniLink
                                                        icon={
                                                            <CreditCard
                                                                size={15}
                                                                className="text-[#03ac0e]"
                                                            />
                                                        }
                                                        label="Market Card"
                                                        action="Daftar"
                                                    />
                                                    <AccountMiniLink
                                                        icon={
                                                            <Wallet
                                                                size={15}
                                                                className="text-[#03ac0e]"
                                                            />
                                                        }
                                                        label="Saldo"
                                                        value="Rp0"
                                                    />
                                                </div>

                                                <div className="flex flex-col justify-between p-3.5">
                                                    <div className="space-y-3">
                                                        <Link
                                                            href="/orders"
                                                            className="flex items-center gap-2.5 text-xs text-slate-600 transition hover:text-[#03ac0e]"
                                                        >
                                                            <ShoppingBag
                                                                size={16}
                                                            />{' '}
                                                            Pembelian
                                                        </Link>
                                                        <Link
                                                            href="/wishlist"
                                                            className="flex items-center gap-2.5 text-xs text-slate-600 transition hover:text-[#03ac0e]"
                                                        >
                                                            <Heart size={16} />{' '}
                                                            Wishlist
                                                        </Link>
                                                        <Link
                                                            href="/settings"
                                                            className="flex items-center gap-2.5 text-xs text-slate-600 transition hover:text-[#03ac0e]"
                                                        >
                                                            <Settings
                                                                size={16}
                                                            />{' '}
                                                            Pengaturan
                                                        </Link>
                                                    </div>

                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        className="flex w-full cursor-pointer items-center gap-2 border-t border-slate-100 pt-3 text-left text-xs text-slate-400 transition hover:text-red-500"
                                                    >
                                                        <LogOut size={15} />{' '}
                                                        Keluar
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Link
                                        href={login()}
                                        preserveState
                                        preserveScroll
                                        className="rounded-md border border-[#03ac0e] px-4 py-1.5 text-xs font-bold text-[#03ac0e] transition hover:bg-emerald-50"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        preserveState
                                        preserveScroll
                                        className="rounded-md border border-[#03ac0e] bg-[#03ac0e] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#029b0c]"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function AccountMiniLink({
    icon,
    label,
    action,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    action?: string;
    value?: string;
}) {
    return (
        <div className="group/item flex cursor-pointer items-center justify-between">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-medium text-slate-700 group-hover/item:text-[#03ac0e]">
                    {label}
                </span>
            </div>
            {action && (
                <span className="text-[10px] font-bold text-[#03ac0e] hover:underline">
                    {action}
                </span>
            )}
            {value && (
                <span className="text-xs font-bold text-slate-800">
                    {value}
                </span>
            )}
        </div>
    );
}
