<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CardIdUsedException extends BadRequestHttpException
{
    public function __construct()
    {
        parent::__construct('The card id is already in used!');
    }
}
