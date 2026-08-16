import { useState, useEffect } from 'react';
import { MapPin, Plus, X, Search, Crosshair, ChevronLeft, Check, Share2, Map, Trash2, Loader2 } from 'lucide-react';

interface Address {
    id: number;
    label: string;
    receiver: string;
    phone: string;
    fullAddress: string;
    note?: string;
    pinpoint: string;
    isMain: boolean;
}

export default function AlamatTab() {
    const [addresses, setAddresses] = useState<Address[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('marketku_addresses');
            return saved ? JSON.parse(saved) : [
                {
                    id: 1,
                    label: 'Rumah',
                    receiver: 'Bell Pratama',
                    phone: '081234567890',
                    fullAddress: 'Jl. Boulevard Raya No. 45, RT 01 / RW 03, Plered',
                    pinpoint: 'Plered, West Java, Indonesia',
                    isMain: true,
                }
            ];
        }
        return [];
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [editId, setEditId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        label: '',
        receiver: '',
        phone: '',
        fullAddress: '',
        note: '',
        pinpoint: 'Plered, West Java, Indonesia',
        isMain: false,
        termsAccepted: false,
    });

    useEffect(() => {
        localStorage.setItem('marketku_addresses', JSON.stringify(addresses));
    }, [addresses]);

    const handleOpenModal = (address: Address | null = null) => {
        if (address) {
            setEditId(address.id);
            setFormData({ ...address, note: address.note || '', termsAccepted: true });
            setStep(3);
        } else {
            setEditId(null);
            setFormData({
                label: '',
                receiver: '',
                phone: '',
                fullAddress: '',
                note: '',
                pinpoint: 'Plered, West Java, Indonesia',
                isMain: false,
                termsAccepted: false,
            });
            setStep(1);
            setSearchKeyword('');
            setSearchResults([]);
        }
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.label || !formData.receiver || !formData.fullAddress || !formData.phone) {
            alert('Harap isi Label, Nama Penerima, Nomor HP, dan Alamat Lengkap.');
            return;
        }

        if (editId) {
            setAddresses(addresses.map((a) => (a.id === editId ? { ...formData, id: editId } : a)));
        } else {
            const newAddr: Address = {
                ...formData,
                id: Date.now(),
                isMain: addresses.length === 0 || formData.isMain,
            };
            setAddresses([...addresses, newAddr]);
        }

        setModalOpen(false);
    };

    const deleteAddress = (id: number) => {
        if (confirm('Hapus alamat ini?')) {
            setAddresses(addresses.filter((a) => a.id !== id));
        }
    };

    const setMainAddress = (id: number) => {
        setAddresses(addresses.map((a) => ({ ...a, isMain: a.id === id })));
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Cari nama alamat / penerima..."
                        className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:border-[#03ac0e] focus:ring-1 focus:ring-[#03ac0e] outline-none"
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#03ac0e] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#029b0c] transition cursor-pointer shadow-xs"
                >
                    + Tambah Alamat Baru
                </button>
            </div>

            <div className="space-y-3.5">
                {addresses.length === 0 ? (
                    <div className="text-center py-10 border border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs font-semibold text-slate-600">Belum ada alamat tersimpan</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`p-4 rounded-xl border flex justify-between items-start transition ${
                                addr.isMain ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="font-bold text-slate-800 text-xs">{addr.label}</span>
                                    {addr.isMain && (
                                        <span className="bg-emerald-100 text-[#03ac0e] text-[10px] px-1.5 py-0.2 rounded font-bold">
                                            Utama
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-slate-900 text-xs mb-0.5">{addr.receiver}</h4>
                                <p className="text-xs text-slate-500 mb-0.5">{addr.phone}</p>
                                <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{addr.fullAddress}</p>

                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
                                    <MapPin size={13} className="text-slate-400" /> {addr.pinpoint}
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                    <button
                                        onClick={() => handleOpenModal(addr)}
                                        className="font-semibold text-[#03ac0e] hover:underline cursor-pointer"
                                    >
                                        Ubah Alamat
                                    </button>
                                    <span className="text-slate-200">|</span>
                                    <button
                                        onClick={() => deleteAddress(addr.id)}
                                        className="font-semibold text-slate-400 hover:text-red-500 cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>

                            <div className="ml-4 shrink-0 mt-1">
                                {addr.isMain ? (
                                    <Check size={20} className="text-[#03ac0e]" strokeWidth={2.5} />
                                ) : (
                                    <button
                                        onClick={() => setMainAddress(addr.id)}
                                        className="border border-slate-300 text-slate-600 hover:border-[#03ac0e] hover:text-[#03ac0e] px-3 py-1 rounded-lg text-xs font-semibold bg-white transition cursor-pointer"
                                    >
                                        Jadikan Utama
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Tambah / Edit Alamat */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-[480px] rounded-xl shadow-xl flex flex-col max-h-[90vh]">
                        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-bold text-slate-900">
                                {editId ? 'Ubah Alamat' : 'Tambah Alamat Baru'}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-3.5 overflow-y-auto">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Label Alamat</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Rumah, Kantor, Kosan"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-[#03ac0e] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Nama Penerima</label>
                                    <input
                                        type="text"
                                        value={formData.receiver}
                                        onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-[#03ac0e] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Nomor HP</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-[#03ac0e] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Alamat Lengkap</label>
                                <textarea
                                    rows={3}
                                    value={formData.fullAddress}
                                    onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-[#03ac0e] outline-none resize-none"
                                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={formData.isMain}
                                    onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                                    className="w-4 h-4 accent-[#03ac0e] rounded cursor-pointer"
                                />
                                <span className="text-xs text-slate-700 select-none">Jadikan sebagai alamat utama</span>
                            </label>

                            <button
                                onClick={handleSave}
                                className="w-full bg-[#03ac0e] text-white font-semibold py-2.5 rounded-lg hover:bg-[#029b0c] transition cursor-pointer text-xs mt-2"
                            >
                                Simpan Alamat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}