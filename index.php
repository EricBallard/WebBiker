<?php
// Set auth cookie


// Start php session
session_start();

// Generate JWT, store in session
include "./php/jwt.php";
$_SESSION["TOKEN"] = $jwt;

// Direct to HTML
header('Location: index.html');