export default function RekeningTab() {
    return (
        <div className="flex animate-in flex-col items-center justify-center py-12 text-center duration-300 fade-in">
            <img
                src="https://illustrations.popsy.co/green/paper-plane.svg"
                alt="Rekening Bank"
                className="mb-6 w-56 select-none"
            />
            <h3 className="mb-1.5 text-base font-bold text-slate-900">
                Halaman Rekening Bank
            </h3>
            <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">
                Sistem integrasi transfer bank otomatis sedang disiapkan untuk
                mempermudah penarikan dana toko dan refund.
            </p>
        </div>
    );
}
