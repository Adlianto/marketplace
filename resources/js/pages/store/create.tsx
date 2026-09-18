import { Head, useForm } from '@inertiajs/react';
import { Store, MapPin, Building2, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import type { FormEventHandler } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

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
            slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') 
                ? generatedSlug 
                : prev.slug,
        }));
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/store');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
            <Head title="Buka Toko Gratis - Marketplace" />
            <Navbar />

            <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Store className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Buka Toko Gratis di Marketplace</h1>
                                <p className="text-emerald-100 text-sm mt-1">
                                    Jangkau jutaan pembeli dan kembangkan bisnis Anda secara mudah, aman, dan terpercaya.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Benefit Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-emerald-50/50 border-b border-slate-100 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Bebas Biaya Pendaftaran</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Multi-Kurir Otomatis Terintegrasi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Pencairan Dana Aman (Escrow)</span>
                        </div>
                    </div>

                    {/* Form Input */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                                Informasi Identitas Toko
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="store-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Nama Toko <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="store-name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="Contoh: Toko Elektronik Jaya"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="store-slug" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Domain / Slug Toko <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition">
                                        <span className="bg-slate-100 text-slate-500 text-xs px-3 py-2.5 flex items-center select-none border-r border-slate-200">
                                            /toko/
                                        </span>
                                        <input
                                            id="store-slug"
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            placeholder="toko-elektronik-jaya"
                                            className="w-full px-3 py-2 text-sm focus:outline-none"
                                            required
                                        />
                                    </div>
                                    {errors.slug && <p className="text-xs text-red-600 mt-1">{errors.slug}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="store-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Deskripsi Singkat Toko <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    id="store-description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Ceritakan tentang toko dan produk yang Anda jual..."
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                />
                                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        <div className="space-y-4">
                            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                                Alamat Lokasi Gudang / Penjemputan Kurir
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="store-city" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Kota / Kabupaten <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="store-city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Contoh: Kota Jakarta Selatan"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                        required
                                    />
                                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label htmlFor="store-postal-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Kode Pos <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="store-postal-code"
                                        type="text"
                                        maxLength={10}
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value.replace(/\D/g, ''))}
                                        placeholder="Contoh: 12190"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                        required
                                    />
                                    {errors.postal_code && <p className="text-xs text-red-600 mt-1">{errors.postal_code}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="store-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Alamat Fisik Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="store-address"
                                    rows={3}
                                    value={data.origin_address}
                                    onChange={(e) => setData('origin_address', e.target.value)}
                                    placeholder="Jalan, nomor gedung/rumah, RT/RW, kelurahan, dan patokan lokasi gudang..."
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                                    required
                                />
                                {errors.origin_address && <p className="text-xs text-red-600 mt-1">{errors.origin_address}</p>}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-sm transition"
                            >
                                {processing ? 'Memproses...' : 'Buka Toko Sekarang'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
