<?php

namespace App\Http\Controllers\Holiday;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $holidays = Holiday::latest()->get();
        return response()->json($holidays);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'day' => 'required|string|max:20',
            'date' => 'required|date|unique:holidays,date',
            'type' => ['required', Rule::in(['official', 'weekly'])],
            'name' => 'nullable|string|max:255',
        ]);

        $holiday = Holiday::create($validated);

        return response()->json(['message' => 'Holiday created successfully', 'holiday' => $holiday], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $holiday = Holiday::find($id);

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
        $holiday = Holiday::find($id);

        if (!$holiday) {
            return response()->json(['message' => 'Holiday not found'], 404);
        }

        $validated = $request->validate([
            'day' => 'sometimes|required|string|max:20',
            'date' => ['sometimes', 'required', 'date', Rule::unique('holidays')->ignore($id)],
            'type' => ['sometimes', 'required', Rule::in(['official', 'weekly'])],
            'name' => 'nullable|string|max:255',
        ]);

        $holiday->update($validated);

        return response()->json(['message' => 'Holiday updated successfully', 'holiday' => $holiday]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $holiday = Holiday::find($id);

        if (!$holiday) {
            return response()->json(['message' => 'Holiday not found'], 404);
        }
        
        $holiday->delete();
        
        return response()->json(['message' => 'Holiday deleted successfully']);
    }
}