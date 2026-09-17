export default function NotifikasiTab() {
    return (
        <div className="flex animate-in flex-col items-center justify-center py-12 text-center duration-300 fade-in">
            <img
                src="https://illustrations.popsy.co/green/communication.svg"
                alt="Notifikasi"
                className="mb-6 w-56 select-none"
            />
            <h3 className="mb-1.5 text-base font-bold text-slate-900">
                Pengaturan Notifikasi
            </h3>
            <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">
                Kustomisasi notifikasi email, promo belanja, dan pembaruan
                pesanan akan segera tersedia di sini.
            </p>
        </div>
    );
}
