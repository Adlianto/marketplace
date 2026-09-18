import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import type { SnapCallbacks, SnapResult } from '@/types';

interface UseMidtransSnapOptions {
    onSuccessRedirectUrl?: string;
    onPendingRedirectUrl?: string;
}

export function useMidtransSnap(options?: UseMidtransSnapOptions) {
    const [isPaying, setIsPaying] = useState<boolean>(false);
    const [snapError, setSnapError] = useState<string | null>(null);

    const pay = useCallback(
        (snapToken: string, customCallbacks?: SnapCallbacks) => {
            if (!window.snap) {
                const errMsg = 'Modul pembayaran Midtrans Snap belum siap atau gagal dimuat.';
                setSnapError(errMsg);
                customCallbacks?.onError?.({
                    status_code: '500',
                    status_message: errMsg,
                    transaction_id: '',
                    order_id: '',
                    gross_amount: '',
                    payment_type: '',
                    transaction_time: new Date().toISOString(),
                    transaction_status: 'error',
                });
                return;
            }

            setIsPaying(true);
            setSnapError(null);

            window.snap.pay(snapToken, {
                onSuccess: (result: SnapResult) => {
                    setIsPaying(false);
                    if (customCallbacks?.onSuccess) {
                        customCallbacks.onSuccess(result);
                    } else {
                        const targetUrl = options?.onSuccessRedirectUrl || '/dashboard';
                        router.visit(targetUrl);
                    }
                },
                onPending: (result: SnapResult) => {
                    setIsPaying(false);
                    if (customCallbacks?.onPending) {
                        customCallbacks.onPending(result);
                    } else {
                        const targetUrl = options?.onPendingRedirectUrl || '/dashboard';
                        router.visit(targetUrl);
                    }
                },
                onError: (result: SnapResult) => {
                    setIsPaying(false);
                    setSnapError(result.status_message || 'Pembayaran gagal.');
                    if (customCallbacks?.onError) {
                        customCallbacks.onError(result);
                    }
                },
                onClose: () => {
                    setIsPaying(false);
                    if (customCallbacks?.onClose) {
                        customCallbacks.onClose();
                    }
                },
            });
        },
        [options?.onSuccessRedirectUrl, options?.onPendingRedirectUrl]
    );

    return {
        pay,
        isPaying,
        setIsPaying,
        snapError,
        setSnapError,
    };
}

export default useMidtransSnap;
