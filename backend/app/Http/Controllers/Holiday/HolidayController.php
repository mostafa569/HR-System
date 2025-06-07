<?php

namespace App\Http\Controllers\Holiday;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $holidays = DB::table('holidays')->get();
        return response()->json($holidays);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'day' => 'required|string',
            'date' => 'required|date',
            'type' => ['required', Rule::in(['official', 'weekly'])],
            'name' => [
                'nullable',
                'string',
                Rule::when($request->type === 'official', ['required', 'string', 'min:1']),
            ],
        ]);

        // Check for duplicate holiday on the same date
        $existingHoliday = DB::table('holidays')
            ->whereDate('date', $validated['date'])
            ->first();

        if ($existingHoliday) {
            return response()->json([
                'message' => 'A holiday already exists on this date',
                'existing_holiday' => $existingHoliday
            ], 422);
        }

        // Ensure name is null for weekly holidays if empty
        if ($validated['type'] === 'weekly' && empty($validated['name'])) {
            $validated['name'] = null;
        }

        try {
            DB::table('holidays')->insert([
                'day' => $validated['day'],
                'date' => $validated['date'],
                'type' => $validated['type'],
                'name' => $validated['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['message' => 'Holiday created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create holiday', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $holiday = DB::table('holidays')->where('id', $id)->first();

        if (!$holiday) {
            return response()->json(['message' => 'Holiday not found'], 404);
        }

        return response()->json($holiday);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $holiday = DB::table('holidays')->where('id', $id)->first();

        if (!$holiday) {
            return response()->json(['message' => 'Holiday not found'], 404);
        }

        $validated = $request->validate([
            'day' => 'required|string',
            'date' => 'required|date',
            'type' => ['required', Rule::in(['official', 'weekly'])],
            'name' => [
                'nullable',
                'string',
                Rule::when($request->type === 'official', ['required', 'string', 'min:1']),
            ],
        ]);

        // Ensure name is null for weekly holidays if empty
        if ($validated['type'] === 'weekly' && empty($validated['name'])) {
            $validated['name'] = null;
        }

        try {
            DB::table('holidays')->where('id', $id)->update([
                'day' => $validated['day'],
                'date' => $validated['date'],
                'type' => $validated['type'],
                'name' => $validated['name'],
                'updated_at' => now(),
            ]);

            return response()->json(['message' => 'Holiday updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update holiday', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $holiday = DB::table('holidays')->where('id', $id)->first();

        if (!$holiday) {
            return response()->json(['message' => 'Holiday not found'], 404);
        }

        try {
            DB::table('holidays')->where('id', $id)->delete();
            return response()->json(['message' => 'Holiday deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete holiday', 'error' => $e->getMessage()], 500);
        }
    }
}