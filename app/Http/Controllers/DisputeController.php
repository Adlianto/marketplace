<?php

namespace App\Http\Controllers;

use App\Actions\Dispute\OpenDisputeAction;
use App\Actions\Dispute\ResolveDisputeAction;
use App\Http\Requests\Dispute\OpenDisputeRequest;
use App\Models\DisputeTicket;
use App\Models\SubOrder;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisputeController extends Controller
{
    /**
     * Show the dispute creation form for a sub order.
     */
    public function create(Request $request, SubOrder $subOrder): Response
    {
        /** @var User $user */
        $user = $request->user();

        // 1. Validate ownership
        abort_if($subOrder->user_id !== $user->id, 403, 'Anda tidak memiliki akses ke pesanan ini.');

        // 2. Validate status
        $status = is_object($subOrder->status) ? $subOrder->status->value : (string) $subOrder->status;
        abort_if(! in_array($status, ['delivered', 'shipped'], true), 403, 'Komplain hanya dapat diajukan untuk pesanan yang dikirim atau telah sampai.');

        // 3. Check existing dispute
        if ($subOrder->disputeTicket) {
            return redirect()->route('disputes.show', $subOrder->disputeTicket->id);
        }

        $subOrder->load(['items.product', 'items.sku', 'store']);

        return Inertia::render('dispute/create', [
            'subOrder' => $subOrder,
        ]);
    }

    /**
     * Store a new dispute ticket.
     */
    public function store(
        OpenDisputeRequest $request,
        OpenDisputeAction $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $ticket = $action->execute($user, $request->validated());

        return redirect()->route('disputes.show', $ticket->id)
            ->with('success', 'Komplain Anda berhasil diajukan. Dana escrow penjual telah ditahan sementara hingga solusi disepakati.');
    }

    /**
     * Show the details of a dispute ticket.
     */
    public function show(Request $request, DisputeTicket $disputeTicket): Response
    {
        /** @var User $user */
        $user = $request->user();

        $disputeTicket->load([
            'subOrder.items.product',
            'subOrder.items.sku',
            'subOrder.address',
            'store',
            'user',
        ]);

        // Authorization: Buyer or Store Owner
        $isBuyer = $disputeTicket->user_id === $user->id;
        $isSeller = $disputeTicket->store && $disputeTicket->store->user_id === $user->id;

        abort_if(! $isBuyer && ! $isSeller, 403, 'Anda tidak memiliki akses untuk melihat tiket komplain ini.');

        return Inertia::render('dispute/show', [
            'disputeTicket' => $disputeTicket,
            'isBuyer' => $isBuyer,
            'isSeller' => $isSeller,
        ]);
    }

    /**
     * Resolve a dispute ticket (Seller or Admin resolution).
     */
    public function resolve(
        Request $request,
        DisputeTicket $disputeTicket,
        ResolveDisputeAction $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        // Only store owner or buyer can interact
        $isBuyer = $disputeTicket->user_id === $user->id;
        $isSeller = $disputeTicket->store && $disputeTicket->store->user_id === $user->id;

        abort_if(! $isBuyer && ! $isSeller, 403, 'Anda tidak memiliki akses untuk menyelesaikan tiket komplain ini.');

        $validated = $request->validate([
            'solution' => ['required', 'string', 'in:resolved_completed,resolved_refund'],
        ]);

        $action->execute($disputeTicket, $validated['solution']);

        return redirect()->route('disputes.show', $disputeTicket->id)
            ->with('success', 'Solusi komplain berhasil diterapkan.');
    }
}
