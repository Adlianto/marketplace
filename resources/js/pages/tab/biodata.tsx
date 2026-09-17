import { usePage, router } from '@inertiajs/react';
import { Camera, Lock, Fingerprint, X, KeyRound } from 'lucide-react';
import { useState, useRef } from 'react';
import type { ReactNode } from 'react';

interface UserAuth {
    name?: string;
    email?: string;
    avatar?: string;
    birthday?: string;
    gender?: string;
    phone?: string;
}

export default function BiodataTab() {
    const { auth } = usePage().props as { auth: { user: UserAuth | null } };
    const user = auth.user;

    const [modal, setModal] = useState({
        open: false,
        type: '',
        title: '',
        value: '',
    });
    const [passwordModal, setPasswordModal] = useState(false);
    const [pinModal, setPinModal] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        password: '',
        password_confirmation: '',
    });
    const [pinForm, setPinForm] = useState({ pin: '', pin_confirmation: '' });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const userPhoto =
        user?.avatar ||
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Bell'}`;

    const openModal = (type: string, title: string, currentVal?: string) => {
        setModal({ open: true, type, title, value: currentVal || '' });
    };

    const handleSaveModal = () => {
        router.patch(
            '/profile',
            { [modal.type]: modal.value },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setModal({ open: false, type: '', title: '', value: '' }),
            },
        );
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.password !== passwordForm.password_confirmation) {
            alert('Konfirmasi kata sandi tidak cocok!');

            return;
        }

        router.post('/profile/password', passwordForm, {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordModal(false);
                setPasswordForm({ password: '', password_confirmation: '' });
                alert('Kata sandi berhasil disimpan!');
            },
        });
    };

    const handleSavePin = (e: React.FormEvent) => {
        e.preventDefault();

        if (pinForm.pin.length !== 6) {
            alert('PIN harus terdiri dari 6 angka!');

            return;
        }

        if (pinForm.pin !== pinForm.pin_confirmation) {
            alert('Konfirmasi PIN tidak cocok!');

            return;
        }

        router.post('/profile/pin', pinForm, {
            preserveScroll: true,
            onSuccess: () => {
                setPinModal(false);
                setPinForm({ pin: '', pin_confirmation: '' });
                alert('PIN transaksi berhasil diaktifkan!');
            },
        });
    };

    const handlePhotoClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);

            router.post('/profile/avatar', formData, {
                preserveScroll: true,
                forceFormData: true,
            });
        }
    };

    return (
        <div className="flex animate-in flex-col gap-10 duration-300 fade-in md:flex-row">
            {/* Foto Profil & Tombol Keamanan */}
            <div className="w-full shrink-0 space-y-4 md:w-[280px]">
                <div className="rounded-lg border border-gray-200 bg-white p-5 text-center shadow-xs">
                    <div
                        className="group relative mb-3 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-slate-50"
                        onClick={handlePhotoClick}
                    >
                        <img
                            src={userPhoto}
                            className="h-full w-full object-cover"
                            alt="profile"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Bell'}`;
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera size={28} className="text-white" />
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg"
                    />

                    <button
                        type="button"
                        onClick={handlePhotoClick}
                        className="w-full cursor-pointer rounded-md border border-gray-200 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                        Pilih Foto
                    </button>
                    <p className="mt-2 text-left text-[10px] leading-relaxed text-gray-400">
                        Besar file: maksimum 10 MB. Format: .JPG, .JPEG, .PNG
                    </p>
                </div>

                <div className="space-y-2">
                    <SecurityButton
                        label="Buat Kata Sandi"
                        icon={<KeyRound size={13} />}
                        onClick={() => setPasswordModal(true)}
                    />
                    <SecurityButton
                        label="PIN Transaksi"
                        icon={<Lock size={13} />}
                        onClick={() => setPinModal(true)}
                    />
                    <SecurityButton
                        label="Verifikasi Instan"
                        icon={<Fingerprint size={13} />}
                        onClick={() =>
                            alert(
                                'Fitur Passkey / Biometrik browser terdeteksi aktif!',
                            )
                        }
                    />
                </div>
            </div>

            {/* Biodata & Kontak */}
            <div className="flex-1 space-y-8">
                <section>
                    <h3 className="mb-4 text-xs font-bold tracking-wider text-gray-800 uppercase">
                        Ubah Biodata Diri
                    </h3>
                    <div className="space-y-4">
                        <InfoRow
                            label="Nama"
                            value={user?.name}
                            onAction={() =>
                                openModal('name', 'Ubah Nama', user?.name)
                            }
                        />
                        <InfoRow
                            label="Tanggal Lahir"
                            value={user?.birthday}
                            placeholder="Tambah Tanggal Lahir"
                            onAction={() =>
                                openModal(
                                    'birthday',
                                    'Ubah Tanggal Lahir',
                                    user?.birthday,
                                )
                            }
                        />
                        <InfoRow
                            label="Jenis Kelamin"
                            value={user?.gender}
                            placeholder="Tambah Jenis Kelamin"
                            onAction={() =>
                                openModal(
                                    'gender',
                                    'Ubah Jenis Kelamin',
                                    user?.gender,
                                )
                            }
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-4 text-xs font-bold tracking-wider text-gray-800 uppercase">
                        Ubah Kontak
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="w-1/3 font-medium text-gray-500">
                                Email
                            </span>
                            <div className="flex flex-1 items-center gap-3">
                                <span className="max-w-[200px] truncate font-bold text-gray-800">
                                    {user?.email}
                                </span>
                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-black tracking-tighter text-green-600 uppercase">
                                    Terverifikasi
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="w-1/3 font-medium text-gray-500">
                                Nomor HP
                            </span>
                            <div className="flex flex-1 items-center gap-3">
                                <span className="font-bold text-gray-800">
                                    {user?.phone || 'Belum ditambahkan'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        openModal(
                                            'phone',
                                            'Ubah Nomor HP',
                                            user?.phone,
                                        )
                                    }
                                    className="ml-auto cursor-pointer text-xs font-bold text-green-500 uppercase hover:underline"
                                >
                                    {user?.phone ? 'Ubah' : 'Tambah'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal Ubah Biodata */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 duration-200 fade-in">
                    <div className="relative w-full max-w-[420px] rounded-lg bg-white p-6 shadow-xl">
                        <button
                            type="button"
                            onClick={() => setModal({ ...modal, open: false })}
                            className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="mb-4 text-base font-bold text-gray-800">
                            {modal.title}
                        </h2>

                        <div className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                    {modal.title.split(' ').slice(1).join(' ')}
                                </label>

                                {modal.type === 'gender' ? (
                                    <select
                                        value={modal.value}
                                        onChange={(e) =>
                                            setModal({
                                                ...modal,
                                                value: e.target.value,
                                            })
                                        }
                                        className="w-full cursor-pointer appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-green-500"
                                    >
                                        <option value="">
                                            Pilih Jenis Kelamin
                                        </option>
                                        <option value="Pria">Pria</option>
                                        <option value="Wanita">Wanita</option>
                                    </select>
                                ) : (
                                    <input
                                        type={
                                            modal.type === 'birthday'
                                                ? 'date'
                                                : 'text'
                                        }
                                        value={modal.value}
                                        onChange={(e) =>
                                            setModal({
                                                ...modal,
                                                value: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-green-500"
                                        placeholder={`Masukkan ${modal.title.split(' ').slice(1).join(' ')}...`}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveModal}
                                disabled={!modal.value}
                                className={`mt-4 w-full rounded-md py-2.5 text-xs font-bold tracking-wider uppercase transition-colors ${
                                    modal.value
                                        ? 'cursor-pointer bg-green-500 text-white shadow-xs hover:bg-green-600'
                                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                }`}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Buat Kata Sandi */}
            {passwordModal && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 duration-200 fade-in">
                    <div className="relative w-full max-w-[420px] rounded-lg bg-white p-6 shadow-xl">
                        <button
                            type="button"
                            onClick={() => setPasswordModal(false)}
                            className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="mb-1 text-base font-bold text-gray-800">
                            Buat Kata Sandi
                        </h2>
                        <p className="mb-4 text-xs text-gray-500">
                            Gunakan kombinasi minimal 8 karakter untuk keamanan
                            akun.
                        </p>

                        <form
                            onSubmit={handleSavePassword}
                            className="space-y-3.5"
                        >
                            <div>
                                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                    Kata Sandi Baru
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={passwordForm.password}
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            password: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs outline-none focus:border-green-500"
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                    Ulangi Kata Sandi
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.password_confirmation}
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            password_confirmation:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs outline-none focus:border-green-500"
                                    placeholder="Ketik ulang kata sandi"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full cursor-pointer rounded-md bg-green-500 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-green-600"
                            >
                                Simpan Kata Sandi
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal PIN Transaksi */}
            {pinModal && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 duration-200 fade-in">
                    <div className="relative w-full max-w-[420px] rounded-lg bg-white p-6 shadow-xl">
                        <button
                            type="button"
                            onClick={() => setPinModal(false)}
                            className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="mb-1 text-base font-bold text-gray-800">
                            Atur PIN 6 Digit
                        </h2>
                        <p className="mb-4 text-xs text-gray-500">
                            PIN digunakan untuk mengamankan pembayaran &
                            transaksi saldo.
                        </p>

                        <form onSubmit={handleSavePin} className="space-y-3.5">
                            <div>
                                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                    PIN Baru (6 Angka)
                                </label>
                                <input
                                    type="password"
                                    required
                                    maxLength={6}
                                    pattern="\d{6}"
                                    value={pinForm.pin}
                                    onChange={(e) =>
                                        setPinForm({
                                            ...pinForm,
                                            pin: e.target.value.replace(
                                                /\D/g,
                                                '',
                                            ),
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-center font-mono text-lg font-bold tracking-[0.4em] outline-none focus:border-green-500"
                                    placeholder="••••••"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                    Konfirmasi PIN
                                </label>
                                <input
                                    type="password"
                                    required
                                    maxLength={6}
                                    pattern="\d{6}"
                                    value={pinForm.pin_confirmation}
                                    onChange={(e) =>
                                        setPinForm({
                                            ...pinForm,
                                            pin_confirmation:
                                                e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-center font-mono text-lg font-bold tracking-[0.4em] outline-none focus:border-green-500"
                                    placeholder="••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full cursor-pointer rounded-md bg-green-500 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-green-600"
                            >
                                Aktifkan PIN
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({
    label,
    value,
    placeholder,
    onAction,
}: {
    label: string;
    value?: string;
    placeholder?: string;
    onAction: () => void;
}) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="w-1/3 font-medium text-gray-500">{label}</span>
            <div className="flex flex-1 items-center justify-between">
                <span
                    className={`font-bold ${!value ? 'cursor-pointer text-green-500 hover:underline' : 'text-gray-800'}`}
                    onClick={!value ? onAction : undefined}
                >
                    {value || placeholder}
                </span>
                {value && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="ml-4 cursor-pointer text-xs font-bold text-green-500 uppercase hover:underline"
                    >
                        Ubah
                    </button>
                )}
            </div>
        </div>
    );
}

function SecurityButton({
    label,
    icon,
    onClick,
}: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-200 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
        >
            {icon} {label}
        </button>
    );
}
