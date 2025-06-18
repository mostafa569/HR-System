<?php
namespace App\Services;
use OpenAI;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        $apiKey = config('services.openai.api_key');
        \Log::info('OpenAI API Key: ' . $apiKey);
        if (is_null($apiKey)) {
            throw new \Exception('OpenAI API key is not set in configuration');
        }
        $this->client = OpenAI::client($apiKey);
    }

    public function ask($prompt)
    {
        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 150,
                'temperature' => 0.7,
            ]);

            return $response['choices'][0]['message']['content'];
        } catch (\Exception $e) {
            \Log::error('OpenAI API Error: ' . $e->getMessage());
            throw $e;
        }
    }
}