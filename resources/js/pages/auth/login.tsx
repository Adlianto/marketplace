import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
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
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-800 antialiased">
            <Head title="Masuk Akun" />

            <Navbar />

            <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-white px-4 py-10 sm:px-6">
                <div className="my-auto flex w-full max-w-[960px] flex-col items-center justify-between gap-10 md:flex-row md:gap-16">
                    {/* Sisi Kiri: Ilustrasi */}
                    <div className="hidden w-1/2 flex-col items-center justify-center text-center md:flex">
                        <img
                            src="https://illustrations.popsy.co/green/surreal-hourglass.svg"
                            alt="Ilustrasi"
                            width={340}
                            height={340}
                            loading="lazy"
                            className="mb-6 h-auto w-80 max-w-[340px] select-none"
                        />
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
                            Jual Beli Hardware & PC Mudah
                        </h2>
                        <p className="max-w-sm text-xs leading-relaxed text-slate-500">
                            Gabung dan temukan ribuan komponen PC serta laptop
                            resmi terlengkap.
                        </p>
                    </div>

                    {/* Sisi Kanan: Form Card */}
                    <div className="w-full max-w-[400px] md:w-1/2">
                        <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="mb-6 flex items-baseline justify-between">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                                    Masuk
                                </h1>
                                <Link
                                    href={register()}
                                    preserveState
                                    preserveScroll
                                    className="text-xs font-semibold text-[#03ac0e] hover:underline"
                                >
                                    Daftar Akun
                                </Link>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-center text-xs font-medium text-[#03ac0e]">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs transition outline-none focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e]"
                                        placeholder="Masukkan Email..."
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-[11px] font-medium text-red-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Kata Sandi
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className="text-[11px] font-medium text-[#03ac0e] hover:underline"
                                            >
                                                Lupa kata sandi?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            name="password"
                                            required
                                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-xs transition outline-none focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e]"
                                            placeholder="Masukkan Kata Sandi..."
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            aria-label="Toggle password"
                                            className="absolute top-2 right-2.5 cursor-pointer text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={16} />
                                            ) : (
                                                <Eye size={16} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-[11px] font-medium text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Custom Checkbox Hijau (Bebas dari efek Dark Mode OS) */}
                                <div className="flex items-center gap-2 pt-0.5">
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={data.remember}
                                        onClick={() =>
                                            setData('remember', !data.remember)
                                        }
                                        className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                                            data.remember
                                                ? 'border-[#03ac0e] bg-[#03ac0e]'
                                                : 'border-slate-300 bg-white hover:border-slate-400'
                                        }`}
                                    >
                                        {data.remember && (
                                            <svg
                                                className="h-3 w-3 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                    <span
                                        onClick={() =>
                                            setData('remember', !data.remember)
                                        }
                                        className="cursor-pointer text-xs text-slate-600 select-none"
                                    >
                                        Ingat saya di perangkat ini
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full cursor-pointer rounded-md bg-[#03ac0e] py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#029b0c] disabled:opacity-60"
                                >
                                    {processing ? 'Memproses...' : 'Masuk'}
                                </button>
                            </form>

                            <div className="my-4 flex items-center">
                                <div className="flex-grow border-t border-slate-200" />
                                <span className="mx-3 flex-shrink-0 text-[11px] text-slate-400">
                                    atau masuk dengan
                                </span>
                                <div className="flex-grow border-t border-slate-200" />
                            </div>

                            <a
                                href="/auth/google/redirect"
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                        <path
                                            fill="#4285F4"
                                            d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                                        />
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
