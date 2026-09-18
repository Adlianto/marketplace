<?php

namespace App\Http\Controllers;

use App\Actions\Order\CompleteSubOrderAction;
use App\Models\SubOrder;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Confirm sub order completion by buyer and release escrow funds.
     */
    public function complete(Request $request, SubOrder $subOrder, CompleteSubOrderAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $subOrder);

        return back()->with(
            'success',
            "Pesanan #{$subOrder->sub_order_number} berhasil diselesaikan. Dana telah diteruskan ke toko penjual."
        );
    }
}
