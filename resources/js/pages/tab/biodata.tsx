import { useState, useRef, type ReactNode } from 'react';
import { Camera, Lock, Fingerprint, X } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

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

    const [modal, setModal] = useState({ open: false, type: '', title: '', value: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userPhoto = user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Bell'}`;

    const openModal = (type: string, title: string, currentVal?: string) => {
        setModal({ open: true, type, title, value: currentVal || '' });
    };

    const handleSaveModal = () => {
        router.patch('/profile', { [modal.type]: modal.value }, {
            preserveScroll: true,
            onSuccess: () => setModal({ open: false, type: '', title: '', value: '' }),
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
        <div className="flex flex-col md:flex-row gap-10 animate-in fade-in duration-300">
            {/* Foto Profil & Tombol Keamanan */}
            <div className="w-full md:w-[280px] shrink-0 space-y-4">
                <div className="p-5 border border-gray-200 rounded-lg shadow-xs text-center bg-white">
                    <div
                        className="relative group cursor-pointer mb-3 aspect-square rounded-lg overflow-hidden border border-gray-200 bg-slate-50 flex items-center justify-center"
                        onClick={handlePhotoClick}
                    >
                        <img
                            src={userPhoto}
                            className="w-full h-full object-cover"
                            alt="profile"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Bell'}`;
                            }}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                        className="w-full py-2 border border-gray-200 rounded-md font-bold text-xs text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                        Pilih Foto
                    </button>
                    <p className="text-[10px] text-gray-400 leading-relaxed text-left mt-2">
                        Besar file: maksimum 10 MB. Format: .JPG, .JPEG, .PNG
                    </p>
                </div>

                <div className="space-y-2">
                    <SecurityButton label="Buat Kata Sandi" />
                    <SecurityButton label="PIN" icon={<Lock size={13} />} />
                    <SecurityButton label="Verifikasi Instan" icon={<Fingerprint size={13} />} />
                </div>
            </div>

            {/* Biodata & Kontak */}
            <div className="flex-1 space-y-8">
                <section>
                    <h3 className="font-bold text-xs text-gray-800 mb-4 uppercase tracking-wider">
                        Ubah Biodata Diri
                    </h3>
                    <div className="space-y-4">
                        <InfoRow
                            label="Nama"
                            value={user?.name}
                            onAction={() => openModal('name', 'Ubah Nama', user?.name)}
                        />
                        <InfoRow
                            label="Tanggal Lahir"
                            value={user?.birthday}
                            placeholder="Tambah Tanggal Lahir"
                            onAction={() => openModal('birthday', 'Ubah Tanggal Lahir', user?.birthday)}
                        />
                        <InfoRow
                            label="Jenis Kelamin"
                            value={user?.gender}
                            placeholder="Tambah Jenis Kelamin"
                            onAction={() => openModal('gender', 'Ubah Jenis Kelamin', user?.gender)}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="font-bold text-xs text-gray-800 mb-4 uppercase tracking-wider">
                        Ubah Kontak
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 w-1/3 font-medium">Email</span>
                            <div className="flex-1 flex items-center gap-3">
                                <span className="font-bold text-gray-800 truncate max-w-[200px]">
                                    {user?.email}
                                </span>
                                <span className="bg-green-100 text-green-600 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                    Terverifikasi
                                </span>
                                <button className="text-green-500 font-bold ml-auto text-xs uppercase hover:underline cursor-pointer">
                                    Ubah
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 w-1/3 font-medium">Nomor HP</span>
                            <div className="flex-1 flex items-center gap-3">
                                <span className="font-bold text-gray-800">
                                    {user?.phone || 'Belum ditambahkan'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => openModal('phone', 'Ubah Nomor HP', user?.phone)}
                                    className="text-green-500 font-bold ml-auto text-xs uppercase hover:underline cursor-pointer"
                                >
                                    {user?.phone ? 'Ubah' : 'Tambah'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-[420px] rounded-lg shadow-xl p-6 relative">
                        <button
                            type="button"
                            onClick={() => setModal({ ...modal, open: false })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-base font-bold text-gray-800 mb-4">{modal.title}</h2>

                        <div className="space-y-3.5">
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                {modal.type === 'name'
                                    ? 'Kamu hanya dapat mengubah nama 1 kali lagi. Pastikan nama sudah benar.'
                                    : 'Pastikan data yang kamu masukkan sudah sesuai dengan identitas aslimu.'}
                            </p>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {modal.title.split(' ').slice(1).join(' ')}
                                </label>

                                {modal.type === 'gender' ? (
                                    <select
                                        value={modal.value}
                                        onChange={(e) => setModal({ ...modal, value: e.target.value })}
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs outline-none focus:border-green-500 appearance-none bg-white font-bold text-gray-700 cursor-pointer"
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="Pria">Pria</option>
                                        <option value="Wanita">Wanita</option>
                                    </select>
                                ) : (
                                    <input
                                        type={modal.type === 'birthday' ? 'date' : 'text'}
                                        value={modal.value}
                                        onChange={(e) => setModal({ ...modal, value: e.target.value })}
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-green-500"
                                        placeholder={`Masukkan ${modal.title.split(' ').slice(1).join(' ')}...`}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveModal}
                                disabled={!modal.value}
                                className={`w-full py-2.5 rounded-md font-bold uppercase text-xs tracking-wider mt-4 transition-colors ${
                                    modal.value
                                        ? 'bg-green-500 text-white shadow-xs cursor-pointer hover:bg-green-600'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Simpan
                            </button>
                        </div>
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
        <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 w-1/3 font-medium">{label}</span>
            <div className="flex-1 flex items-center justify-between">
                <span
                    className={`font-bold ${!value ? 'text-green-500 cursor-pointer hover:underline' : 'text-gray-800'}`}
                    onClick={!value ? onAction : undefined}
                >
                    {value || placeholder}
                </span>
                {value && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="text-green-500 font-bold text-xs uppercase hover:underline ml-4 cursor-pointer"
                    >
                        Ubah
                    </button>
                )}
            </div>
        </div>
    );
}

function SecurityButton({ label, icon }: { label: string; icon?: ReactNode }) {
    return (
        <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
            {icon} {label}
        </button>
    );
}