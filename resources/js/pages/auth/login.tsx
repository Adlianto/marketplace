import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { register } from '@/routes';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword?: boolean;
};

export default function Login({ status, canResetPassword = true }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800 antialiased">
            <Head title="Masuk Akun" />

            <Navbar />

            <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 bg-white min-h-[calc(100vh-4rem)]">
                <div className="w-full max-w-[960px] flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 my-auto">
                    
                    {/* Sisi Kiri: Ilustrasi Lebih Besar & Center */}
                    <div className="hidden md:flex flex-col items-center justify-center text-center w-1/2">
                        <img
                            src="https://illustrations.popsy.co/green/surreal-hourglass.svg"
                            alt="Ilustrasi Masuk"
                            width={340}
                            height={340}
                            loading="lazy"
                            className="w-80 max-w-[340px] h-auto mb-6 select-none"
                        />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                            Jual Beli Hardware & PC Mudah
                        </h2>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                            Gabung dan temukan ribuan komponen PC serta laptop resmi terlengkap.
                        </p>
                    </div>

                    {/* Sisi Kanan: Form Card */}
                    <div className="w-full md:w-1/2 max-w-[400px]">
                        <div className="bg-white p-7 rounded-lg shadow-sm border border-slate-200">

                            <div className="flex justify-between items-baseline mb-6">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Masuk</h1>
                                <Link
                                    href={register()}
                                    preserveState
                                    preserveScroll
                                    className="text-xs text-[#03ac0e] font-semibold hover:underline"
                                >
                                    Daftar Akun
                                </Link>
                            </div>

                            {status && (
                                <div className="bg-emerald-50 text-[#03ac0e] p-2.5 rounded-md text-xs mb-4 border border-emerald-200 font-medium text-center">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e] outline-none transition bg-white"
                                        placeholder="Masukkan Email..."
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && (
                                        <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className="text-[11px] text-[#03ac0e] font-medium hover:underline"
                                            >
                                                Lupa kata sandi?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e] outline-none transition pr-9 bg-white"
                                            placeholder="Masukkan Kata Sandi..."
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label="Toggle password"
                                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Custom Checkbox Hijau (Bebas dari efek Dark Mode OS) */}
                                <div className="flex items-center gap-2 pt-0.5">
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={data.remember}
                                        onClick={() => setData('remember', !data.remember)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                            data.remember
                                                ? 'bg-[#03ac0e] border-[#03ac0e]'
                                                : 'bg-white border-slate-300 hover:border-slate-400'
                                        }`}
                                    >
                                        {data.remember && (
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                    <span
                                        onClick={() => setData('remember', !data.remember)}
                                        className="text-xs text-slate-600 cursor-pointer select-none"
                                    >
                                        Ingat saya di perangkat ini
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#03ac0e] text-white font-semibold py-2 rounded-md hover:bg-[#029b0c] transition shadow-xs text-xs disabled:opacity-60 cursor-pointer"
                                >
                                    {processing ? 'Memproses...' : 'Masuk'}
                                </button>
                            </form>

                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-slate-200" />
                                <span className="flex-shrink-0 mx-3 text-slate-400 text-[11px]">atau masuk dengan</span>
                                <div className="flex-grow border-t border-slate-200" />
                            </div>

                            <a
                                href="/auth/google/redirect"
                                className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-2 rounded-md hover:bg-slate-50 transition text-xs flex items-center justify-center gap-2 shadow-xs"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                    </g>
                                </svg>
                                Google
                            </a>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

Login.layout = (page: ReactNode) => page;