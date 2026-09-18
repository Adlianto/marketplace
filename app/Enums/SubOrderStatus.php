<?php

namespace App\Enums;

enum SubOrderStatus: string
{
    case WaitingPayment = 'waiting_payment';
    case Paid = 'paid';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Complaint = 'complaint';

    // Aliases for compatibility with UPPER_CASE conventions
    public const WAITING_PAYMENT = self::WaitingPayment;

    public const PAID = self::Paid;

    public const PROCESSING = self::Processing;

    public const SHIPPED = self::Shipped;

    public const DELIVERED = self::Delivered;

    public const COMPLETED = self::Completed;

    public const CANCELLED = self::Cancelled;

    public const COMPLAINT = self::Complaint;

    /**
     * Get the human-readable Indonesian label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::WaitingPayment => 'Menunggu Pembayaran',
            self::Paid => 'Sudah Dibayar',
            self::Processing => 'Sedang Diproses',
            self::Shipped => 'Sedang Dikirim',
            self::Delivered => 'Tiba di Tujuan',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
            self::Complaint => 'Komplain / Kendala',
        };
    }

    /**
     * Get all raw string values of the enum cases.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
