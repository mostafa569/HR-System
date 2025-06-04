<?php

namespace App\Http\Controllers\Hr;
use App\Http\Controllers\Controller;
use App\Models\Hr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class HrController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Hr::select('id', 'full_name', 'username', 'email', 'created_at')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
             $validated = $request->validate([
            'full_name' => 'required|string',
            'username' => 'required|string|unique:hr_users,username',
            'email' => 'required|email|unique:hr_users,email',
            'password' => 'required|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $hr = Hr::create($validated);

        return response()->json(['message' => 'HR created', 'data' => $hr], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $hr = Hr::select('id', 'full_name', 'username', 'email')->findOrFail($id);
        return response()->json($hr);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $hr = Hr::findOrFail($id);
        if ($hr->id == 1 && auth()->id() != 1) {
        return response()->json(['error' => 'You cannot modify superadmin data'], 403);
        }


        $validated = $request->validate([
            'full_name' => 'sometimes|string',
            'username' => 'sometimes|string|unique:hr_users,username,' . $id,
            'email' => 'sometimes|email|unique:hr_users,email,' . $id,
            'password' => 'sometimes|min:6',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $hr->update($validated);

        return response()->json(['message' => 'HR updated', 'data' => $hr]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $hr = Hr::findOrFail($id);
        if ($id == 1) {
        return response()->json(['message' => 'Cannot delete main admin'], 403);
        }
        $hr->delete();

        return response()->json(['message' => 'HR deleted']);
    }
}
