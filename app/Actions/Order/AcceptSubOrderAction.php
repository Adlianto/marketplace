<?php

namespace App\Actions\Order;

use App\Enums\SubOrderStatus;
use App\Models\SubOrder;
use App\Models\User;
use App\Services\Order\SubOrderStateMachine;

class AcceptSubOrderAction
{
    public function __construct(
        protected SubOrderStateMachine $stateMachine,
    ) {}

    /**
     * Accept a paid SubOrder and transition it to processing.
     */
    public function execute(User $user, SubOrder $subOrder): SubOrder
    {
        $subOrder->loadMissing('store');

        // Anti-IDOR Check: verify authenticated user is the legitimate store owner
        abort_if(
            $subOrder->store->user_id !== $user->id,
            403,
            'Anda tidak memiliki otorisasi untuk memproses pesanan toko ini.'
        );

        $this->stateMachine->transitionTo($subOrder, SubOrderStatus::Processing);

        return $subOrder->fresh();
    }
}
