import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    MapPin,
    ArrowLeft,
    CheckCircle2,
    Save,
    Compass,
} from 'lucide-react';
import type { FormEventHandler } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { Store } from '@/types';

interface SellerSettingProps {
    store: Store;
}

export default function SellerSettings({ store }: SellerSettingProps) {
    const { flash } = usePage().props as unknown as {
        flash?: { success?: string };
    };

    const { data, setData, patch, processing, errors } = useForm({
        name: store.name || '',
        description: store.description || '',
        city: store.city || '',
        postal_code: store.postal_code || '',
        origin_address: store.origin_address || '',
        latitude:
            store.latitude !== undefined && store.latitude !== null
                ? String(store.latitude)
                : '',
        longitude:
            store.longitude !== undefined && store.longitude !== null
                ? String(store.longitude)
                : '',
        status: (store.status as 'active' | 'vacation') || 'active',
        logo: store.logo || '',
        banner: store.banner || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/seller/settings');
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
            <Head title={`Pengaturan Toko & Gudang - ${store.name}`} />
            <Navbar />

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
                {/* Header & Back Link */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/seller/dashboard"
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-slate-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Pengaturan Toko & Gudang Asal
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Konfigurasi identitas toko, status operasional,
                                dan lokasi gudang penjemputan logistik.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Flash Alert */}
                {flash?.success && (
                    <div className="mb-6 flex animate-in items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 fade-in">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8 p-6 md:p-8"
                    >
                        {/* Section 1: Identitas & Status Toko */}
                        <div className="space-y-4">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                <Building2 className="h-4 w-4 text-emerald-600" />
                                <span>Identitas & Operasional Toko</span>
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="setting-store-name"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Nama Toko{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="setting-store-name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="setting-store-status"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Status Operasional Toko
                                    </label>
                                    <select
                                        id="setting-store-status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData(
                                                'status',
                                                e.target.value as
                                                    'active' | 'vacation',
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    >
                                        <option value="active">
                                            Buka (Menerima Pesanan)
                                        </option>
                                        <option value="vacation">
                                            Toko Libur (Tidak Menerima Pesanan)
                                        </option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="setting-store-desc"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Deskripsi Toko
                                </label>
                                <textarea
                                    id="setting-store-desc"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Jelaskan mengenai profil toko Anda..."
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="setting-store-logo"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        URL Logo Toko
                                    </label>
                                    <input
                                        id="setting-store-logo"
                                        type="url"
                                        value={data.logo}
                                        onChange={(e) =>
                                            setData('logo', e.target.value)
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    />
                                    {errors.logo && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.logo}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="setting-store-banner"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        URL Banner Toko
                                    </label>
                                    <input
                                        id="setting-store-banner"
                                        type="url"
                                        value={data.banner}
                                        onChange={(e) =>
                                            setData('banner', e.target.value)
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    />
                                    {errors.banner && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.banner}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Section 2: Gudang Logistik Penjemputan */}
                        <div className="space-y-4">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                <span>
                                    Alamat Gudang Asal Penjemputan Logistik
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="setting-store-city"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Kota / Kabupaten Gudang{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="setting-store-city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) =>
                                            setData('city', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                        required
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.city}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="setting-store-postal-code"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Kode Pos Gudang{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="setting-store-postal-code"
                                        type="text"
                                        maxLength={10}
                                        value={data.postal_code}
                                        onChange={(e) =>
                                            setData(
                                                'postal_code',
                                                e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                        required
                                    />
                                    {errors.postal_code && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.postal_code}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="setting-store-address"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Alamat Fisik Gudang Lengkap{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="setting-store-address"
                                    rows={3}
                                    value={data.origin_address}
                                    onChange={(e) =>
                                        setData(
                                            'origin_address',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    required
                                />
                                {errors.origin_address && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.origin_address}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="setting-store-lat"
                                        className="mb-1.5 block flex items-center gap-1 text-xs font-semibold text-slate-700"
                                    >
                                        <Compass className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Latitude Gudang</span>
                                    </label>
                                    <input
                                        id="setting-store-lat"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) =>
                                            setData('latitude', e.target.value)
                                        }
                                        placeholder="-6.2088"
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    />
                                    {errors.latitude && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.latitude}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="setting-store-lng"
                                        className="mb-1.5 block flex items-center gap-1 text-xs font-semibold text-slate-700"
                                    >
                                        <Compass className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Longitude Gudang</span>
                                    </label>
                                    <input
                                        id="setting-store-lng"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) =>
                                            setData('longitude', e.target.value)
                                        }
                                        placeholder="106.8456"
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    />
                                    {errors.longitude && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.longitude}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <Link
                                href="/seller/dashboard"
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-700 transition hover:border-slate-300"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
