<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DeviceNotFoundException extends NotFoundHttpException
{
    public function __construct($id)
    {
        parent::__construct('Not found a device with id as "' . $id . '"');
    }
}
