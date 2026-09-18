import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    MapPin,
    ArrowLeft,
    CheckCircle2,
    Save,
    Image as ImageIcon,
    Compass,
    Power,
} from 'lucide-react';
import type { FormEventHandler } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { Store } from '@/types';

interface SellerSettingProps {
    store: Store;
}

export default function SellerSettings({ store }: SellerSettingProps) {
    const { flash } = usePage().props as unknown as { flash?: { success?: string } };

    const { data, setData, patch, processing, errors } = useForm({
        name: store.name || '',
        description: store.description || '',
        city: store.city || '',
        postal_code: store.postal_code || '',
        origin_address: store.origin_address || '',
        latitude: store.latitude !== undefined && store.latitude !== null ? String(store.latitude) : '',
        longitude: store.longitude !== undefined && store.longitude !== null ? String(store.longitude) : '',
        status: (store.status as 'active' | 'vacation') || 'active',
        logo: store.logo || '',
        banner: store.banner || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/seller/settings');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
            <Head title={`Pengaturan Toko & Gudang - ${store.name}`} />
            <Navbar />

            <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
                {/* Header & Back Link */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/seller/dashboard"
                            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Pengaturan Toko & Gudang Asal</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Konfigurasi identitas toko, status operasional, dan lokasi gudang penjemputan logistik.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Flash Alert */}
                {flash?.success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        {/* Section 1: Identitas & Status Toko */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-600" />
                                <span>Identitas & Operasional Toko</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="setting-store-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Nama Toko <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="setting-store-name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="setting-store-status" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Status Operasional Toko
                                    </label>
                                    <select
                                        id="setting-store-status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'active' | 'vacation')}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition bg-white"
                                    >
                                        <option value="active">Buka (Menerima Pesanan)</option>
                                        <option value="vacation">Toko Libur (Tidak Menerima Pesanan)</option>
                                    </select>
                                    {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="setting-store-desc" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Deskripsi Toko
                                </label>
                                <textarea
                                    id="setting-store-desc"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan mengenai profil toko Anda..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                />
                                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="setting-store-logo" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        URL Logo Toko
                                    </label>
                                    <input
                                        id="setting-store-logo"
                                        type="url"
                                        value={data.logo}
                                        onChange={(e) => setData('logo', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                    />
                                    {errors.logo && <p className="text-xs text-red-600 mt-1">{errors.logo}</p>}
                                </div>

                                <div>
                                    <label htmlFor="setting-store-banner" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        URL Banner Toko
                                    </label>
                                    <input
                                        id="setting-store-banner"
                                        type="url"
                                        value={data.banner}
                                        onChange={(e) => setData('banner', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                    />
                                    {errors.banner && <p className="text-xs text-red-600 mt-1">{errors.banner}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Section 2: Gudang Logistik Penjemputan */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span>Alamat Gudang Asal Penjemputan Logistik</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="setting-store-city" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Kota / Kabupaten Gudang <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="setting-store-city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                        required
                                    />
                                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label htmlFor="setting-store-postal-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Kode Pos Gudang <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="setting-store-postal-code"
                                        type="text"
                                        maxLength={10}
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                        required
                                    />
                                    {errors.postal_code && <p className="text-xs text-red-600 mt-1">{errors.postal_code}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="setting-store-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Alamat Fisik Gudang Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="setting-store-address"
                                    rows={3}
                                    value={data.origin_address}
                                    onChange={(e) => setData('origin_address', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                    required
                                />
                                {errors.origin_address && <p className="text-xs text-red-600 mt-1">{errors.origin_address}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="setting-store-lat" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                                        <Compass className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Latitude Gudang</span>
                                    </label>
                                    <input
                                        id="setting-store-lat"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        placeholder="-6.2088"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                    />
                                    {errors.latitude && <p className="text-xs text-red-600 mt-1">{errors.latitude}</p>}
                                </div>

                                <div>
                                    <label htmlFor="setting-store-lng" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                                        <Compass className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Longitude Gudang</span>
                                    </label>
                                    <input
                                        id="setting-store-lng"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        placeholder="106.8456"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                    />
                                    {errors.longitude && <p className="text-xs text-red-600 mt-1">{errors.longitude}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                            <Link
                                href="/seller/dashboard"
                                className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-xl transition"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
