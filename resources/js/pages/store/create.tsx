import { Head, useForm } from '@inertiajs/react';
import {
    Store,
    MapPin,
    Building2,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import type { FormEventHandler } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

export default function StoreCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        city: '',
        postal_code: '',
        origin_address: '',
        description: '',
    });

    const handleNameChange = (name: string) => {
        const generatedSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

        setData((prev) => ({
            ...prev,
            name,
            slug:
                prev.slug === '' ||
                prev.slug ===
                    prev.name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-')
                    ? generatedSlug
                    : prev.slug,
        }));
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/store');
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900">
            <Head title="Buka Toko Gratis - Marketplace" />
            <Navbar />

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-white">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                                <Store className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Buka Toko Gratis di Marketplace
                                </h1>
                                <p className="mt-1 text-sm text-emerald-100">
                                    Jangkau jutaan pembeli dan kembangkan bisnis
                                    Anda secara mudah, aman, dan terpercaya.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Benefit Checklist */}
                    <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-emerald-50/50 p-6 text-xs text-slate-700 sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Bebas Biaya Pendaftaran</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Multi-Kurir Otomatis Terintegrasi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Pencairan Dana Aman (Escrow)</span>
                        </div>
                    </div>

                    {/* Form Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 p-6 md:p-8"
                    >
                        <div className="space-y-4">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                <Building2 className="h-5 w-5 text-emerald-600" />
                                Informasi Identitas Toko
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="store-name"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Nama Toko{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="store-name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            handleNameChange(e.target.value)
                                        }
                                        placeholder="Contoh: Toko Elektronik Jaya"
                                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                                        htmlFor="store-slug"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Domain / Slug Toko{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex overflow-hidden rounded-lg border border-slate-300 transition focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
                                        <span className="flex items-center border-r border-slate-200 bg-slate-100 px-3 py-2.5 text-xs text-slate-500 select-none">
                                            /toko/
                                        </span>
                                        <input
                                            id="store-slug"
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData(
                                                    'slug',
                                                    e.target.value
                                                        .toLowerCase()
                                                        .replace(
                                                            /[^a-z0-9-]/g,
                                                            '',
                                                        ),
                                                )
                                            }
                                            placeholder="toko-elektronik-jaya"
                                            className="w-full px-3 py-2 text-sm focus:outline-none"
                                            required
                                        />
                                    </div>
                                    {errors.slug && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="store-description"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Deskripsi Singkat Toko{' '}
                                    <span className="font-normal text-slate-400">
                                        (Opsional)
                                    </span>
                                </label>
                                <textarea
                                    id="store-description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Ceritakan tentang toko dan produk yang Anda jual..."
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        <div className="space-y-4">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                                Alamat Lokasi Gudang / Penjemputan Kurir
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="store-city"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Kota / Kabupaten{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="store-city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) =>
                                            setData('city', e.target.value)
                                        }
                                        placeholder="Contoh: Kota Jakarta Selatan"
                                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                                        htmlFor="store-postal-code"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Kode Pos{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="store-postal-code"
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
                                        placeholder="Contoh: 12190"
                                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                                    htmlFor="store-address"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Alamat Fisik Lengkap{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="store-address"
                                    rows={3}
                                    value={data.origin_address}
                                    onChange={(e) =>
                                        setData(
                                            'origin_address',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Jalan, nomor gedung/rumah, RT/RW, kelurahan, dan patokan lokasi gudang..."
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    required
                                />
                                {errors.origin_address && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.origin_address}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {processing
                                    ? 'Memproses...'
                                    : 'Buka Toko Sekarang'}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
