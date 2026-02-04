<?php

class MpesaService {
    private $db;
    private $consumerKey;
    private $consumerSecret;
    private $passKey;
    private $shortCode;
    private $env;
    private $callbackUrl;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->loadSettings();
    }
    
    private function loadSettings() {
        $stmt = $this->db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'mpesa_%'");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $this->consumerKey = $settings['mpesa_consumer_key'] ?? '';
        $this->consumerSecret = $settings['mpesa_consumer_secret'] ?? '';
        $this->passKey = $settings['mpesa_passkey'] ?? '';
        $this->shortCode = $settings['mpesa_shortcode'] ?? '';
        $this->env = $settings['mpesa_env'] ?? 'sandbox';
        $this->callbackUrl = $settings['mpesa_callback_url'] ?? '';
    }
    
    private function getBaseUrl() {
        return $this->env === 'production' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
    }
    
    public function generateAccessToken() {
        $url = $this->getBaseUrl() . '/oauth/v1/generate?grant_type=client_credentials';
        $credentials = base64_encode($this->consumerKey . ':' . $this->consumerSecret);
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ['Authorization: Basic ' . $credentials]);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        $result = json_decode($response);
        return $result->access_token ?? null;
    }
    
    public function stkPush($phoneNumber, $amount, $accountReference, $transactionDesc = 'Membership Payment') {
        $accessToken = $this->generateAccessToken();
        
        if (!$accessToken) {
            throw new Exception('Failed to generate access token');
        }
        
        $timestamp = date('YmdHis');
        $password = base64_encode($this->shortCode . $this->passKey . $timestamp);
        
        // Format phone number (ensure 254 format)
        $phoneNumber = $this->formatPhoneNumber($phoneNumber);
        
        $data = [
            'BusinessShortCode' => $this->shortCode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => (int)$amount,
            'PartyA' => $phoneNumber,
            'PartyB' => $this->shortCode,
            'PhoneNumber' => $phoneNumber,
            'CallBackURL' => $this->callbackUrl,
            'AccountReference' => $accountReference,
            'TransactionDesc' => $transactionDesc 
        ];
        
        $url = $this->getBaseUrl() . '/mpesa/stkpush/v1/processrequest';
        
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
    
    private function formatPhoneNumber($phone) {
        // Remove non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // If starts with 0, replace with 254
        if (substr($phone, 0, 1) === '0') {
            return '254' . substr($phone, 1);
        }
        
        // If starts with +, remove it
        if (substr($phone, 0, 1) === '+') {
            return substr($phone, 1);
        }
        
        // If already 254, return as is
        if (substr($phone, 0, 3) === '254') {
            return $phone;
        }
        
        return $phone;
    }
}
