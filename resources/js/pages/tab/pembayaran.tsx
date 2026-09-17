import { usePage } from '@inertiajs/react';
import { X}  from 'lucide-react';
import { useState, useEffect } from 'react';

interface Wallet {
    id: string;
    name: string;
    balance: number;
    connected: boolean;
    provider: string;
}

interface Card {
    id: number;
    type: string;
    bank: string;
    card_number: string;
    expiry_date: string;
    balance: number;
    color: string;
}

export default function PembayaranTab() {
    const { auth } = usePage().props as { auth: { user: { name?: string; phone?: string } | null } };
    const user = auth.user;
    const userPhone = user?.phone || '081234567890';

    const [activePayment, setActivePayment] = useState('ewallet');

    const [wallets, setWallets] = useState<Wallet[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('marketku_wallets');

            return saved ? JSON.parse(saved) : [
                { id: 'gopay', name: 'GoPay', balance: 150000, connected: true, provider: 'gopay' },
                { id: 'dana', name: 'DANA', balance: 50000, connected: true, provider: 'dana' },
                { id: 'ovo', name: 'OVO', balance: 0, connected: false, provider: 'ovo' },
                { id: 'shopeepay', name: 'ShopeePay', balance: 0, connected: false, provider: 'shopeepay' },
            ];
        }

        return [];
    });

    const [cards, setCards] = useState<Card[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('marketku_cards');

            return saved ? JSON.parse(saved) : [
                { id: 1, type: 'VISA', bank: 'BANK BCA', card_number: '•••• •••• •••• 4567', expiry_date: '12/28', balance: 2500000, color: 'from-[#193278] to-[#0A1742]' },
                { id: 2, type: 'Mastercard', bank: 'BANK MANDIRI', card_number: '•••• •••• •••• 8899', expiry_date: '09/27', balance: 1200000, color: 'from-[#1E232E] to-[#0E1116]' },
            ];
        }

        return [];
    });

    useEffect(() => {
        localStorage.setItem('marketku_wallets', JSON.stringify(wallets));
    }, [wallets]);

    useEffect(() => {
        localStorage.setItem('marketku_cards', JSON.stringify(cards));
    }, [cards]);

    const [topUpModal, setTopUpModal] = useState<{ open: boolean; type: string; id: any; name: string }>({
        open: false,
        type: '',
        id: null,
        name: '',
    });
    const [topUpAmount, setTopUpAmount] = useState('');

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    const toggleWallet = (id: string) => {
        setWallets(wallets.map((w) => (w.id === id ? { ...w, connected: !w.connected } : w)));
    };

    const handleOpenTopUp = (type: string, item: any) => {
        setTopUpModal({ open: true, type, id: item.id, name: item.name || `${item.bank} (${item.type})` });
        setTopUpAmount('');
    };

    const handleProcessTopUp = () => {
        const amount = parseInt(topUpAmount.replace(/[^0-9]/g, ''), 10);

        if (!amount || amount <= 0) {
return alert('Masukkan nominal yang valid!');
}

        if (topUpModal.type === 'wallet') {
            setWallets(wallets.map((w) => (w.id === topUpModal.id ? { ...w, balance: w.balance + amount } : w)));
        } else if (topUpModal.type === 'card') {
            setCards(cards.map((c) => (c.id === topUpModal.id ? { ...c, balance: c.balance + amount } : c)));
        }

        setTopUpModal({ open: false, type: '', id: null, name: '' });
        alert(`Berhasil Top Up Rp ${amount.toLocaleString('id-ID')} ke ${topUpModal.name}!`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 animate-in fade-in duration-300 min-h-[450px]">
            <div className="w-full md:w-[240px] shrink-0 border-r border-slate-100 pr-4">
                <h3 className="font-bold text-sm text-slate-900 mb-1">Metode Pembayaran</h3>
                <p className="text-xs text-slate-500 mb-4">Kelola kartu & e-wallet tersimpan</p>

                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => setActivePayment('ewallet')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex justify-between items-center ${
                            activePayment === 'ewallet'
                                ? 'bg-emerald-50 text-[#03ac0e]'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>Dompet Digital</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                            {wallets.filter((w) => w.connected).length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActivePayment('cc')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex justify-between items-center ${
                            activePayment === 'cc'
                                ? 'bg-emerald-50 text-[#03ac0e]'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>Kartu Debit / Kredit</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                            {cards.length}
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {activePayment === 'ewallet' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs relative flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-sm text-slate-900">{wallet.name}</span>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            wallet.connected ? 'bg-emerald-100 text-[#03ac0e]' : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {wallet.connected ? 'Terhubung' : 'Terputus'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 font-mono mb-2">
                                    {wallet.connected
                                        ? `${userPhone.substring(0, 4)} **** ${userPhone.substring(userPhone.length - 4)}`
                                        : '•••• •••• ••••'}
                                </p>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] text-slate-400">Saldo</p>
                                        <p className="text-xs font-bold text-slate-800">{formatRupiah(wallet.balance)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            wallet.connected ? handleOpenTopUp('wallet', wallet) : toggleWallet(wallet.id)
                                        }
                                        className="text-xs font-semibold text-[#03ac0e] hover:underline cursor-pointer"
                                    >
                                        {wallet.connected ? 'Top Up' : 'Sambungkan'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activePayment === 'cc' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className={`bg-gradient-to-br ${card.color} text-white rounded-xl p-5 shadow-xs relative flex flex-col justify-between`}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-xs">{card.type}</span>
                                    <span className="text-[10px] opacity-80">{card.bank}</span>
                                </div>
                                <p className="font-mono text-sm tracking-widest mb-4">{card.card_number}</p>
                                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
                                    <span>Saldo: {formatRupiah(card.balance)}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenTopUp('card', card)}
                                        className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                                    >
                                        Top Up
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {topUpModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-[380px] rounded-xl shadow-xl p-6 relative">
                        <button
                            type="button"
                            onClick={() => setTopUpModal({ ...topUpModal, open: false })}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-sm font-bold text-slate-900 mb-1">Top Up Saldo</h2>
                        <p className="text-xs text-slate-500 mb-4">Tujuan: {topUpModal.name}</p>

                        <input
                            type="text"
                            placeholder="Contoh: 50.000"
                            value={topUpAmount}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setTopUpAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                            }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 mb-4 focus:border-[#03ac0e] outline-none"
                        />

                        <button
                            type="button"
                            onClick={handleProcessTopUp}
                            className="w-full bg-[#03ac0e] text-white font-semibold py-2 rounded-lg text-xs hover:bg-[#029b0c] cursor-pointer"
                        >
                            Konfirmasi Top Up
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}