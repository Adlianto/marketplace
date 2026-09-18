<?php

use App\Enums\SubOrderStatus;
use App\Exceptions\InvalidOrderStateTransitionException;
use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\User;
use App\Services\Order\SubOrderStateMachine;

/**
 * Fixture to create a basic SubOrder in a given status.
 */
function createSubOrderInStatus(string|SubOrderStatus $status = SubOrderStatus::WaitingPayment): SubOrder
{
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $statusValue = $status instanceof SubOrderStatus ? $status->value : $status;

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-FSM-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => 100000,
        'payment_status' => 'pending',
    ]);

    return SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-FSM-'.strtoupper(bin2hex(random_bytes(4))),
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'items_subtotal' => 90000,
        'shipping_cost' => 10000,
        'total_amount' => 100000,
        'status' => $statusValue,
    ]);
}

test('sub order status enum defines all expected cases, aliases, and labels', function () {
    expect(SubOrderStatus::WaitingPayment->value)->toBe('waiting_payment')
        ->and(SubOrderStatus::Paid->value)->toBe('paid')
        ->and(SubOrderStatus::Processing->value)->toBe('processing')
        ->and(SubOrderStatus::Shipped->value)->toBe('shipped')
        ->and(SubOrderStatus::Delivered->value)->toBe('delivered')
        ->and(SubOrderStatus::Completed->value)->toBe('completed')
        ->and(SubOrderStatus::Cancelled->value)->toBe('cancelled')
        ->and(SubOrderStatus::Complaint->value)->toBe('complaint');

    // Compatibility aliases
    expect(SubOrderStatus::WAITING_PAYMENT)->toBe(SubOrderStatus::WaitingPayment)
        ->and(SubOrderStatus::PAID)->toBe(SubOrderStatus::Paid)
        ->and(SubOrderStatus::PROCESSING)->toBe(SubOrderStatus::Processing)
        ->and(SubOrderStatus::SHIPPED)->toBe(SubOrderStatus::Shipped)
        ->and(SubOrderStatus::DELIVERED)->toBe(SubOrderStatus::Delivered)
        ->and(SubOrderStatus::COMPLETED)->toBe(SubOrderStatus::Completed)
        ->and(SubOrderStatus::CANCELLED)->toBe(SubOrderStatus::Cancelled)
        ->and(SubOrderStatus::COMPLAINT)->toBe(SubOrderStatus::Complaint);

    // Human-readable labels
    expect(SubOrderStatus::WaitingPayment->label())->toBe('Menunggu Pembayaran')
        ->and(SubOrderStatus::Paid->label())->toBe('Sudah Dibayar')
        ->and(SubOrderStatus::Processing->label())->toBe('Sedang Diproses')
        ->and(SubOrderStatus::Shipped->label())->toBe('Sedang Dikirim')
        ->and(SubOrderStatus::Delivered->label())->toBe('Tiba di Tujuan')
        ->and(SubOrderStatus::Completed->label())->toBe('Selesai')
        ->and(SubOrderStatus::Cancelled->label())->toBe('Dibatalkan')
        ->and(SubOrderStatus::Complaint->label())->toBe('Komplain / Kendala');
});

test('order state machine allows standard full happy path lifecycle', function () {
    $fsm = app(SubOrderStateMachine::class);
    $subOrder = createSubOrderInStatus(SubOrderStatus::WaitingPayment);

    // 1. waiting_payment -> paid
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Paid))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Paid);
    expect($subOrder->fresh()->status)->toBe('paid');

    // 2. paid -> processing
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Processing))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Processing);
    expect($subOrder->fresh()->status)->toBe('processing');

    // 3. processing -> shipped
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Shipped))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Shipped);
    expect($subOrder->fresh()->status)->toBe('shipped')
        ->and($subOrder->fresh()->shipped_at)->not->toBeNull();

    // 4. shipped -> delivered
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Delivered))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Delivered);
    expect($subOrder->fresh()->status)->toBe('delivered')
        ->and($subOrder->fresh()->delivered_at)->not->toBeNull();

    // 5. delivered -> completed
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Completed))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Completed);
    expect($subOrder->fresh()->status)->toBe('completed')
        ->and($subOrder->fresh()->completed_at)->not->toBeNull();

    // 6. completed is terminal
    expect($fsm->isTerminal($subOrder))->toBeTrue()
        ->and($fsm->allowedTransitions($subOrder))->toBeEmpty();
});

test('order state machine allows complaint branch then resolution to completed', function () {
    $fsm = app(SubOrderStateMachine::class);
    $subOrder = createSubOrderInStatus(SubOrderStatus::Delivered);

    // delivered -> complaint
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Complaint))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Complaint);
    expect($subOrder->fresh()->status)->toBe('complaint');

    // complaint -> completed
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Completed))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Completed);
    expect($subOrder->fresh()->status)->toBe('completed');
});

test('order state machine allows complaint resolution to cancelled', function () {
    $fsm = app(SubOrderStateMachine::class);
    $subOrder = createSubOrderInStatus(SubOrderStatus::Complaint);

    // complaint -> cancelled
    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Cancelled))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Cancelled);
    expect($subOrder->fresh()->status)->toBe('cancelled')
        ->and($fsm->isTerminal($subOrder))->toBeTrue();
});

test('order state machine allows cancellation from early statuses', function (string $startStatus) {
    $fsm = app(SubOrderStateMachine::class);
    $subOrder = createSubOrderInStatus($startStatus);

    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Cancelled))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Cancelled);
    expect($subOrder->fresh()->status)->toBe('cancelled');
})->with(['waiting_payment', 'paid', 'processing']);

test('order state machine allows direct completion from shipped', function () {
    $fsm = app(SubOrderStateMachine::class);
    $subOrder = createSubOrderInStatus(SubOrderStatus::Shipped);

    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Completed))->toBeTrue();
    $fsm->transitionTo($subOrder, SubOrderStatus::Completed);
    expect($subOrder->fresh()->status)->toBe('completed')
        ->and($subOrder->fresh()->completed_at)->not->toBeNull();
});

test('illegal transition from waiting_payment directly to completed throws exception', function () {
    $fsm = app(SubOrderStateMachine::class);
    $subOrder = createSubOrderInStatus(SubOrderStatus::WaitingPayment);

    expect($fsm->canTransitionTo($subOrder, SubOrderStatus::Completed))->toBeFalse();

    try {
        $fsm->transitionTo($subOrder, SubOrderStatus::Completed);
        test()->fail('InvalidOrderStateTransitionException was not thrown.');
    } catch (InvalidOrderStateTransitionException $e) {
        expect($e->fromStatus)->toBe('waiting_payment')
            ->and($e->toStatus)->toBe('completed')
            ->and($e->getMessage())->toBe('Transisi status dari [waiting_payment] ke [completed] tidak diizinkan.');
    }

    expect($subOrder->fresh()->status)->toBe('waiting_payment');
});

test('terminal states reject any further transitions', function (string $terminalStatus, string $targetStatus) {
    $fsm = app(SubOrderStateMachine::class);
    $subOrder = createSubOrderInStatus($terminalStatus);

    expect($fsm->isTerminal($subOrder))->toBeTrue()
        ->and($fsm->canTransitionTo($subOrder, $targetStatus))->toBeFalse();

    expect(fn () => $fsm->transitionTo($subOrder, $targetStatus))
        ->toThrow(
            InvalidOrderStateTransitionException::class,
            "Transisi status dari [{$terminalStatus}] ke [{$targetStatus}] tidak diizinkan."
        );

    expect($subOrder->fresh()->status)->toBe($terminalStatus);
})->with([
    ['completed', 'cancelled'],
    ['completed', 'shipped'],
    ['completed', 'paid'],
    ['cancelled', 'paid'],
    ['cancelled', 'processing'],
    ['cancelled', 'completed'],
]);

test('sub order model convenience methods delegate to state machine', function () {
    $subOrder = createSubOrderInStatus(SubOrderStatus::WaitingPayment);

    expect($subOrder->canTransitionTo(SubOrderStatus::Paid))->toBeTrue()
        ->and($subOrder->canTransitionTo('paid'))->toBeTrue()
        ->and($subOrder->canTransitionTo(SubOrderStatus::Delivered))->toBeFalse();

    $subOrder->transitionTo(SubOrderStatus::Paid);
    expect($subOrder->fresh()->status)->toBe('paid');

    expect(fn () => $subOrder->transitionTo(SubOrderStatus::Completed))
        ->toThrow(InvalidOrderStateTransitionException::class);
});
