import { ShieldCheck } from 'lucide-react';

export default function KeamananTab() {
    return (
        <div className="flex animate-in flex-col items-center justify-center py-12 text-center duration-300 fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#03ac0e]">
                <ShieldCheck size={32} />
            </div>
            <h3 className="mb-1.5 text-base font-bold text-slate-900">
                Keamanan Akun Terproteksi
            </h3>
            <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">
                Fitur Two-Factor Authentication (2FA), Passkey Biometrik, dan
                Manajemen Sesi Aktif dapat kamu kelola melalui menu pengaturan
                profil.
            </p>
        </div>
    );
}
