<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UserNotFoundException extends BadRequestHttpException
{
    public function __construct()
    {
        parent::__construct('Wrong username or password!');
    }
}
