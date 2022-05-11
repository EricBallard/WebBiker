<?php

// Encoded 'hwid' prevents obtaining legit cookie and reusing in dev/pen test
$agent = $_SERVER['HTTP_USER_AGENT'];

if (preg_match('/bot|googlebot|crawler|spider|robot|curl|crawling/', $agent)) {
    die();
}

// Query/cache data for payload
$ip = $_SERVER['REMOTE_ADDR'];
$expiration = time() + 3600;

// Create token header as a JSON string, encode to Base64Url
$header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
$header_encoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));

// Create token payload as a JSON string, encode to Base64Url
$payload = json_encode(['ip' => $ip, 'agent' => $agent, 'expiration' => $expiration]);
$payload_encoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

// Create signature hash, encode to Base64Url
$signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'abC123!', true);
$signature_encoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

// Create and cache Json Web Token
$jwt = $header_encoded . "." . $payload_encoded . "." . $signature_encoded;
