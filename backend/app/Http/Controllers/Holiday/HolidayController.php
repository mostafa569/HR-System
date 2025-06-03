<?php

namespace App\Http\Controllers\Holiday;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $request->validate([
            'day' => 'nullable|string',
            'date' => 'required|date',
            'type' => 'nullable|string',
            'name' => 'required|string',
        ]);

        DB::table('holidays')->insert([
            'day' => $request->day,
            'date' => $request->date,
            'type' => $request->type,
            'name' => $request->name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Holiday inserted successfully'], 201);
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
        $request->validate([
            'day' => 'nullable|string',
            'date' => 'nullable|date',
            'type' => 'nullable|string',
            'name' => 'nullable|string',
        ]);

        $holiday = DB::table('holidays')->where('id', $id)->first();

        if (!$holiday) {
            return response()->json(['message' => 'Holiday not found'], 404);
        }

        DB::table('holidays')->where('id', $id)->update([
            'day' => $request->day ?? $holiday->day,
            'date' => $request->date ?? $holiday->date,
            'type' => $request->type ?? $holiday->type,
            'name' => $request->name ?? $holiday->name,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Holiday updated successfully']);
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

        DB::table('holidays')->where('id', $id)->delete();

        return response()->json(['message' => 'Holiday deleted successfully']);
    }
}
