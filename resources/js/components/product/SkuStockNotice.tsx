import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface SkuStockNoticeProps {
    stock: number;
    isVariantProduct?: boolean;
    isSelectionComplete?: boolean;
}

export default function SkuStockNotice({
    stock,
    isVariantProduct = false,
    isSelectionComplete = true,
}: SkuStockNoticeProps) {
    if (isVariantProduct && !isSelectionComplete) {
        return (
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                <AlertCircle size={15} className="shrink-0 text-amber-500" />
                <span>
                    Pilih seluruh varian untuk melihat ketersediaan stok.
                </span>
            </div>
        );
    }

    if (stock <= 0) {
        return (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                <XCircle size={15} className="shrink-0 text-rose-500" />
                <span>Stok Habis. Produk saat ini tidak dapat dibeli.</span>
            </div>
        );
    }

    if (stock <= 5) {
        return (
            <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
                <AlertCircle size={15} className="shrink-0 text-orange-500" />
                <span>Sisa {stock} buah! Segera pesan sebelum kehabisan.</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={15} className="shrink-0 text-[#03ac0e]" />
            <span>Stok tersedia ({stock} unit)</span>
        </div>
    );
}
