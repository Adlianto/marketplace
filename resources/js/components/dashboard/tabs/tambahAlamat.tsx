import { router } from '@inertiajs/react';
import { Check, MapPin, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Address } from '@/types';

export type { Address };

export interface AlamatTabProps {
    addresses?: Address[];
}

interface AddressFormData {
    label: string;
    receiver: string;
    phone: string;
    full_address: string;
    note: string;
    pinpoint: string;
    is_main: boolean;
}

const initialFormData: AddressFormData = {
    label: '',
    receiver: '',
    phone: '',
    full_address: '',
    note: '',
    pinpoint: 'Plered, West Java, Indonesia',
    is_main: false,
};

export const resetForm = (): AddressFormData => ({ ...initialFormData });

export default function AlamatTab({ addresses = [] }: AlamatTabProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<AddressFormData>(initialFormData);

    const resetFormState = () => {
        setEditId(null);
        setFormData(initialFormData);
    };

    const filteredAddresses = useMemo(() => {
        if (!searchKeyword.trim()) {
            return addresses;
        }

        const query = searchKeyword.toLowerCase();

        return addresses.filter(
            (addr) =>
                addr.label.toLowerCase().includes(query) ||
                addr.receiver.toLowerCase().includes(query) ||
                (addr.full_address || addr.fullAddress || '')
                    .toLowerCase()
                    .includes(query),
        );
    }, [addresses, searchKeyword]);

    const handleOpenModal = (address: Address | null = null) => {
        if (address) {
            setEditId(address.id);
            setFormData({
                label: address.label,
                receiver: address.receiver,
                phone: address.phone,
                full_address: address.full_address || address.fullAddress || '',
                note: address.note || '',
                pinpoint: address.pinpoint || 'Plered, West Java, Indonesia',
                is_main: Boolean(address.is_main ?? address.isMain),
            });
        } else {
            resetFormState();
        }

        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        resetFormState();
    };

    const handleSave = () => {
        if (
            !formData.label.trim() ||
            !formData.receiver.trim() ||
            !formData.full_address.trim() ||
            !formData.phone.trim()
        ) {
            alert(
                'Harap isi Label, Nama Penerima, Nomor HP, dan Alamat Lengkap.',
            );

            return;
        }

        setIsSubmitting(true);

        const payload = {
            label: formData.label,
            receiver: formData.receiver,
            phone: formData.phone,
            full_address: formData.full_address,
            note: formData.note ? formData.note : null,
            pinpoint: formData.pinpoint || 'Plered, West Java, Indonesia',
            is_main: formData.is_main,
        };

        if (editId) {
            router.patch(`/addresses/${editId}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseModal();
                    resetFormState();
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/addresses', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseModal();
                    resetFormState();
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const deleteAddress = (id: number) => {
        if (confirm('Hapus alamat ini?')) {
            router.delete(`/addresses/${id}`, { preserveScroll: true });
        }
    };

    const setMainAddress = (id: number) => {
        router.patch(`/addresses/${id}/set-main`, {}, { preserveScroll: true });
    };

    return (
        <div className="animate-in duration-300 fade-in">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-[320px]">
                    <Search
                        className="absolute top-2.5 left-3 text-slate-400"
                        size={16}
                    />
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Cari nama alamat / penerima..."
                        className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-xs outline-none focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e]"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="cursor-pointer rounded-lg bg-[#03ac0e] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#029b0c]"
                >
                    + Tambah Alamat Baru
                </button>
            </div>

            <div className="space-y-3.5">
                {filteredAddresses.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 py-10 text-center">
                        <p className="text-xs font-semibold text-slate-600">
                            {searchKeyword
                                ? 'Tidak ada alamat yang cocok dengan pencarian'
                                : 'Belum ada alamat tersimpan'}
                        </p>
                    </div>
                ) : (
                    filteredAddresses.map((addr) => {
                        const isMain = Boolean(addr.is_main ?? addr.isMain);
                        const fullAddr = addr.full_address || addr.fullAddress;

                        return (
                            <div
                                key={addr.id}
                                className={`flex items-start justify-between rounded-xl border p-4 transition ${
                                    isMain
                                        ? 'border-emerald-500 bg-emerald-50/20'
                                        : 'border-slate-200 bg-white'
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-800">
                                            {addr.label}
                                        </span>
                                        {isMain && (
                                            <span className="py-0.2 rounded bg-emerald-100 px-1.5 text-[10px] font-bold text-[#03ac0e]">
                                                Utama
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="mb-0.5 text-xs font-semibold text-slate-900">
                                        {addr.receiver}
                                    </h4>
                                    <p className="mb-0.5 text-xs text-slate-500">
                                        {addr.phone}
                                    </p>
                                    <p className="mb-2.5 text-xs leading-relaxed text-slate-600">
                                        {fullAddr}
                                    </p>

                                    <div className="mb-3 flex items-center gap-1 text-[11px] text-slate-500">
                                        <MapPin
                                            size={13}
                                            className="text-slate-400"
                                        />{' '}
                                        {addr.pinpoint ||
                                            'Plered, West Java, Indonesia'}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOpenModal(addr)
                                            }
                                            className="cursor-pointer font-semibold text-[#03ac0e] hover:underline"
                                        >
                                            Ubah Alamat
                                        </button>
                                        <span className="text-slate-200">
                                            |
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteAddress(addr.id)
                                            }
                                            className="cursor-pointer font-semibold text-slate-400 hover:text-red-500"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-1 ml-4 shrink-0">
                                    {isMain ? (
                                        <Check
                                            size={20}
                                            className="text-[#03ac0e]"
                                            strokeWidth={2.5}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMainAddress(addr.id)
                                            }
                                            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#03ac0e] hover:text-[#03ac0e]"
                                        >
                                            Jadikan Utama
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal Tambah / Edit Alamat */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 duration-200 fade-in">
                    <div className="flex max-h-[90vh] w-full max-w-[480px] flex-col rounded-xl bg-white shadow-xl">
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <h2 className="text-sm font-bold text-slate-900">
                                {editId ? 'Ubah Alamat' : 'Tambah Alamat Baru'}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="cursor-pointer text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3.5 overflow-y-auto p-5">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Label Alamat
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Rumah, Kantor, Kosan"
                                    value={formData.label}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            label: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#03ac0e]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Nama Penerima
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.receiver}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                receiver: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#03ac0e]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Nomor HP
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#03ac0e]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.full_address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            full_address: e.target.value,
                                        })
                                    }
                                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#03ac0e]"
                                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Catatan untuk Kurir (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Pagar hitam, dekat pos satpam"
                                    value={formData.note}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            note: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#03ac0e]"
                                />
                            </div>

                            <label className="flex cursor-pointer items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    checked={formData.is_main}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_main: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 cursor-pointer rounded accent-[#03ac0e]"
                                />
                                <span className="text-xs text-slate-700 select-none">
                                    Jadikan sebagai alamat utama
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="mt-2 w-full cursor-pointer rounded-lg bg-[#03ac0e] py-2.5 text-xs font-semibold text-white transition hover:bg-[#029b0c] disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? 'Menyimpan...'
                                    : 'Simpan Alamat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
