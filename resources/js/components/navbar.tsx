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
            <div className="max-w-[1240px] mx-auto px-4 lg:px-6">
                <div className="h-16 flex items-center justify-between gap-5">
                    
                    <div className="flex items-center gap-6 shrink-0 h-full">
                        <Link href="/" preserveState preserveScroll className="flex items-center">
                            <span className="text-[26px] font-black tracking-tight text-[#03ac0e] select-none">
                                tokopedia
                            </span>
                        </Link>

                        <div className="relative group h-full flex items-center">
                            <button
                                type="button"
                                className="hidden sm:inline-flex items-center text-sm font-semibold text-slate-700 hover:text-[#03ac0e] transition cursor-pointer"
                            >
                                Kategori
                            </button>

                            <div className="absolute top-[56px] left-0 w-[580px] bg-white border border-slate-200 rounded-xl shadow-xl p-5 hidden group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50">
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2.5 text-sm">Elektronik</h4>
                                        <ul className="space-y-2 text-slate-600">
                                            <li><Link href="/?category=handphone-tablet" preserveState preserveScroll className="hover:text-[#03ac0e]">Handphone & Tablet</Link></li>
                                            <li><Link href="/?category=komputer-laptop" preserveState preserveScroll className="hover:text-[#03ac0e]">Komputer & Laptop</Link></li>
                                            <li><Link href="/?category=audio-video" preserveState preserveScroll className="hover:text-[#03ac0e]">Audio & Speaker</Link></li>
                                            <li><Link href="/?category=elektronik" preserveState preserveScroll className="hover:text-[#03ac0e]">Kamera & Aksesoris</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2.5 text-sm">Hardware & Gaming</h4>
                                        <ul className="space-y-2 text-slate-600">
                                            <li><Link href="/?category=laptop-gaming" preserveState preserveScroll className="hover:text-[#03ac0e]">Laptop Gaming</Link></li>
                                            <li><Link href="/?category=vga-graphic-card" preserveState preserveScroll className="hover:text-[#03ac0e]">VGA & Graphic Card</Link></li>
                                            <li><Link href="/?category=processor-cpu" preserveState preserveScroll className="hover:text-[#03ac0e]">Processor & CPU</Link></li>
                                            <li><Link href="/?category=gaming-gear" preserveState preserveScroll className="hover:text-[#03ac0e]">Gaming Gear</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2.5 text-sm">Komponen PC</h4>
                                        <ul className="space-y-2 text-slate-600">
                                            <li><Link href="/?category=motherboard" preserveState preserveScroll className="hover:text-[#03ac0e]">Motherboard</Link></li>
                                            <li><Link href="/?category=ram-memory" preserveState preserveScroll className="hover:text-[#03ac0e]">RAM & Memory</Link></li>
                                            <li><Link href="/?category=ssd-storage" preserveState preserveScroll className="hover:text-[#03ac0e]">SSD & Storage</Link></li>
                                            <li><Link href="/?category=power-supply-psu" preserveState preserveScroll className="hover:text-[#03ac0e]">Power Supply & PSU</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl">
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
                                placeholder="Cari komponen PC & laptop di Tokopedia"
                                value={localQuery}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e] transition"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 h-full">
                        
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

                            <div className="absolute top-[54px] -right-16 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 hidden group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm">Keranjang ({cartCount})</h4>
                                    <Link href="/cart" preserveState preserveScroll className="text-xs font-bold text-[#03ac0e] hover:underline">
                                        Lihat
                                    </Link>
                                </div>

                                <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto">
                                    <div className="py-3 flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                                            <span className="absolute top-0 left-0 bg-[#ef144a] text-white text-[8px] font-bold px-1 rounded-br">32%</span>
                                            <img
                                                src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=60"
                                                alt="AJAZZ AK820"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-800 truncate">AJAZZ AK820 Monochrome Mechanical...</p>
                                            <p className="text-[11px] text-slate-400">White</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold text-slate-900">2 x Rp273.000</p>
                                            <p className="text-[10px] text-slate-400 line-through">Rp399.000</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative group h-full flex items-center">
                            <button
                                type="button"
                                className="relative p-1 text-slate-700 hover:text-[#03ac0e] transition cursor-pointer hidden sm:block"
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

                            <div className="absolute top-[54px] -right-20 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden hidden group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50">
                                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                                    <h4 className="font-bold text-slate-900 text-sm">Notifikasi</h4>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 text-center text-xs font-bold border-b border-slate-100">
                                    <button
                                        onClick={() => setNotifTab('transaksi')}
                                        className={`py-2.5 transition cursor-pointer ${
                                            notifTab === 'transaksi'
                                                ? 'text-[#03ac0e] border-b-2 border-[#03ac0e]'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Transaksi
                                    </button>
                                    <button
                                        onClick={() => setNotifTab('update')}
                                        className={`py-2.5 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                            notifTab === 'update'
                                                ? 'text-[#03ac0e] border-b-2 border-[#03ac0e]'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <span>Update (18)</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ef144a]" />
                                    </button>
                                </div>

                                <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-3">
                                            <span className="font-bold text-slate-800">Pembelian</span>
                                            <Link href="/pembelian" preserveState preserveScroll className="font-bold text-[#03ac0e] hover:underline">Lihat Semua</Link>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mb-3">Menunggu Pembayaran</p>

                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#03ac0e] flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] text-slate-600 leading-tight">Konfirmasi</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#03ac0e] flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] text-slate-600 leading-tight">Diproses</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#03ac0e] flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <rect x="1" y="3" width="15" height="13" />
                                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] text-slate-600 leading-tight">Dikirim</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#03ac0e] flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] text-slate-600 leading-tight">Tujuan</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100">
                                        <h5 className="text-xs font-bold text-slate-800 mb-1">Penjualan</h5>
                                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                                            Cek pesanan yang masuk dan perkembangan tokomu secara rutin
                                        </p>
                                        <Link href="/seller" preserveState preserveScroll className="block text-center w-full py-2 border border-[#03ac0e] text-[#03ac0e] font-bold text-xs rounded-lg hover:bg-emerald-50 transition">
                                            Masuk ke Tokopedia Seller
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative group h-full flex items-center">
                            <button
                                type="button"
                                className="relative p-1 text-slate-700 hover:text-[#03ac0e] transition cursor-pointer hidden sm:block"
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
                            </button>

                            <div className="absolute top-[54px] -right-12 w-[220px] bg-white border border-slate-200 rounded-xl shadow-2xl py-2 hidden group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50">
                                <Link href="/chat" preserveState preserveScroll className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#03ac0e] transition">
                                    <span className="font-semibold">Chat</span>
                                    <span className="w-4 h-4 rounded-full bg-[#ef144a] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                                </Link>
                                <Link href="/reviews" preserveState preserveScroll className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#03ac0e] transition">
                                    Ulasan
                                </Link>
                                <Link href="/help" preserveState preserveScroll className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#03ac0e] transition">
                                    Pesan Bantuan
                                </Link>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

                        <div className="relative group h-full flex items-center">
                            <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#03ac0e] transition cursor-pointer">
                                {shopLogo ? (
                                    <img src={shopLogo} alt="Toko" className="w-6 h-6 rounded-md object-cover" />
                                ) : (
                                    <svg className="w-5 h-5 text-slate-600 group-hover:text-[#03ac0e]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18l-1 9H4L3 3zm0 9v9a1 1 0 001 1h16a1 1 0 001-1v-9M9 22V12h6v10" />
                                    </svg>
                                )}
                                <span>Toko</span>
                            </div>

                            <div className="absolute top-[54px] -right-10 w-[270px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 hidden group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50 text-center">
                                <p className="text-xs font-semibold text-slate-700 mb-4">Anda belum memiliki toko.</p>
                                <Link href="/open-shop" preserveState preserveScroll className="block w-full py-2.5 bg-[#03ac0e] text-white font-bold text-xs rounded-lg hover:bg-[#029b0c] transition shadow-xs">
                                    Buka Toko Gratis
                                </Link>
                            </div>
                        </div>

                        {auth.user ? (
                            <div className="relative group h-full flex items-center">
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

                                <div className="absolute top-[54px] right-0 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden hidden group-hover:block transition-all duration-200 ease-out origin-top transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-50">
                                    <Link href={dashboard()} preserveState preserveScroll className="flex items-center gap-3 p-3.5 m-2 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-orange-100 shrink-0">
                                            <img
                                                src={auth.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${auth.user.name}`}
                                                alt={auth.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-xs truncate">{auth.user.name}</p>
                                            <span className="text-[9px] font-bold text-[#03ac0e] bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Member Silver</span>
                                        </div>
                                        <span className="text-slate-400 text-xs">&gt;</span>
                                    </Link>

                                    <div className="grid grid-cols-2 divide-x divide-slate-100">
                                        <div className="p-3.5 space-y-3.5">
                                            <div className="flex items-start gap-2">
                                                <div className="p-1 bg-[#03ac0e] text-white rounded text-[10px] font-black">+</div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 leading-tight">PLUS <span className="text-[#03ac0e] text-[10px]">Langganan</span></p>
                                                    <p className="text-[9px] text-slate-500 leading-tight">Bebas Ongkir tanpa batas</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600 font-medium">GoPay</span>
                                                    <span className="text-[10px] font-bold text-[#03ac0e] cursor-pointer hover:underline">Aktifkan</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600 font-medium">Saldo</span>
                                                    <span className="font-bold text-slate-900">Rp0</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3.5 flex flex-col justify-between text-xs text-slate-600">
                                            <div className="space-y-2.5">
                                                <Link href="/pembelian" preserveState preserveScroll className="block hover:text-[#03ac0e] transition">Pembelian</Link>
                                                <Link href="/wishlist" preserveState preserveScroll className="block hover:text-[#03ac0e] transition">Wishlist</Link>
                                                <Link href="/settings" preserveState preserveScroll className="block hover:text-[#03ac0e] transition">Pengaturan</Link>
                                            </div>

                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="text-left text-slate-400 hover:text-red-500 transition pt-3 border-t border-slate-100 font-semibold w-full"
                                            >
                                                Keluar
                                            </Link>
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
        </header>
    );
}