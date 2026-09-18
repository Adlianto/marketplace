import { Link } from '@inertiajs/react';
import {
    Check,
    MapPin,
    Minus,
    Plus,
    ShieldCheck,
    Store as StoreIcon,
    Trash2,
    Zap,
} from 'lucide-react';
import type { CartItem, StoreCartGroup } from '@/types';

interface StoreCartSectionProps {
    group: StoreCartGroup;
    onToggleStore: (storeId: number) => void;
    onToggleItem: (id: number) => void;
    onQuantityChange: (id: number, type: 'inc' | 'dec') => void;
    onDeleteSingle: (id: number) => void;
}

const formatRupiah = (val: number | string | null | undefined): string => {
    const num = typeof val === 'string' ? parseFloat(val) : Number(val);

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num);
};

function CustomCheckbox({
    checked,
    onChange,
    'aria-label': ariaLabel,
}: {
    checked: boolean;
    onChange: () => void;
    'aria-label'?: string;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={onChange}
            className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] transition-all ${
                checked
                    ? 'border border-[#03ac0e] bg-[#03ac0e]'
                    : 'border-2 border-slate-300 bg-white hover:border-[#03ac0e]'
            }`}
        >
            {checked && (
                <Check size={13} strokeWidth={3.5} className="text-white" />
            )}
        </button>
    );
}

export default function StoreCartSection({
    group,
    onToggleStore,
    onToggleItem,
    onQuantityChange,
    onDeleteSingle,
}: StoreCartSectionProps) {
    const { store, items, selected_subtotal, selected_weight_gram, is_all_selected } = group;

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
            {/* Store Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <CustomCheckbox
                        checked={is_all_selected}
                        onChange={() => onToggleStore(store.id)}
                        aria-label={`Pilih semua produk dari toko ${store.name}`}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        {store.is_official ? (
                            <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[11px] font-extrabold text-purple-700">
                                <ShieldCheck size={13} className="text-purple-600" />
                                Official Store
                            </span>
                        ) : store.power_merchant ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                                <Zap size={13} className="text-emerald-600" />
                                Power Merchant
                            </span>
                        ) : (
                            <StoreIcon size={15} className="text-slate-500" />
                        )}

                        {store.slug ? (
                            <Link
                                href={`/toko/${store.slug}`}
                                className="text-sm font-extrabold text-slate-900 transition hover:text-[#03ac0e]"
                            >
                                {store.name}
                            </Link>
                        ) : (
                            <span className="text-sm font-extrabold text-slate-900">
                                {store.name}
                            </span>
                        )}

                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={13} className="text-slate-400" />
                            Dikirim dari {store.city || 'Jakarta Pusat'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onToggleStore(store.id)}
                        className="cursor-pointer text-xs font-semibold text-[#03ac0e] transition hover:text-[#029b0c]"
                    >
                        {is_all_selected ? 'Batal Pilih Toko' : 'Pilih Semua di Toko Ini'}
                    </button>
                    {selected_weight_gram > 0 && (
                        <span className="hidden rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 sm:inline-block">
                            Berat: {selected_weight_gram >= 1000
                                ? `${(selected_weight_gram / 1000).toFixed(2)} kg`
                                : `${selected_weight_gram} g`}
                        </span>
                    )}
                </div>
            </div>

            {/* Store Cart Items */}
            <div className="divide-y divide-slate-100">
                {items.map((item: CartItem) => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0;
                    const originalPrice = item.original_price
                        ? typeof item.original_price === 'string'
                            ? parseFloat(item.original_price)
                            : Number(item.original_price)
                        : null;

                    return (
                        <div key={item.id} className="p-5">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="pt-2">
                                    <CustomCheckbox
                                        checked={!!item.selected}
                                        onChange={() => onToggleItem(item.id)}
                                        aria-label={`Pilih ${item.title}`}
                                    />
                                </div>

                                <Link
                                    href={`/products/${item.product_id}`}
                                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 sm:h-24 sm:w-24"
                                >
                                    <img
                                        src={
                                            item.image ||
                                            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200'
                                        }
                                        alt={item.title || 'Produk'}
                                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                    />
                                    {item.discount ? (
                                        <div className="absolute top-0 left-0 rounded-br-md bg-[#ef144a] px-1.5 py-0.5 text-[9.5px] font-black text-white">
                                            {item.discount}%
                                        </div>
                                    ) : null}
                                </Link>

                                <div className="min-w-0 flex-1 space-y-1">
                                    <Link
                                        href={`/products/${item.product_id}`}
                                        className="line-clamp-2 text-[13px] leading-snug font-semibold text-slate-800 transition hover:text-[#03ac0e] sm:text-sm"
                                    >
                                        {item.title || 'Nama Produk'}
                                    </Link>

                                    {item.sku_combination ? (
                                        <div className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                            <span>Varian:</span>
                                            <span className="font-semibold text-slate-800">{item.sku_combination}</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400">
                                            Varian: Default
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-baseline gap-2 pt-1">
                                        <span className="text-sm font-extrabold text-slate-900 sm:text-base">
                                            {formatRupiah(price)}
                                        </span>
                                        {originalPrice ? (
                                            <span className="text-xs text-slate-400 line-through">
                                                {formatRupiah(originalPrice)}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Item Actions (Quantity & Trash) */}
                            <div className="flex items-center justify-between border-t border-slate-50 pt-3 pl-8 sm:pl-10">
                                <span className="text-xs text-slate-400">
                                    Berat: {((item.weight_gram ?? 200) * item.quantity)} g
                                </span>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        aria-label="Hapus barang"
                                        onClick={() => onDeleteSingle(item.id)}
                                        className="cursor-pointer p-1 text-slate-400 transition hover:text-[#ef144a]"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="flex items-center rounded-md border border-slate-300 bg-white p-0.5">
                                        <button
                                            type="button"
                                            aria-label="Kurangi kuantitas"
                                            onClick={() => onQuantityChange(item.id, 'dec')}
                                            disabled={(Number(item.quantity) || 1) <= 1}
                                            className="cursor-pointer p-1 text-slate-400 transition hover:text-[#03ac0e] disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-10 text-center text-xs font-bold text-slate-900">
                                            {item.quantity || 1}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Tambah kuantitas"
                                            onClick={() => onQuantityChange(item.id, 'inc')}
                                            disabled={
                                                (Number(item.quantity) || 1) >= (Number(item.stock) || 99)
                                            }
                                            className="cursor-pointer p-1 text-[#03ac0e] transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Store Footer / Subtotal Bar */}
            {selected_subtotal > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 text-xs text-slate-600">
                    <span className="font-medium">Subtotal Toko:</span>
                    <span className="font-extrabold text-slate-900">
                        {formatRupiah(selected_subtotal)}
                    </span>
                </div>
            )}
        </div>
    );
}
