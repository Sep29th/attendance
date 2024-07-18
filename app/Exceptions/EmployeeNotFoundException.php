<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class EmployeeNotFoundException extends NotFoundHttpException
{
    public function __construct($id)
    {
        parent::__construct('Not found a employee with id as "' . $id . '"');
    }
}
