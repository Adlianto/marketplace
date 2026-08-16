export default function NotifikasiTab() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
            <img
                src="https://illustrations.popsy.co/green/communication.svg"
                alt="Notifikasi"
                className="w-56 mb-6 select-none"
            />
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Pengaturan Notifikasi</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed mx-auto">
                Kustomisasi notifikasi email, promo belanja, dan pembaruan pesanan akan segera tersedia di sini.
            </p>
        </div>
    );
}