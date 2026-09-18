<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Dilempar saat stok SKU tidak mencukupi untuk memenuhi kuantitas yang diminta
 * dalam proses checkout pesimistik-lock.
 */
class InsufficientStockException extends RuntimeException {}
