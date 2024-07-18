<?php

namespace App\Http\Controllers;

use App\Exceptions\CardIdUsedException;
use App\Exceptions\EmployeeNotFoundException;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function createEmployee(Request $request)
    {
        $checkExist = Employee::query()->where('cardId', '=', $request->cardId)->first();
        if (isset($checkExist)) throw new CardIdUsedException();

        $employee = new Employee();
        $employee->name = $request->name;
        $employee->cardId = $request->cardId;
        $employee->state = true;
        $employee->save();

        return Employee::query()->where('cardId', '=', $request->cardId)->first();
    }

    public function updateEmployee(Request $request)
    {
        $employee = Employee::query()->where('id', '=', $request->id)->first();

        $employee->state = $request->state;
        $employee->name = $request->name;

        if ($employee->cardId != $request->cardId) {
            $checkExist = Employee::query()->where('cardId', '=', $request->cardId)->first();
            if (isset($checkExist))
                throw new CardIdUsedException();
            else $employee->cardId = $request->cardId;
        }

        $employee->save();

        return $employee;
    }

    public function deleteEmployee($id)
    {
        $employee = Employee::query()->where('id', '=', $id)->first();
        if (!isset($employee)) throw new EmployeeNotFoundException($id);

        $employee->delete();
        return true;
    }

    public function getAllEmployee()
    {
        return Employee::all();
    }
}
