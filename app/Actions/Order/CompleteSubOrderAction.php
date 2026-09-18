<?php

namespace App\Actions\Order;

use App\Actions\Wallet\ReleaseEscrowToStoreWalletAction;
use App\Enums\SubOrderStatus;
use App\Exceptions\InvalidOrderStateTransitionException;
use App\Models\SubOrder;
use App\Models\User;
use App\Services\Order\SubOrderStateMachine;
use Illuminate\Support\Facades\DB;

class CompleteSubOrderAction
{
    public function __construct(
        protected SubOrderStateMachine $stateMachine,
        protected ReleaseEscrowToStoreWalletAction $releaseEscrowAction,
    ) {}

    /**
     * Complete a sub order, transition status to completed, and release escrow to the seller's wallet.
     *
     * @throws InvalidOrderStateTransitionException
     */
    public function execute(User $user, SubOrder $subOrder): SubOrder
    {
        return DB::transaction(function () use ($user, $subOrder): SubOrder {
            /** @var SubOrder $lockedSubOrder */
            $lockedSubOrder = SubOrder::with('store')
                ->where('id', $subOrder->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Anti-IDOR Check: only the buyer who placed the order can confirm receipt
            abort_if(
                $lockedSubOrder->user_id !== $user->id,
                403,
                'Anda tidak memiliki otorisasi untuk menyelesaikan pesanan ini.'
            );

            // Validate that the order is in a state eligible to be completed (e.g. shipped or delivered)
            if (! in_array($lockedSubOrder->status, [SubOrderStatus::Shipped->value, SubOrderStatus::Delivered->value], true)) {
                throw new InvalidOrderStateTransitionException($lockedSubOrder->status, SubOrderStatus::Completed->value);
            }

            // Transition status to completed via FSM
            $this->stateMachine->transitionTo($lockedSubOrder, SubOrderStatus::Completed);

            // Release escrow funds (items_subtotal) directly into the seller's store wallet
            $this->releaseEscrowAction->execute($lockedSubOrder);

            return $lockedSubOrder->fresh();
        });
    }
}
