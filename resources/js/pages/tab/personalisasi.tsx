import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { useState } from 'react';

export default function TampilanTab() {
    const [themeMode, setThemeMode] = useState('light');
    const [primaryColor, setPrimaryColor] = useState('green');

    const modes = [
        {
            id: 'light',
            label: 'Mode Terang',
            icon: <Sun size={18} />,
            desc: 'Tampilan cerah standar',
        },
        {
            id: 'dark',
            label: 'Mode Gelap',
            icon: <Moon size={18} />,
            desc: 'Nyaman di mata malam hari',
        },
        {
            id: 'auto',
            label: 'Otomatis',
            icon: <Monitor size={18} />,
            desc: 'Ikuti preferensi OS',
        },
    ];

    const colors = [
        { id: 'green', color: 'bg-[#03ac0e]', name: 'Hijau (Default)' },
        { id: 'blue', color: 'bg-blue-600', name: 'Biru' },
        { id: 'purple', color: 'bg-purple-600', name: 'Ungu' },
        { id: 'orange', color: 'bg-orange-500', name: 'Oranye' },
    ];

    return (
        <div className="max-w-2xl animate-in space-y-8 duration-300 fade-in">
            <section>
                <div className="mb-3 flex items-center gap-2">
                    <Palette size={16} className="text-slate-400" />
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                        Pilih Tema
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {modes.map((mode) => (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => setThemeMode(mode.id)}
                            className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                                themeMode === mode.id
                                    ? 'border-[#03ac0e] bg-emerald-50/40 text-slate-900'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <div className="mb-2 text-[#03ac0e]">
                                {mode.icon}
                            </div>
                            <p className="text-xs font-semibold">
                                {mode.label}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                {mode.desc}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-900 uppercase">
                    Warna Aksen Utama
                </h3>
                <div className="flex flex-wrap gap-3">
                    {colors.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setPrimaryColor(c.id)}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2 transition ${
                                primaryColor === c.id
                                    ? 'border-slate-800 bg-slate-50 font-semibold'
                                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <div
                                className={`h-3.5 w-3.5 rounded-full ${c.color}`}
                            />
                            <span className="text-xs">{c.name}</span>
                            {primaryColor === c.id && (
                                <Check
                                    size={14}
                                    className="ml-1 text-slate-800"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
