import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, LogOut, ChevronDown } from 'lucide-react';
import type {ReactNode} from 'react';
import { useState  } from 'react';
import { lazy } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';


const BiodataTab = lazy(() => import('./tab/biodata'));
const AlamatTab = lazy(() => import('./tab/tambahAlamat'));
const PembayaranTab = lazy(() => import('./tab/pembayaran'));
const RekeningTab = lazy(() => import('./tab/rekeningBank'));
const NotifikasiTab = lazy(() => import('./tab/notifikasi'));
const TampilanTab = lazy(() => import('./tab/personalisasi'));
const KeamananTab = lazy(() => import('./tab/keamanan'));

interface UserAuth {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export default function Dashboard() {
  const { auth } = usePage().props as { auth: { user: UserAuth | null } };
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
        return <AlamatTab />;
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
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans antialiased">
      <Head title="Pengaturan Akun" />

      <Navbar />

      <main className="flex-1 py-8 px-4 max-w-[1400px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Kiri */}
          <aside className="w-full lg:w-[270px] shrink-0 space-y-4">
            
            {/* Card User */}
            <div className="p-4 border border-gray-200 rounded-lg shadow-xs flex items-center gap-3 bg-white">
              <img
                src={user?.avatar || defaultAvatar}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                alt="avatar"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-gray-900 truncate">
                  {user?.name || 'Bell'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-tighter">
                  <CheckCircle2 size={10} /> Terverifikasi
                </div>
              </div>
            </div>

            {/* Card Promo Plus */}
            <div className="p-4 border border-gray-200 rounded-lg shadow-xs bg-gradient-to-r from-green-50 to-white">
              <div className="bg-green-600 text-white text-[10px] font-black w-fit px-1.5 py-0.5 rounded mb-2 uppercase">
                Plus
              </div>
              <p className="text-[11px] font-bold text-gray-800 leading-tight">
                Nikmati Gratis Ongkir tanpa batas!
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Min. belanja Rp0, bebas biaya aplikasi~
              </p>
            </div>

            {/* Wallet Section */}
            <div className="py-2 border-b border-gray-100 space-y-1">
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
            <nav className="space-y-3 pt-1 px-1">
              <SidebarNavSection
                title="Kotak Masuk"
                items={[
                  { label: 'Chat', count: 2, href: '/chat' },
                  { label: 'Ulasan', href: '/reviews' },
                  { label: 'Pesan Bantuan', href: '/help' },
                  { label: 'Pesanan Dikomplain', href: '/complaints' },
                  { label: 'Update', href: '/updates' },
                ]}
              />

              <SidebarNavSection
                title="Pembelian"
                items={[
                  { label: 'Menunggu Pembayaran', href: '/orders?status=unpaid' },
                  { label: 'Daftar Transaksi', href: '/orders' },
                ]}
              />

              <SidebarNavSection
                title="Profil Saya"
                items={[
                  { label: 'Wishlist', href: '/wishlist' },
                  { label: 'Toko Favorit', href: '/favorite-shops' },
                  { label: 'Pengaturan', active: true, href: '/dashboard' },
                ]}
              />

              <Link
                href="/logout"
                method="post"
                as="button"
                className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 pl-2 pt-4 w-full text-left cursor-pointer border-t border-gray-100 transition"
              >
                <LogOut size={14} /> Keluar Akun
              </Link>
            </nav>
          </aside>

          {/* Main Content Card (Radius Rapi) */}
          <main className="flex-1 border border-gray-200 rounded-lg p-6 lg:p-7 shadow-xs bg-white h-fit">
            <div className="flex gap-8 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-green-500 border-green-500'
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in duration-300">
              {renderTab()}
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
      <div className="flex items-center justify-between px-2 mb-1.5 cursor-pointer group">
        <span className="text-xs font-bold text-gray-800">{title}</span>
        <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600" />
      </div>
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href || '#'}
            preserveState
            preserveScroll
            className={`flex items-center justify-between py-1.5 px-2 rounded-md text-sm transition cursor-pointer ${
              item.active
                ? 'text-green-500 font-bold bg-green-50'
                : 'text-gray-500 hover:text-green-500 hover:bg-gray-50'
            }`}
          >
            <span>{item.label}</span>
            {item.count && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full font-black">
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
    <div className="flex items-center justify-between py-2 px-2 text-[12px]">
      <div className="flex items-center gap-3">
        <img
          src={icon}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2331/2331941.png';
          }}
          className="w-5 h-5 rounded-full object-cover"
          alt={label}
        />
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span
        className={`font-bold ${
          isLink ? 'text-green-500 hover:underline cursor-pointer' : 'text-gray-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

Dashboard.layout = (page: ReactNode) => page;