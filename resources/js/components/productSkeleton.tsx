export default function ProductSkeleton() {
    return (
        <div className="flex animate-pulse flex-col justify-between overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
            <div>
                <div className="aspect-square bg-slate-200" />

                <div className="space-y-2 p-2.5">
                    <div className="h-3 w-full rounded bg-slate-200" />
                    <div className="h-3 w-3/4 rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                    <div className="flex gap-2 pt-1">
                        <div className="h-3 w-8 rounded bg-slate-200" />
                        <div className="h-3 w-16 rounded bg-slate-200" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-2.5 pt-2 pb-2.5">
                <div className="h-3 w-14 rounded bg-slate-200" />
                <div className="h-5 w-5 rounded-md bg-slate-200" />
            </div>
        </div>
    );
}
