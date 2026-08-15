export default function ProductSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between">
            <div>
                {/* Image Placeholder */}
                <div className="aspect-square bg-slate-200" />

                {/* Body Details */}
                <div className="p-2.5 space-y-2">
                    {/* Title */}
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    
                    {/* Price */}
                    <div className="h-4 bg-slate-200 rounded w-1/2 mt-2" />
                    
                    {/* Discount & City */}
                    <div className="flex gap-2 pt-1">
                        <div className="h-3 bg-slate-200 rounded w-8" />
                        <div className="h-3 bg-slate-200 rounded w-16" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-2.5 pb-2.5 pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="h-3 bg-slate-200 rounded w-14" />
                <div className="h-5 w-5 bg-slate-200 rounded-md" />
            </div>
        </div>
    );
}