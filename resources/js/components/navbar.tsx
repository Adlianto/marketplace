import { Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { useState } from 'react';

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
    const { auth } = usePage().props as { auth: { user: { name: string; avatar?: string } | null } };
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const [notifTab, setNotifTab] = useState<'transaksi' | 'update'>('transaksi');

    const handleInputChange = (val: string) => {
        setLocalQuery(val);
        if (onSearchChange) onSearchChange(val);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-sans">
            <div className="max-w-[1240px] mx-auto px-3 sm:px-4 lg:px-6">
                <div className="h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-5">
                    
                    <div className="hidden sm:flex items-center gap-6 shrink-0 h-full">
                        <Link href="/" preserveState preserveScroll className="flex items-center">
                            <span className="text-[24px] lg:text-[26px] font-black tracking-tight text-[#03ac0e] select-none">
                                Marketplace
                            </span>
                        </Link>

                        <div className="relative group h-full hidden lg:flex items-center">
                            <button
                                type="button"
                                className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-[#03ac0e] transition cursor-pointer"
                            >
                                Kategori
                            </button>

                            <div className="absolute top-[56px] left-0 w-[580px] bg-white border border-slate-200 rounded-xl shadow-xl p-5 hidden group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50">
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2.5 text-sm">Laptop</h4>
                                        <ul className="space-y-2 text-slate-600">
                                            <li><Link href="/?category=laptop-gaming" preserveState preserveScroll className="hover:text-[#03ac0e]">Laptop Gaming</Link></li>
                                            <li><Link href="/?category=laptop-ultrabook" preserveState preserveScroll className="hover:text-[#03ac0e]">Laptop Ultrabook</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2.5 text-sm">Komponen Inti</h4>
                                        <ul className="space-y-2 text-slate-600">
                                            <li><Link href="/?category=processor-cpu" preserveState preserveScroll className="hover:text-[#03ac0e]">Processor & CPU</Link></li>
                                            <li><Link href="/?category=vga-graphic-card" preserveState preserveScroll className="hover:text-[#03ac0e]">VGA & Graphic Card</Link></li>
                                            <li><Link href="/?category=motherboard" preserveState preserveScroll className="hover:text-[#03ac0e]">Motherboard</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2.5 text-sm">Storage & Part</h4>
                                        <ul className="space-y-2 text-slate-600">
                                            <li><Link href="/?category=ram-memory" preserveState preserveScroll className="hover:text-[#03ac0e]">RAM & Memory</Link></li>
                                            <li><Link href="/?category=ssd-storage" preserveState preserveScroll className="hover:text-[#03ac0e]">SSD & Storage</Link></li>
                                            <li><Link href="/?category=power-supply-psu" preserveState preserveScroll className="hover:text-[#03ac0e]">Power Supply</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-full lg:max-w-2xl">
                        <div className="relative flex items-center">
                            <svg
                                className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari komponen PC & laptop..."
                                value={localQuery}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e] transition"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0 h-full">
                        
                        <div className="relative group h-full flex items-center">
                            <Link
                                href="/cart"
                                preserveState
                                preserveScroll
                                className="relative p-1 text-slate-700 hover:text-[#03ac0e] transition cursor-pointer inline-block"
                                title="Keranjang"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3.5-7H5.4M7 13L5.4 5M7 13l-1.5 6h13m-11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#ef144a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <div className="absolute top-[54px] -right-16 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 hidden lg:group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm">Keranjang ({cartCount})</h4>
                                    <Link href="/cart" preserveState preserveScroll className="text-xs font-bold text-[#03ac0e] hover:underline">
                                        Lihat
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="relative group h-full flex items-center">
                            <Link
                                href="/chat"
                                preserveState
                                preserveScroll
                                className="relative p-1 text-slate-700 hover:text-[#03ac0e] transition cursor-pointer inline-block"
                                title="Pesan"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {messageCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#ef144a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                                        {messageCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        <div className="relative group h-full hidden lg:flex items-center">
                            <button
                                type="button"
                                className="relative p-1 text-slate-700 hover:text-[#03ac0e] transition cursor-pointer"
                                title="Notifikasi"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#ef144a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden lg:block" />

                        <div className="relative group h-full hidden lg:flex items-center">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#03ac0e] transition cursor-pointer">
                                {shopLogo ? (
                                    <img src={shopLogo} alt="Toko" className="w-6 h-6 rounded-md object-cover" />
                                ) : (
                                    <svg className="w-5 h-5 text-slate-600 group-hover:text-[#03ac0e]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18l-1 9H4L3 3zm0 9v9a1 1 0 001 1h16a1 1 0 001-1v-9M9 22V12h6v10" />
                                    </svg>
                                )}
                                <span>Toko</span>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    preserveState
                                    preserveScroll
                                    className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 hover:text-[#03ac0e] transition"
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-orange-100 flex items-center justify-center shrink-0">
                                        <img
                                            src={auth.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${auth.user.name}`}
                                            alt={auth.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="truncate max-w-[100px]">{auth.user.name || 'Bell'}</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Link
                                        href={login()}
                                        preserveState
                                        preserveScroll
                                        className="px-4 py-1.5 rounded-lg text-sm font-bold text-[#03ac0e] border border-[#03ac0e] hover:bg-emerald-50 transition"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        preserveState
                                        preserveScroll
                                        className="px-4 py-1.5 rounded-lg text-sm font-bold bg-[#03ac0e] text-white border border-[#03ac0e] hover:bg-[#029b0c] transition shadow-xs"
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