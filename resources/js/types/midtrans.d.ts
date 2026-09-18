export interface SnapResult {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    pdf_url?: string;
    finish_redirect_url?: string;
}

export interface SnapCallbacks {
    onSuccess?: (result: SnapResult) => void;
    onPending?: (result: SnapResult) => void;
    onError?: (result: SnapResult) => void;
    onClose?: () => void;
}

declare global {
    interface Window {
        snap?: {
            pay: (
                snapToken: string,
                options?: SnapCallbacks
            ) => void;
            embed?: (
                snapToken: string,
                options: SnapCallbacks & { embedId: string }
            ) => void;
        };
    }
}

export {};
