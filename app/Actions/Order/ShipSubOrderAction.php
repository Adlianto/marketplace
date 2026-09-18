<?php

namespace App\Actions\Order;

use App\Enums\SubOrderStatus;
use App\Models\SubOrder;
use App\Models\User;
use App\Services\Order\SubOrderStateMachine;

class ShipSubOrderAction
{
    public function __construct(
        protected SubOrderStateMachine $stateMachine,
    ) {}

    /**
     * Fulfill a processing SubOrder with tracking number and transition to shipped.
     */
    public function execute(User $user, SubOrder $subOrder, string $trackingNumber): SubOrder
    {
        $subOrder->loadMissing('store');

        // Anti-IDOR Check: verify authenticated user is the legitimate store owner
        abort_if(
            $subOrder->store->user_id !== $user->id,
            403,
            'Anda tidak memiliki otorisasi untuk memproses pesanan toko ini.'
        );

        $subOrder->tracking_number = strtoupper(trim($trackingNumber));
        $subOrder->shipped_at = now();

        $this->stateMachine->transitionTo($subOrder, SubOrderStatus::Shipped);

        return $subOrder->fresh();
    }
}
