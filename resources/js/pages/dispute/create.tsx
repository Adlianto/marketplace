import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    Loader2,
    Package,
    ShieldAlert,
    Store as StoreIcon,
    UploadCloud,
    X,
} from 'lucide-react';
import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import type { SubOrder } from '@/types/models';

interface DisputeCreateProps {
    subOrder: SubOrder;
}

const DISPUTE_REASONS = [
    'Barang Rusak / Pecah Saat Diterima',
    'Barang Tidak Lengkap / Ada Bagian Hilang',
    'Salah Kirim Produk / Varian Berbeda',
    'Barang Cacat Produksi / Tidak Berfungsi',
    'Kemasan Terbuka / Paket Rusak Parah',
    'Lainnya',
];

const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
};

export default function DisputeCreate({ subOrder }: DisputeCreateProps) {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        sub_order_id: number;
        reason: string;
        description: string;
        photos: File[];
    }>({
        sub_order_id: subOrder.id,
        reason: DISPUTE_REASONS[0],
        description: '',
        photos: [],
    });

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);
        const combined = [...data.photos, ...selectedFiles].slice(0, 5);

        // Revoke old previews
        previewUrls.forEach((url) => URL.revokeObjectURL(url));

        const newPreviews = combined.map((file) => URL.createObjectURL(file));
        setPreviewUrls(newPreviews);
        setData('photos', combined);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemovePhoto = (index: number) => {
        const updated = data.photos.filter((_, i) => i !== index);
        const removed = previewUrls[index];
        if (removed) {
            URL.revokeObjectURL(removed);
        }
        setPreviewUrls(previewUrls.filter((_, i) => i !== index));
        setData('photos', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/disputes', {
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title={`Ajukan Komplain - Pesanan #${subOrder.sub_order_number}`} />
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href="/dashboard?tab=pesanan"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Pesanan
                    </Link>
                </div>

                {/* Main Card */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-slate-100 bg-amber-500/10 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">
                                    Pusat Resolusi Komplain Pesanan
                                </h1>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Laporkan kendala produk untuk menahan pencairan dana ke penjual hingga masalah terselesaikan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Escrow Notice */}
                    <div className="m-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-950">
                                Perlindungan Pembeli (Escrow Protection) Aktif:
                            </p>
                            <p className="mt-0.5 text-amber-900 leading-relaxed">
                                Begitu komplain ini diajukan, dana pembayaran sebesar{' '}
                                <strong>{formatRupiah(subOrder.total_amount)}</strong> akan secara otomatis dibekukan di rekening penampung (Escrow).
                                Penjual tidak dapat mencairkan dana sebelum kesepakatan solusi tercapai.
                            </p>
                        </div>
                    </div>

                    {/* Order & Store Info */}
                    <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 text-xs">
                            <div className="flex items-center gap-2">
                                <StoreIcon className="h-4 w-4 text-slate-500" />
                                <span className="font-bold text-slate-900">{subOrder.store?.name}</span>
                            </div>
                            <span className="font-mono text-slate-500">#{subOrder.sub_order_number}</span>
                        </div>

                        <div className="space-y-2">
                            {subOrder.items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <Package className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium text-slate-800">{item.product_title}</span>
                                        {item.sku_combination && (
                                            <span className="text-[11px] text-slate-500">({item.sku_combination})</span>
                                        )}
                                        <span className="text-slate-400">× {item.quantity}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">{formatRupiah(item.total_price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                        {/* Reason */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Alasan Komplain <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                                {DISPUTE_REASONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                            {errors.reason && (
                                <p className="mt-1 text-xs text-rose-600">{errors.reason}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-700">
                                    Jelaskan Kendala Barang Secara Rinci <span className="text-rose-500">*</span>
                                </label>
                                <span className={`text-[11px] ${data.description.length < 15 ? 'text-slate-400' : 'text-emerald-600 font-medium'}`}>
                                    {data.description.length}/2000 (Min. 15 karakter)
                                </span>
                            </div>
                            <textarea
                                rows={5}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Jelaskan secara detail bagian barang yang rusak, salah kirim, atau tidak sesuai saat Anda membuka paket..."
                                className={`w-full rounded-xl border p-3 text-xs text-slate-900 focus:outline-none ${
                                    errors.description
                                        ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                        : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                                }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Evidence Photos */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-700">
                                    Lampirkan Foto Bukti Kerusakan / Kesalahan <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] text-slate-400">
                                    1 - 5 foto (JPG, PNG, WEBP, maks 2MB per foto)
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {previewUrls.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs"
                                    >
                                        <img
                                            src={url}
                                            alt={`Bukti ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(idx)}
                                            className="absolute top-1 right-1 rounded-full bg-slate-900/70 p-1 text-white hover:bg-rose-600 transition"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}

                                {data.photos.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-amber-500 hover:bg-amber-50/30 hover:text-amber-600 transition cursor-pointer"
                                    >
                                        <UploadCloud className="h-6 w-6 mb-1" />
                                        <span className="text-[11px] font-semibold">+ Tambah Foto</span>
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>
                            {errors.photos && (
                                <p className="mt-1 text-xs text-rose-600">{errors.photos}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                            <Link
                                href="/dashboard?tab=pesanan"
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || data.description.trim().length < 15 || data.photos.length === 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 transition cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mengajukan Komplain...
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="h-4 w-4" />
                                        Kirim Komplain & Tahan Dana
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
