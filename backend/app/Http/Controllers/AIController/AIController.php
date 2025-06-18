<?php
namespace App\Http\Controllers\AIController;
use App\Http\Controllers\AIController\AIController;

use App\Services\OpenAIService;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function ask(Request $request)
{
    $prompt = $request->input('prompt');
    $ai = new OpenAIService();
    return response()->json(['response' => $ai->ask($prompt)]);
}
}
