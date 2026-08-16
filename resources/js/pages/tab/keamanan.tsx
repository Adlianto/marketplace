import { ShieldCheck } from 'lucide-react';

export default function KeamananTab() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#03ac0e] flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Keamanan Akun Terproteksi</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed mx-auto">
                Fitur Two-Factor Authentication (2FA), Passkey Biometrik, dan Manajemen Sesi Aktif dapat kamu kelola melalui menu pengaturan profil.
            </p>
        </div>
    );
}