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
        return Hr::select('id', 'full_name', 'username', 'email','role', 'created_at')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'super admin') {
           return response()->json(['error' => 'Unauthorized. Only super admins can add HRs'], 403);
        }
             $validated = $request->validate([
            'full_name' => 'required|string|regex:/^[^0-9]+$/',
            'username' => 'required|string|unique:hr_users,username|regex:/^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/',
            'email' => 'required|email|unique:hr_users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:super admin,hr'
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
        $hr = Hr::select('id', 'full_name', 'username', 'email','role')->findOrFail($id);
        return response()->json($hr);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, $id)
    {
        $authUser = auth()->user(); 
        $targetUser = Hr::findOrFail($id); 

        if ($authUser->role !== 'super admin') {
            return response()->json(['error' => 'Unauthorized. Super admin only.'], 403);
        }
           
        if (
            $targetUser->role === 'super admin' &&
            isset($request->role) &&
            $request->role === 'hr'
        ) {
            $superAdminsCount = Hr::where('role', 'super admin')->count();

            if ($superAdminsCount <= 1) {
                return response()->json(['error' => 'At least one Super Admin must remain in the system.'], 403);
            }
        }
        // if you want to prevent super admins to modify other super admins
        if ($targetUser->role === 'super admin' && $authUser->id !== $targetUser->id) {
            return response()->json(['error' => 'You cannot modify another super admin.'], 403);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|string|regex:/^[^0-9]+$/',
            'username' => 'sometimes|string|unique:hr_users,username,' . $id . '|regex:/^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/',
            'email' => 'sometimes|email|unique:hr_users,email,' . $id,
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|in:super admin,hr',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $targetUser->update($validated);

        return response()->json(['message' => 'HR updated', 'data' => $targetUser]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $authUser = auth()->user(); 
        $targetUser = Hr::findOrFail($id); 
        if ($authUser->role !== 'super admin') {
            return response()->json(['error' => 'Unauthorized. Super admin only.'], 403);
        }

       // if ($targetUser->role === 'super admin') {
       //    return response()->json(['error' => 'Cannot delete super admin.'], 403);
       // }

        $targetUser->delete();

        return response()->json(['message' => 'HR deleted']);
    }

}