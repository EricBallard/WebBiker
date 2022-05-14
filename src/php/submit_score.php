<?php
require 'connect.php';

// Resume session
session_start();

// Validate parameters
if (!isset($_GET['initials']) || !isset($_GET['score']) || !isset($_GET['auth'])) {
    //$dbc->close();
    die();
}

// Token is available, verify authenticity
$usr_jwt = $_COOKIE["AUTH"];
$svr_jwt = $_SESSION["AUTH"];

// Token has not been altered
if (strcmp($usr_jwt, $svr_jwt) !== 0) {
    session_destroy();
    $dbc->close();
    die();
}

// Extract payload
$payload = explode(".", $svr_jwt)[1];
$payload_decoded = str_replace(['-', '_', ''], ['+', '/', '='], base64_decode($payload));

// Convert to json, extract value by key
$json = json_decode($payload_decoded, true);
$expiration = $json["expiration"];

// Validate expiration
if (time() > (int) $expiration) {
    // Token is expired
    session_destroy();
    $dbc->close();
    die();
}

// Request is authentic, set session as authenticated 
// Prevents re-validating when viewing hiscores after submition
$_SESSION["VERIFIED"] = true;

// Submit data
$initials = $_GET['initials'];
$score = $_GET['score'];
$auth = $_GET['auth'];

$query = "INSERT INTO records (name, score) values ('$initials', $score) ON DUPLICATE KEY UPDATE score = $score";
$result = mysqli_query($dbc, $query) or die("Failed to submit score!");

// Close mysql conn
$dbc->close();
