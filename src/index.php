<?php
// Block ajax request
if (isset($_SERVER["HTTP_X_REQUESTED_WITH"])) {
    die();
}

// Generate JWT
include "./php/generate_jwt.php";

// Start php session
session_start();

// Store jwt in session
$_SESSION["AUTH"] = $jwt;

// Store jwt in cookie - expires 1hr
setcookie("AUTH", $jwt, time() + 3600, "/");

// Direct to HTML
header('Location: index.html');
