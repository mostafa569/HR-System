<?php

namespace App\Http\Controllers\Adjustment;

use App\Http\Controllers\Controller;
use App\Models\Adjustment;
use App\Models\Employer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\SalaryCalculationService;
use Carbon\Carbon;

class AdjustmentController extends Controller
{
    protected $salaryCalculationService;

    public function __construct(SalaryCalculationService $salaryCalculationService)
    {
        $this->salaryCalculationService = $salaryCalculationService;
    }

    

    public function index($employerId)
    {
        try {
            $adjustments = Adjustment::where('employer_id', $employerId)
                ->orderBy('date', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $adjustments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $employer = Employer::findOrFail($request->employer_id);
            $dailySalary = $employer->salary / 30;

            $validator = Validator::make($request->all(), [
                'employer_id' => 'required|exists:employers,id',
                'date' => 'required|date',
                'value' => 'required|numeric|gt:0',
                'value_type' => 'required|in:money,hours',
                'kind' => 'required|in:addition,deduction',
                'reason' => 'nullable|string|max:255'
            ]);

            $validator->after(function ($validator) use ($request, $dailySalary) {
                if ($request->kind === 'addition' && $request->value_type === 'hours') {
                    if ($request->value <= 0) {
                        $validator->errors()->add(
                            'value',
                            'Overtime hours cannot Zero or negative value ' 
                        );
                    }
                } elseif ($request->kind === 'deduction') {
                    $maxDeduction = $dailySalary * $request->value;
                    if ($request->value_type === 'money' && $request->value <= 0) {
                        $validator->errors()->add(
                            'value',
                            'Deduction money cannot Zero or negative value ' 
                        );
                    } elseif ($request->value_type === 'hours' && $request->value <= 0) {
                        $validator->errors()->add(
                            'value',
                            'Deduction hours cannot Zero or negative value ' 
                        );
                    }
                }
            });

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $adjustmentValue = $request->value;

           
            if ($request->kind === 'deduction') {
                $adjustmentValue = $adjustmentValue;
            }

            $adjustmentData = [
                'employer_id' => $request->employer_id,
                'date' => $request->date,
                'value_type' => $request->value_type,
                'kind' => $request->kind,
                'value' => $adjustmentValue,
                'reason' => $request->reason,
            ];

            $adjustment = Adjustment::create($adjustmentData);

            $date = Carbon::parse($request->date);
            $this->salaryCalculationService->calculateSalary(
                $request->employer_id,
                $date->year,
                $date->month
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Adjustment created successfully',
                'data' => $adjustment
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $adjustment = Adjustment::findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $adjustment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $adjustment = Adjustment::findOrFail($id);
            $employer = $adjustment->employer;
            $dailySalary = $employer->salary / 30;

            $validator = Validator::make($request->all(), [
                'date' => 'sometimes|required|date',
                'value' => 'sometimes|required|numeric|gt:0',
                'value_type' => 'sometimes|required|in:money,hours',
                'kind' => 'sometimes|required|in:addition,deduction',
                'reason' => 'nullable|string|max:255'
            ]);

            $validator->after(function ($validator) use ($request, $adjustment, $dailySalary) {
                $valueType = $request->input('value_type', $adjustment->value_type);
                $kind = $request->input('kind', $adjustment->kind);
                $value = $request->input('value', abs($adjustment->value));

                if ($kind === 'addition' && $valueType === 'hours') {
                    if ($value <= 0) {
                        $validator->errors()->add(
                            'value',
                            'Overtime hours cannot Zero or negative value '
                        );
                    }
                } elseif ($kind === 'deduction') {
                    $maxDeduction = $dailySalary * $request->value;
                    if ($valueType === 'money' && $value <= 0) {
                        $validator->errors()->add(
                            'value',
                            'Deduction money cannot zero or negative value '
                        );
                    } elseif ($valueType === 'hours' && $value <=0) {
                        $validator->errors()->add(
                            'value',
                            'Deduction hours cannot Zero or negative value ' 
                        );
                    }
                }
            });

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only(['date', 'value', 'value_type', 'kind', 'reason']);

            if ($request->has('value')) {
                $value = $request->value;
                $kind = $request->input('kind', $adjustment->kind);
                $updateData['value'] = ($kind === 'deduction') ? -$value : $value;
            }

            $adjustment->update($updateData);

            
            $date = Carbon::parse($request->date ?? $adjustment->date);
            $this->salaryCalculationService->calculateSalary(
                $adjustment->employer_id,
                $date->year,
                $date->month
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Adjustment updated successfully',
                'data' => $adjustment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $adjustment = Adjustment::findOrFail($id);
            $employerId = $adjustment->employer_id;
            $date = Carbon::parse($adjustment->date);

            $adjustment->delete();

            
            $this->salaryCalculationService->calculateSalary(
                $employerId,
                $date->year,
                $date->month
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Adjustment deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}