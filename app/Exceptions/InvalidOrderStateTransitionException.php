<?php

namespace App\Exceptions;

use DomainException;
use Throwable;

class InvalidOrderStateTransitionException extends DomainException
{
    public function __construct(
        public readonly string $fromStatus,
        public readonly string $toStatus,
        string $message = '',
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        if ($message === '') {
            $message = "Transisi status dari [{$fromStatus}] ke [{$toStatus}] tidak diizinkan.";
        }

        parent::__construct($message, $code, $previous);
    }
}
