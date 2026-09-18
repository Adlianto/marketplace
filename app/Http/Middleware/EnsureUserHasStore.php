<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasStore
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasStore()) {
            return redirect()->route('store.create')->with('info', 'Silakan buka toko terlebih dahulu untuk mengakses dashboard penjual.');
        }

        return $next($request);
    }
}
