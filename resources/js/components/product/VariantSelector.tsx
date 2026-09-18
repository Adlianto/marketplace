import { Check } from 'lucide-react';
import type { ProductSku, ProductVariant } from '@/types';

interface VariantSelectorProps {
    variants: ProductVariant[];
    skus: ProductSku[];
    selectedOptions: Record<string, string>;
    onSelectOption: (variantName: string, optionValue: string) => void;
}

export default function VariantSelector({
    variants,
    skus,
    selectedOptions,
    onSelectOption,
}: VariantSelectorProps) {
    if (!variants || variants.length === 0) {
        return null;
    }

    /**
     * Check if a specific candidate option has available stock
     * given the other currently selected options.
     */
    const isOptionAvailable = (variantName: string, optionValue: string): boolean => {
        // Construct hypothetical selection with this candidate option
        const hypothetical: Record<string, string> = {
            ...selectedOptions,
            [variantName]: optionValue,
        };

        // Find matching SKUs that satisfy all selected keys in hypothetical
        const matchingSkus = skus.filter((sku) => {
            const parts = sku.combination_key.split('-');

            return variants.every((v, index) => {
                const selectedVal = hypothetical[v.name];

                if (!selectedVal) {
                    return true; // dimension not yet chosen in hypothetical
                }

                // Match against either order or split position
                return parts[index]?.toLowerCase() === selectedVal.toLowerCase() ||
                    parts.some((p) => p.toLowerCase() === selectedVal.toLowerCase());
            });
        });

        // If no matching SKUs exist or all have stock 0, option is unavailable
        if (matchingSkus.length === 0) {
            return false;
        }

        return matchingSkus.some((sku) => sku.stock > 0);
    };

    return (
        <div className="space-y-4 border-y border-slate-100 py-4">
            {variants.map((variant) => {
                const selectedValue = selectedOptions[variant.name];

                return (
                    <div key={variant.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-[13px]">
                            <span className="text-slate-500">Pilih {variant.name}:</span>
                            {selectedValue && (
                                <span className="font-bold text-slate-900">{selectedValue}</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {variant.options?.map((option) => {
                                const isSelected = selectedValue === option.value;
                                const isAvailable = isOptionAvailable(variant.name, option.value);

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => onSelectOption(variant.name, option.value)}
                                        className={`group relative flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                                            isSelected
                                                ? 'border-[#03ac0e] bg-emerald-50/50 text-[#03ac0e] shadow-xs'
                                                : isAvailable
                                                  ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                  : 'cursor-not-allowed border-slate-200 bg-slate-100/70 text-slate-400 line-through'
                                        }`}
                                    >
                                        {option.image && (
                                            <img
                                                src={option.image}
                                                alt={option.value}
                                                className={`h-5 w-5 rounded object-cover ${!isAvailable ? 'opacity-40' : ''}`}
                                            />
                                        )}

                                        <span>{option.value}</span>

                                        {isSelected && (
                                            <Check size={14} className="text-[#03ac0e]" strokeWidth={3} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
