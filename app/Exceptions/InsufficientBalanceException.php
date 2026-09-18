<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Dilempar saat saldo dompet toko tidak mencukupi untuk melakukan penarikan dana.
 */
class InsufficientBalanceException extends RuntimeException {}
