<?php

namespace App\Actions\Dispute;

use App\Enums\SubOrderStatus;
use App\Models\DisputeTicket;
use App\Models\SubOrder;
use App\Models\User;
use App\Services\Order\SubOrderStateMachine;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class OpenDisputeAction
{
    public function __construct(
        private readonly SubOrderStateMachine $stateMachine,
    ) {}

    /**
     * @param  array{
     *   sub_order_id: int,
     *   reason: string,
     *   description: string,
     *   photos: array<int, UploadedFile>
     * }  $data
     */
    public function execute(User $user, array $data): DisputeTicket
    {
        return DB::transaction(function () use ($user, $data): DisputeTicket {
            /** @var SubOrder $subOrder */
            $subOrder = SubOrder::where('id', $data['sub_order_id'])->lockForUpdate()->firstOrFail();

            // 1. Upload evidence photos
            $photoUrls = [];
            foreach ($data['photos'] as $photo) {
                if ($photo instanceof UploadedFile) {
                    $path = $photo->store('disputes', 'public');
                    $photoUrls[] = '/storage/'.$path;
                }
            }

            // 2. Transition status SubOrder to complaint via SubOrderStateMachine
            $this->stateMachine->transitionTo($subOrder, SubOrderStatus::Complaint);

            // 3. Create DisputeTicket with status 'open'
            return DisputeTicket::create([
                'sub_order_id' => $subOrder->id,
                'user_id' => $user->id,
                'store_id' => $subOrder->store_id,
                'reason' => $data['reason'],
                'description' => $data['description'],
                'evidence_photos' => $photoUrls,
                'status' => 'open',
            ]);
        });
    }
}
