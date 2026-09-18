<?php

namespace App\Services\Order;

use App\Enums\SubOrderStatus;
use App\Exceptions\InvalidOrderStateTransitionException;
use App\Models\SubOrder;

class SubOrderStateMachine
{
    /**
     * Map of valid transitions from a given order status.
     *
     * @var array<string, list<string>>
     */
    private const ALLOWED_TRANSITIONS = [
        'waiting_payment' => ['paid', 'cancelled'],
        'paid' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered', 'completed', 'complaint'],
        'delivered' => ['completed', 'complaint'],
        'complaint' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
    ];

    /**
     * Determine if a transition from current status to target status is valid.
     */
    public function canTransitionTo(SubOrder|SubOrderStatus|string $currentStatus, SubOrderStatus|string $targetStatus): bool
    {
        $from = $this->resolveStatusValue($currentStatus);
        $to = $this->resolveStatusValue($targetStatus);

        $allowed = self::ALLOWED_TRANSITIONS[$from] ?? [];

        return in_array($to, $allowed, true);
    }

    /**
     * Transition the given SubOrder to the target status.
     *
     * @throws InvalidOrderStateTransitionException
     */
    public function transitionTo(SubOrder $subOrder, SubOrderStatus|string $targetStatus): void
    {
        $from = $this->resolveStatusValue($subOrder->status);
        $to = $this->resolveStatusValue($targetStatus);

        if (! $this->canTransitionTo($from, $to)) {
            throw new InvalidOrderStateTransitionException($from, $to);
        }

        $subOrder->status = $to;

        // Auto-populate relevant milestone timestamps if not yet populated
        if ($to === SubOrderStatus::Shipped->value && $subOrder->shipped_at === null) {
            $subOrder->shipped_at = now();
        } elseif ($to === SubOrderStatus::Delivered->value && $subOrder->delivered_at === null) {
            $subOrder->delivered_at = now();
        } elseif ($to === SubOrderStatus::Completed->value && $subOrder->completed_at === null) {
            $subOrder->completed_at = now();
        }

        $subOrder->save();
    }

    /**
     * Get the list of allowed target statuses from the current status.
     *
     * @return list<string>
     */
    public function allowedTransitions(SubOrder|SubOrderStatus|string $currentStatus): array
    {
        $from = $this->resolveStatusValue($currentStatus);

        return self::ALLOWED_TRANSITIONS[$from] ?? [];
    }

    /**
     * Determine if the given status is a terminal state.
     */
    public function isTerminal(SubOrder|SubOrderStatus|string $currentStatus): bool
    {
        $status = $this->resolveStatusValue($currentStatus);

        return empty(self::ALLOWED_TRANSITIONS[$status] ?? []);
    }

    /**
     * Helper to resolve string representation from SubOrder, SubOrderStatus, or string.
     */
    private function resolveStatusValue(SubOrder|SubOrderStatus|string $status): string
    {
        if ($status instanceof SubOrder) {
            return $this->resolveStatusValue($status->status);
        }

        if ($status instanceof SubOrderStatus) {
            return $status->value;
        }

        return $status;
    }
}
