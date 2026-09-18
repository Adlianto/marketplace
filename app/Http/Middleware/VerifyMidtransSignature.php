<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyMidtransSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $orderId = (string) $request->input('order_id');
        $statusCode = (string) $request->input('status_code');
        $grossAmount = (string) $request->input('gross_amount');
        $serverKey = (string) config('midtrans.server_key');
        $providedSignature = (string) $request->input('signature_key');

        if ($orderId === '' || $statusCode === '' || $grossAmount === '' || $providedSignature === '') {
            return response()->json([
                'success' => false,
                'message' => 'Parameter notifikasi Midtrans tidak lengkap untuk verifikasi tanda tangan digital.',
            ], 403);
        }

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        if (! hash_equals($expectedSignature, $providedSignature)) {
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi signature Midtrans tidak valid (Spoofing dicegah).',
            ], 403);
        }

        return $next($request);
    }
}
