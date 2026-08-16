export default function RekeningTab() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
            <img
                src="https://illustrations.popsy.co/green/paper-plane.svg"
                alt="Rekening Bank"
                className="w-56 mb-6 select-none"
            />
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Halaman Rekening Bank</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed mx-auto">
                Sistem integrasi transfer bank otomatis sedang disiapkan untuk mempermudah penarikan dana toko dan refund.
            </p>
        </div>
    );
}