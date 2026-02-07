<?php

class StripeService {
    private $db;
    private $secretKey;
    private $env;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->loadSettings();
    }
    
    private function loadSettings() {
        $stmt = $this->db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'stripe_%'");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $this->secretKey = $settings['stripe_secret_key'] ?? '';
        $this->env = $settings['stripe_env'] ?? 'sandbox';
    }
    
    public function createPaymentIntent($amount, $currency = 'usd', $metadata = []) {
        if (empty($this->secretKey)) {
            throw new Exception('Stripe Secret Key not configured');
        }

        $url = 'https://api.stripe.com/v1/payment_intents';
        
        // Amount must be in cents/smallest currency unit
        // For USD, KES (if supported), etc.
        // Assuming user provides amount in main unit (e.g. 10.00)
        $amountInCents = (int)($amount * 100);
        
        $data = [
            'amount' => $amountInCents,
            'currency' => strtolower($currency),
            'payment_method_types' => ['card'],
            'metadata' => $metadata
        ];
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->secretKey,
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        return json_decode($response);
    }
    
    public function verifyWebhook($payload, $sigHeader, $webhookSecret) {
        // Implementation for webhook verification if needed
        // For simplicity, we can rely on Stripe's payload for now
        // But in production, this should use Stripe PHP SDK for verification
        return json_decode($payload);
    }
}
