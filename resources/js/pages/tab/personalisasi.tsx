import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { useState } from 'react';

export default function TampilanTab() {
    const [themeMode, setThemeMode] = useState('light');
    const [primaryColor, setPrimaryColor] = useState('green');

    const modes = [
        { id: 'light', label: 'Mode Terang', icon: <Sun size={18} />, desc: 'Tampilan cerah standar' },
        { id: 'dark', label: 'Mode Gelap', icon: <Moon size={18} />, desc: 'Nyaman di mata malam hari' },
        { id: 'auto', label: 'Otomatis', icon: <Monitor size={18} />, desc: 'Ikuti preferensi OS' },
    ];

    const colors = [
        { id: 'green', color: 'bg-[#03ac0e]', name: 'Hijau (Default)' },
        { id: 'blue', color: 'bg-blue-600', name: 'Biru' },
        { id: 'purple', color: 'bg-purple-600', name: 'Ungu' },
        { id: 'orange', color: 'bg-orange-500', name: 'Oranye' },
    ];

    return (
        <div className="max-w-2xl animate-in fade-in duration-300 space-y-8">
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <Palette size={16} className="text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pilih Tema</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {modes.map((mode) => (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => setThemeMode(mode.id)}
                            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                                themeMode === mode.id
                                    ? 'border-[#03ac0e] bg-emerald-50/40 text-slate-900'
                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                        >
                            <div className="mb-2 text-[#03ac0e]">{mode.icon}</div>
                            <p className="font-semibold text-xs">{mode.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{mode.desc}</p>
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Warna Aksen Utama</h3>
                <div className="flex flex-wrap gap-3">
                    {colors.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setPrimaryColor(c.id)}
                            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border transition cursor-pointer ${
                                primaryColor === c.id
                                    ? 'border-slate-800 bg-slate-50 font-semibold'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                            <div className={`w-3.5 h-3.5 rounded-full ${c.color}`} />
                            <span className="text-xs">{c.name}</span>
                            {primaryColor === c.id && <Check size={14} className="text-slate-800 ml-1" />}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}