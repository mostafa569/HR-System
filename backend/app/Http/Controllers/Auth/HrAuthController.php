<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Hr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class HrAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $hr = Hr::where('email', $request->email)->first();

        if (! $hr || ! Hash::check($request->password, $hr->password)) {
            // throw ValidationException::withMessages([
            //     'email' => ['The provided credentials are incorrect.'],
            // ]);
            return response()->json(['message' => 'Invalid email or password'], 401);

        }

        $hr->tokens()->delete();

        $token = $hr->createToken('hr_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'token' => $token,
            'user' => $hr,
        ]);
    }


    // ---logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' =>'You Are Logged out']);
    }


}

