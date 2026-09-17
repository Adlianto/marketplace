import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
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
    const { auth } = usePage().props as {
        auth: { user: { name?: string; phone?: string } | null };
    };
    const user = auth.user;
    const userPhone = user?.phone || '081234567890';

    const [activePayment, setActivePayment] = useState('ewallet');

    const [wallets, setWallets] = useState<Wallet[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('marketku_wallets');

            return saved
                ? JSON.parse(saved)
                : [
                      {
                          id: 'gopay',
                          name: 'GoPay',
                          balance: 150000,
                          connected: true,
                          provider: 'gopay',
                      },
                      {
                          id: 'dana',
                          name: 'DANA',
                          balance: 50000,
                          connected: true,
                          provider: 'dana',
                      },
                      {
                          id: 'ovo',
                          name: 'OVO',
                          balance: 0,
                          connected: false,
                          provider: 'ovo',
                      },
                      {
                          id: 'shopeepay',
                          name: 'ShopeePay',
                          balance: 0,
                          connected: false,
                          provider: 'shopeepay',
                      },
                  ];
        }

        return [];
    });

    const [cards, setCards] = useState<Card[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('marketku_cards');

            return saved
                ? JSON.parse(saved)
                : [
                      {
                          id: 1,
                          type: 'VISA',
                          bank: 'BANK BCA',
                          card_number: '•••• •••• •••• 4567',
                          expiry_date: '12/28',
                          balance: 2500000,
                          color: 'from-[#193278] to-[#0A1742]',
                      },
                      {
                          id: 2,
                          type: 'Mastercard',
                          bank: 'BANK MANDIRI',
                          card_number: '•••• •••• •••• 8899',
                          expiry_date: '09/27',
                          balance: 1200000,
                          color: 'from-[#1E232E] to-[#0E1116]',
                      },
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

    const [topUpModal, setTopUpModal] = useState<{
        open: boolean;
        type: string;
        id: any;
        name: string;
    }>({
        open: false,
        type: '',
        id: null,
        name: '',
    });
    const [topUpAmount, setTopUpAmount] = useState('');

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    const toggleWallet = (id: string) => {
        setWallets(
            wallets.map((w) =>
                w.id === id ? { ...w, connected: !w.connected } : w,
            ),
        );
    };

    const handleOpenTopUp = (type: string, item: any) => {
        setTopUpModal({
            open: true,
            type,
            id: item.id,
            name: item.name || `${item.bank} (${item.type})`,
        });
        setTopUpAmount('');
    };

    const handleProcessTopUp = () => {
        const amount = parseInt(topUpAmount.replace(/[^0-9]/g, ''), 10);

        if (!amount || amount <= 0) {
            return alert('Masukkan nominal yang valid!');
        }

        if (topUpModal.type === 'wallet') {
            setWallets(
                wallets.map((w) =>
                    w.id === topUpModal.id
                        ? { ...w, balance: w.balance + amount }
                        : w,
                ),
            );
        } else if (topUpModal.type === 'card') {
            setCards(
                cards.map((c) =>
                    c.id === topUpModal.id
                        ? { ...c, balance: c.balance + amount }
                        : c,
                ),
            );
        }

        setTopUpModal({ open: false, type: '', id: null, name: '' });
        alert(
            `Berhasil Top Up Rp ${amount.toLocaleString('id-ID')} ke ${topUpModal.name}!`,
        );
    };

    return (
        <div className="flex min-h-[450px] animate-in flex-col gap-8 duration-300 fade-in md:flex-row">
            <div className="w-full shrink-0 border-r border-slate-100 pr-4 md:w-[240px]">
                <h3 className="mb-1 text-sm font-bold text-slate-900">
                    Metode Pembayaran
                </h3>
                <p className="mb-4 text-xs text-slate-500">
                    Kelola kartu & e-wallet tersimpan
                </p>

                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => setActivePayment('ewallet')}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                            activePayment === 'ewallet'
                                ? 'bg-emerald-50 text-[#03ac0e]'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>Dompet Digital</span>
                        <span className="py-0.2 rounded bg-slate-200 px-1.5 text-[10px] font-bold text-slate-700">
                            {wallets.filter((w) => w.connected).length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActivePayment('cc')}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                            activePayment === 'cc'
                                ? 'bg-emerald-50 text-[#03ac0e]'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>Kartu Debit / Kredit</span>
                        <span className="py-0.2 rounded bg-slate-200 px-1.5 text-[10px] font-bold text-slate-700">
                            {cards.length}
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {activePayment === 'ewallet' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">
                                        {wallet.name}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                            wallet.connected
                                                ? 'bg-emerald-100 text-[#03ac0e]'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {wallet.connected
                                            ? 'Terhubung'
                                            : 'Terputus'}
                                    </span>
                                </div>
                                <p className="mb-2 font-mono text-xs text-slate-400">
                                    {wallet.connected
                                        ? `${userPhone.substring(0, 4)} **** ${userPhone.substring(userPhone.length - 4)}`
                                        : '•••• •••• ••••'}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                                    <div>
                                        <p className="text-[10px] text-slate-400">
                                            Saldo
                                        </p>
                                        <p className="text-xs font-bold text-slate-800">
                                            {formatRupiah(wallet.balance)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            wallet.connected
                                                ? handleOpenTopUp(
                                                      'wallet',
                                                      wallet,
                                                  )
                                                : toggleWallet(wallet.id)
                                        }
                                        className="cursor-pointer text-xs font-semibold text-[#03ac0e] hover:underline"
                                    >
                                        {wallet.connected
                                            ? 'Top Up'
                                            : 'Sambungkan'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activePayment === 'cc' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className={`bg-gradient-to-br ${card.color} relative flex flex-col justify-between rounded-xl p-5 text-white shadow-xs`}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-xs font-bold">
                                        {card.type}
                                    </span>
                                    <span className="text-[10px] opacity-80">
                                        {card.bank}
                                    </span>
                                </div>
                                <p className="mb-4 font-mono text-sm tracking-widest">
                                    {card.card_number}
                                </p>
                                <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                                    <span>
                                        Saldo: {formatRupiah(card.balance)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenTopUp('card', card)
                                        }
                                        className="cursor-pointer rounded bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/30"
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
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 duration-200 fade-in">
                    <div className="relative w-full max-w-[380px] rounded-xl bg-white p-6 shadow-xl">
                        <button
                            type="button"
                            onClick={() =>
                                setTopUpModal({ ...topUpModal, open: false })
                            }
                            className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-600"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="mb-1 text-sm font-bold text-slate-900">
                            Top Up Saldo
                        </h2>
                        <p className="mb-4 text-xs text-slate-500">
                            Tujuan: {topUpModal.name}
                        </p>

                        <input
                            type="text"
                            placeholder="Contoh: 50.000"
                            value={topUpAmount}
                            onChange={(e) => {
                                const val = e.target.value.replace(
                                    /[^0-9]/g,
                                    '',
                                );
                                setTopUpAmount(
                                    val
                                        ? parseInt(val, 10).toLocaleString(
                                              'id-ID',
                                          )
                                        : '',
                                );
                            }}
                            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#03ac0e]"
                        />

                        <button
                            type="button"
                            onClick={handleProcessTopUp}
                            className="w-full cursor-pointer rounded-lg bg-[#03ac0e] py-2 text-xs font-semibold text-white hover:bg-[#029b0c]"
                        >
                            Konfirmasi Top Up
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
