import { Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { useState } from 'react';
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

interface NavbarProps {
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    cartCount?: number;
    notificationCount?: number;
    messageCount?: number;
    shopLogo?: string;
}

export default function Navbar({
    searchQuery = '',
    onSearchChange,
    cartCount = 4,
    notificationCount = 18,
    messageCount = 1,
    shopLogo,
}: NavbarProps) {
    const { auth } = usePage().props as {
        auth: { user: { name: string; avatar?: string; email?: string } | null };
    };

    const [localQuery, setLocalQuery] = useState(searchQuery);
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${auth.user?.name || 'Bell'}`;

    const handleInputChange = (val: string) => {
        setLocalQuery(val);
        if (onSearchChange) onSearchChange(val);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs font-sans">
            <div className="max-w-[1240px] mx-auto px-3 sm:px-4 lg:px-6">
                <div className="h-16 flex items-center justify-between gap-4 lg:gap-6">
                    
                    {/* Logo & Kategori */}
                    <div className="flex items-center gap-6 shrink-0 h-full">
                        <Link href="/" preserveState preserveScroll className="flex items-center">
                            <span className="text-2xl font-black tracking-tight text-[#03ac0e] select-none">
                                Marketplace
                            </span>
                        </Link>

                        <div className="relative group h-full hidden lg:flex items-center">
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-[#03ac0e] transition cursor-pointer py-5">
                                Kategori
                            </span>

                            <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50">
                                <div className="w-[580px] bg-white border border-slate-200 rounded-xl shadow-xl p-5">
                                    <div className="grid grid-cols-3 gap-6 text-xs">
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-3 text-sm">Laptop</h4>
                                            <ul className="space-y-2 text-slate-600">
                                                <li>
                                                    <Link href="/?category=laptop-gaming" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
                                                        Laptop Gaming
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/?category=laptop-ultrabook" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
                                                        Laptop Ultrabook
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-3 text-sm">Komponen Inti</h4>
                                            <ul className="space-y-2 text-slate-600">
                                                <li>
                                                    <Link href="/?category=processor-cpu" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
                                                        Processor & CPU
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/?category=vga-graphic-card" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
                                                        VGA & Graphic Card
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/?category=motherboard" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
                                                        Motherboard
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-3 text-sm">Storage & Part</h4>
                                            <ul className="space-y-2 text-slate-600">
                                                <li>
                                                    <Link href="/?category=ram-memory" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
                                                        RAM & Memory
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/?category=ssd-storage" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
                                                        SSD & Storage
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/?category=power-supply-psu" preserveState preserveScroll className="hover:text-[#03ac0e] block transition">
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
                    <div className="flex-1 max-w-full lg:max-w-2xl">
                        <div className="relative flex items-center">
                            <Search size={16} className="text-slate-400 absolute left-3.5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari komponen PC & laptop..."
                                value={localQuery}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e] transition"
                            />
                        </div>
                    </div>

                    {/* Right Navigation */}
                    <div className="flex items-center gap-1 sm:gap-3 shrink-0 h-full">
                        
                        {/* Cart */}
                        <div className="relative group h-full flex items-center px-1.5">
                            <Link
                                href="/cart"
                                preserveState
                                preserveScroll
                                className="relative text-slate-600 group-hover:text-[#03ac0e] transition"
                                title="Keranjang"
                            >
                                <ShoppingCart size={21} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#ef144a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <div className="absolute top-full -right-16 pt-2 hidden lg:group-hover:block z-50">
                                <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h4 className="font-bold text-slate-900 text-xs">Keranjang ({cartCount})</h4>
                                        <Link href="/cart" preserveState preserveScroll className="text-xs font-semibold text-[#03ac0e] hover:underline">
                                            Lihat Sekarang
                                        </Link>
                                    </div>
                                    <p className="text-slate-400 text-xs py-4 text-center">Keranjang siap untuk checkout</p>
                                </div>
                            </div>
                        </div>

                        {/* Pesan */}
                        <div className="relative group h-full flex items-center px-1.5">
                            <Link
                                href="/chat"
                                preserveState
                                preserveScroll
                                className="relative text-slate-600 group-hover:text-[#03ac0e] transition"
                                title="Pesan"
                            >
                                <Mail size={21} />
                                {messageCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#ef144a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                                        {messageCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Notifikasi */}
                        <div className="relative group h-full hidden lg:flex items-center px-1.5">
                            <button
                                type="button"
                                className="relative text-slate-600 group-hover:text-[#03ac0e] transition cursor-pointer"
                                title="Notifikasi"
                            >
                                <Bell size={21} />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#ef144a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />

                        {/* Toko */}
                        <div className="relative group h-full hidden lg:flex items-center px-2">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 group-hover:text-[#03ac0e] transition cursor-pointer py-5">
                                {shopLogo ? (
                                    <img src={shopLogo} alt="Toko" className="w-5 h-5 rounded-md object-cover" />
                                ) : (
                                    <Store size={20} className="text-slate-600 group-hover:text-[#03ac0e]" />
                                )}
                                <span>Toko</span>
                            </div>

                            <div className="absolute top-full -right-6 pt-2 hidden group-hover:block z-50">
                                <div className="w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-4 text-center">
                                    <p className="text-xs text-slate-600 mb-3">Anda belum memiliki toko.</p>
                                    <button className="w-full bg-[#03ac0e] text-white font-bold py-2 rounded-lg text-xs hover:bg-[#029b0c] transition cursor-pointer shadow-xs">
                                        Buka Toko Gratis
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center h-full">
                            {auth.user ? (
                                <div className="relative group h-full flex items-center pl-2">
                                    <Link
                                        href={dashboard()}
                                        preserveState
                                        preserveScroll
                                        className="flex items-center gap-2 text-sm font-semibold text-slate-800 group-hover:text-[#03ac0e] transition py-5"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-orange-100 flex items-center justify-center shrink-0">
                                            <img
                                                src={auth.user.avatar || defaultAvatar}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = defaultAvatar;
                                                }}
                                                alt={auth.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="truncate max-w-[90px]">{auth.user.name || 'Bell'}</span>
                                    </Link>

                                    {/* Dropdown Profil */}
                                    <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="w-[390px] bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden">
                                            <Link
                                                href={dashboard()}
                                                className="flex items-center gap-3 p-3.5 m-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100/80 transition"
                                            >
                                                <div className="w-10 h-10 bg-orange-100 rounded-full overflow-hidden shrink-0 border border-slate-200">
                                                    <img
                                                        src={auth.user.avatar || defaultAvatar}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = defaultAvatar;
                                                        }}
                                                        alt={auth.user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 text-xs truncate">{auth.user.name}</p>
                                                    <span className="text-[10px] text-[#03ac0e] font-bold bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        Member Silver
                                                    </span>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400 shrink-0" />
                                            </Link>

                                            <div className="grid grid-cols-2">
                                                <div className="p-3.5 border-r border-slate-100 space-y-4">
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="p-1 bg-[#03ac0e] rounded-md text-white">
                                                            <Plus size={13} strokeWidth={3} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800 leading-tight">
                                                                PLUS <span className="text-[#03ac0e] font-bold text-[10px]">Langganan</span>
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                                                Gratis Ongkir tanpa batas!
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <AccountMiniLink
                                                        icon={<Wallet size={15} className="text-blue-500" />}
                                                        label="GoPay"
                                                        action="Aktifkan"
                                                    />
                                                    <AccountMiniLink
                                                        icon={<CreditCard size={15} className="text-[#03ac0e]" />}
                                                        label="Market Card"
                                                        action="Daftar"
                                                    />
                                                    <AccountMiniLink
                                                        icon={<Wallet size={15} className="text-[#03ac0e]" />}
                                                        label="Saldo"
                                                        value="Rp0"
                                                    />
                                                </div>

                                                <div className="p-3.5 flex flex-col justify-between">
                                                    <div className="space-y-3">
                                                        <Link
                                                            href="/orders"
                                                            className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-[#03ac0e] transition"
                                                        >
                                                            <ShoppingBag size={16} /> Pembelian
                                                        </Link>
                                                        <Link
                                                            href="/wishlist"
                                                            className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-[#03ac0e] transition"
                                                        >
                                                            <Heart size={16} /> Wishlist
                                                        </Link>
                                                        <Link
                                                            href="/settings"
                                                            className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-[#03ac0e] transition"
                                                        >
                                                            <Settings size={16} /> Pengaturan
                                                        </Link>
                                                    </div>

                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 transition pt-3 border-t border-slate-100 cursor-pointer w-full text-left"
                                                    >
                                                        <LogOut size={15} /> Keluar
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
                                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#03ac0e] border border-[#03ac0e] hover:bg-emerald-50 transition"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        preserveState
                                        preserveScroll
                                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#03ac0e] text-white border border-[#03ac0e] hover:bg-[#029b0c] transition shadow-xs"
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
        <div className="flex items-center justify-between group/item cursor-pointer">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-medium text-slate-700 group-hover/item:text-[#03ac0e]">{label}</span>
            </div>
            {action && <span className="text-[10px] font-bold text-[#03ac0e] hover:underline">{action}</span>}
            {value && <span className="text-xs font-bold text-slate-800">{value}</span>}
        </div>
    );
}