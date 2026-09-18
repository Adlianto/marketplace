import { useForm } from '@inertiajs/react';
import { Star, UploadCloud, X, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import type { SubOrderItem } from '@/types/models';

interface ReviewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    subOrderItem: SubOrderItem;
    onSuccess?: () => void;
}

const RATING_DESCRIPTIONS = [
    '',
    'Sangat Buruk - Kecewa dengan produk',
    'Buruk - Tidak sesuai ekspektasi',
    'Cukup - Biasa saja',
    'Puas - Sesuai deskripsi & bagus',
    'Sangat Puas - Sangat direkomendasikan!',
];

export default function ReviewFormModal({
    isOpen,
    onClose,
    subOrderItem,
    onSuccess,
}: ReviewFormModalProps) {
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        sub_order_item_id: number;
        rating: number;
        review: string;
        photos: File[];
    }>({
        sub_order_item_id: subOrderItem.id,
        rating: 5,
        review: '',
        photos: [],
    });

    if (!isOpen) return null;

    const handleRatingClick = (val: number) => {
        setData('rating', val);
    };

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);
        const totalFiles = [...data.photos, ...selectedFiles].slice(0, 3);

        // Revoke old previews
        previewUrls.forEach((url) => URL.revokeObjectURL(url));

        const newPreviewUrls = totalFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        setData('photos', totalFiles);

        // Reset input value to allow selecting same files again if desired
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemovePhoto = (index: number) => {
        const updatedPhotos = data.photos.filter((_, i) => i !== index);
        const removedUrl = previewUrls[index];
        if (removedUrl) {
            URL.revokeObjectURL(removedUrl);
        }
        setPreviewUrls(previewUrls.filter((_, i) => i !== index));
        setData('photos', updatedPhotos);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/reviews', {
            forceFormData: true,
            onSuccess: () => {
                // Cleanup preview blob URLs
                previewUrls.forEach((url) => URL.revokeObjectURL(url));
                setPreviewUrls([]);
                reset();
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            },
        });
    };

    const handleClose = () => {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        clearErrors();
        reset();
        onClose();
    };

    const currentRating = hoverRating || data.rating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            Ulas Produk Pembelian
                        </h3>
                        <p className="text-xs text-gray-500">
                            Ulasan Anda membantu pembeli lain dan penjual
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Product Summary */}
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-gray-900">
                            {subOrderItem.product_title}
                        </p>
                        {subOrderItem.sku_combination && (
                            <p className="text-[11px] text-gray-500">
                                Varian: {subOrderItem.sku_combination}
                            </p>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 mt-0.5">
                            Verified Purchase
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Interactive Star Rating */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Kualitas Produk
                        </label>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                                >
                                    <Star
                                        className={`h-7 w-7 transition-colors ${
                                            star <= currentRating
                                                ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-xs font-medium text-amber-700">
                                {RATING_DESCRIPTIONS[currentRating]}
                            </span>
                        </div>
                        {errors.rating && (
                            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors.rating}
                            </p>
                        )}
                    </div>

                    {/* Review Textarea */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Tulis Ulasan Anda
                            </label>
                            <span
                                className={`text-[11px] ${
                                    data.review.length < 10
                                        ? 'text-gray-400'
                                        : data.review.length > 1000
                                          ? 'text-rose-600 font-bold'
                                          : 'text-emerald-600 font-medium'
                                }`}
                            >
                                {data.review.length}/1000 (Min. 10 karakter)
                            </span>
                        </div>
                        <textarea
                            rows={4}
                            value={data.review}
                            onChange={(e) => setData('review', e.target.value)}
                            placeholder="Bagikan pengalaman Anda tentang performa, kualitas bahan, dan pengemasan produk..."
                            className={`w-full rounded-xl border p-3 text-xs text-gray-900 transition focus:outline-none ${
                                errors.review
                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                                    : 'border-gray-200 focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e]'
                            }`}
                        />
                        {errors.review && (
                            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors.review}
                            </p>
                        )}
                    </div>

                    {/* Photos Upload & Previews */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-gray-700">
                                Foto Produk (Opsional)
                            </label>
                            <span className="text-[11px] text-gray-400">
                                Maks. 3 foto (JPG, PNG, WEBP, maks. 2MB)
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {previewUrls.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-xs"
                                >
                                    <img
                                        src={url}
                                        alt={`Preview ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(idx)}
                                        className="absolute top-1 right-1 rounded-full bg-gray-900/70 p-1 text-white opacity-90 hover:opacity-100 hover:bg-rose-600 transition"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            {data.photos.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-[#03ac0e] hover:bg-emerald-50/30 hover:text-[#03ac0e] transition cursor-pointer"
                                >
                                    <UploadCloud className="h-5 w-5 mb-0.5" />
                                    <span className="text-[10px] font-semibold">
                                        + Foto
                                    </span>
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
                            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors.photos}
                            </p>
                        )}
                    </div>

                    {errors.sub_order_item_id && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errors.sub_order_item_id}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={processing}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.review.trim().length < 10}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#03ac0e] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Ulasan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
