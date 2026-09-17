import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, LogOut } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import type { ReactNode } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { Address, User } from '@/types';

const BiodataTab = lazy(() => import('@/components/dashboard/tabs/biodata'));
const AlamatTab = lazy(() => import('@/components/dashboard/tabs/tambahAlamat'));
const PembayaranTab = lazy(() => import('@/components/dashboard/tabs/pembayaran'));
const RekeningTab = lazy(() => import('@/components/dashboard/tabs/rekeningBank'));
const NotifikasiTab = lazy(() => import('@/components/dashboard/tabs/notifikasi'));
const TampilanTab = lazy(() => import('@/components/dashboard/tabs/personalisasi'));
const KeamananTab = lazy(() => import('@/components/dashboard/tabs/keamanan'));

interface DashboardProps {
    addresses?: Address[];
}

export default function Dashboard({ addresses = [] }: DashboardProps) {
    const { auth } = usePage().props as unknown as { auth: { user: User | null } };
    const user = auth.user;

    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Bell'}`;

    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem('active_account_tab');

            return savedTab || 'biodatadiri';
        }

        return 'biodatadiri';
    });

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);

        if (typeof window !== 'undefined') {
            localStorage.setItem('active_account_tab', tabId);
        }
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'biodatadiri':
                return <BiodataTab />;
            case 'daftaralamat':
                return <AlamatTab addresses={addresses} />;
            case 'pembayaran':
                return <PembayaranTab />;
            case 'rekeningbank':
                return <RekeningTab />;
            case 'notifikasi':
                return <NotifikasiTab />;
            case 'modetampilan':
                return <TampilanTab />;
            case 'keamanan':
                return <KeamananTab />;
            default:
                return <BiodataTab />;
        }
    };

    const tabs = [
        { id: 'biodatadiri', label: 'Biodata Diri' },
        { id: 'daftaralamat', label: 'Daftar Alamat' },
        { id: 'pembayaran', label: 'Pembayaran' },
        { id: 'rekeningbank', label: 'Rekening Bank' },
        { id: 'notifikasi', label: 'Notifikasi' },
        { id: 'modetampilan', label: 'Mode Tampilan' },
        { id: 'keamanan', label: 'Keamanan' },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-gray-800 antialiased">
            <Head title="Pengaturan Akun" />

            <Navbar />

            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8">
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Sidebar Kiri */}
                    <aside className="w-full shrink-0 space-y-4 lg:w-[270px]">
                        {/* Card User */}
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
                            <img
                                src={user?.avatar || defaultAvatar}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        defaultAvatar;
                                }}
                                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                                alt="avatar"
                            />
                            <div className="overflow-hidden">
                                <p className="truncate text-sm font-bold text-gray-900">
                                    {user?.name || 'Bell'}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] font-bold tracking-tighter text-green-500 uppercase">
                                    <CheckCircle2 size={10} /> Terverifikasi
                                </div>
                            </div>
                        </div>

                        {/* Card Promo Plus */}
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-white p-4 shadow-xs">
                            <div className="mb-2 w-fit rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-black text-white uppercase">
                                Plus
                            </div>
                            <p className="text-[11px] leading-tight font-bold text-gray-800">
                                Nikmati Gratis Ongkir tanpa batas!
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">
                                Min. belanja Rp0, bebas biaya aplikasi~
                            </p>
                        </div>

                        {/* Wallet Section */}
                        <div className="space-y-1 border-b border-gray-100 py-2">
                            <SidebarWallet
                                icon="https://p7.hiclipart.com/preview/411/493/941/logo-gopay-application-software-indonesia-money-wallet-indonesia.jpg"
                                label="GoPay"
                                value="Aktifkan"
                                isLink
                            />
                            <SidebarWallet
                                icon="https://static.republika.co.id/uploads/images/inpicture_slide/tokopedia-card_220603171309-847.jpg"
                                label="Dana"
                                value="Daftar"
                                isLink
                            />
                            <SidebarWallet
                                icon="https://cdn-icons-png.flaticon.com/512/2331/2331941.png"
                                label="Saldo"
                                value="Rp0"
                            />
                        </div>

                        {/* Navigasi Sidebar */}
                        <nav className="space-y-3 px-1 pt-1">
                            <SidebarNavSection
                                title="Kotak Masuk"
                                items={[
                                    { label: 'Chat', count: 2, href: '/chat' },
                                    { label: 'Ulasan', href: '/reviews' },
                                    { label: 'Pesan Bantuan', href: '/help' },
                                    {
                                        label: 'Pesanan Dikomplain',
                                        href: '/complaints',
                                    },
                                    { label: 'Update', href: '/updates' },
                                ]}
                            />

                            <SidebarNavSection
                                title="Pembelian"
                                items={[
                                    {
                                        label: 'Menunggu Pembayaran',
                                        href: '/orders?status=unpaid',
                                    },
                                    {
                                        label: 'Daftar Transaksi',
                                        href: '/orders',
                                    },
                                ]}
                            />

                            <SidebarNavSection
                                title="Profil Saya"
                                items={[
                                    { label: 'Wishlist', href: '/wishlist' },
                                    {
                                        label: 'Toko Favorit',
                                        href: '/favorite-shops',
                                    },
                                    {
                                        label: 'Pengaturan',
                                        active: true,
                                        href: '/dashboard',
                                    },
                                ]}
                            />

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full cursor-pointer items-center gap-2 border-t border-gray-100 pt-4 pl-2 text-left text-xs font-bold text-red-500 transition hover:text-red-600"
                            >
                                <LogOut size={14} /> Keluar Akun
                            </Link>
                        </nav>
                    </aside>

                    {/* Main Content Card (Radius Rapi) */}
                    <main className="h-fit flex-1 rounded-lg border border-gray-200 bg-white p-6 shadow-xs lg:p-7">
                        <div className="no-scrollbar mb-6 flex gap-8 overflow-x-auto border-b border-gray-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`cursor-pointer border-b-2 pb-3 text-sm font-bold whitespace-nowrap transition-all ${
                                        activeTab === tab.id
                                            ? 'border-green-500 text-green-500'
                                            : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="animate-in duration-300 fade-in">
                            <Suspense
                                fallback={
                                    <div className="py-12 text-center text-xs text-gray-400">
                                        Memuat...
                                    </div>
                                }
                            >
                                {renderTab()}
                            </Suspense>
                        </div>
                    </main>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function SidebarNavSection({
    title,
    items,
}: {
    title: string;
    items: { label: string; count?: number; active?: boolean; href?: string }[];
}) {
    return (
        <div className="mb-3">
            <div className="group mb-1.5 flex cursor-pointer items-center justify-between px-2">
                <span className="text-xs font-bold text-gray-800">{title}</span>
                <ChevronDown
                    size={14}
                    className="text-gray-400 group-hover:text-gray-600"
                />
            </div>
            <div className="space-y-0.5">
                {items.map((item, i) => (
                    <Link
                        key={i}
                        href={item.href || '#'}
                        preserveState
                        preserveScroll
                        className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition ${
                            item.active
                                ? 'bg-green-50 font-bold text-green-500'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-green-500'
                        }`}
                    >
                        <span>{item.label}</span>
                        {item.count && (
                            <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                                {item.count}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

function SidebarWallet({
    icon,
    label,
    value,
    isLink,
}: {
    icon: string;
    label: string;
    value: string;
    isLink?: boolean;
}) {
    return (
        <div className="flex items-center justify-between px-2 py-2 text-[12px]">
            <div className="flex items-center gap-3">
                <img
                    src={icon}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://cdn-icons-png.flaticon.com/512/2331/2331941.png';
                    }}
                    className="h-5 w-5 rounded-full object-cover"
                    alt={label}
                />
                <span className="font-medium text-gray-600">{label}</span>
            </div>
            <span
                className={`font-bold ${
                    isLink
                        ? 'cursor-pointer text-green-500 hover:underline'
                        : 'text-gray-800'
                }`}
            >
                {value}
            </span>
        </div>
    );
}

Dashboard.layout = (page: ReactNode) => page;
