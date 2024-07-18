<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class DeviceExistedException extends ConflictHttpException
{
    public function __construct($id, $name)
    {
        parent::__construct('Device with id as "' . $id . '" or name as "' . $name . '" already exists');
    }
}
