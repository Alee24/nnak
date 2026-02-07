<?php

class PaypalService {
    private $db;
    private $clientId;
    private $secret;
    private $env;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->loadSettings();
    }
    
    private function loadSettings() {
        $stmt = $this->db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'paypal_%'");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $this->clientId = $settings['paypal_client_id'] ?? '';
        $this->secret = $settings['paypal_secret'] ?? '';
        $this->env = $settings['paypal_env'] ?? 'sandbox';
    }
    
    private function getBaseUrl() {
        return $this->env === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
    }
    
    private function getAccessToken() {
        $url = $this->getBaseUrl() . '/v1/oauth2/token';
        $credentials = base64_encode($this->clientId . ':' . $this->secret);
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Authorization: Basic ' . $credentials,
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        $result = json_decode($response);
        return $result->access_token ?? null;
    }
    
    public function createOrder($amount, $currency = 'USD', $reference = '') {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) throw new Exception('Failed to generate PayPal access token');
        
        $url = $this->getBaseUrl() . '/v2/checkout/orders';
        $data = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => $currency,
                    'value' => $amount
                ],
                'reference_id' => $reference
            ]]
        ];
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        return json_decode($response);
    }
    
    public function captureOrder($orderId) {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) throw new Exception('Failed to generate PayPal access token');
        
        $url = $this->getBaseUrl() . "/v2/checkout/orders/{$orderId}/capture";
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        return json_decode($response);
    }
}
