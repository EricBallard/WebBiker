<?php

// Only allow request with header set to ajax
$ajax_req = isset($_SERVER["HTTP_X_REQUESTED_WITH"]) && strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) == "xmlhttprequest" ? true : false;

if (!$ajax_req) {
    echo "not ajax";
    echo $_SERVER["HTTP_X_REQUESTED_WITH"];
    die();
}

// Resume session
session_start();

// Check if session token is valid/exist
if (isset($_SESSION["TOKEN"]) === false) {
    echo ("<script> window.location.href = '../index.php'; </script>");
    session_destroy();
    die();
}

$jwt = $_SESSION["TOKEN"];


// Token is available, verify authenticity
//TODO


// Set timeout
set_time_limit(3);

// Create connection
$dbc = new mysqli(
    getenv("mysql_host"),
    getenv("mysql_user"),
    getenv("mysql_pass"),
    getenv("mysql_db")
);

// Check connection
if ($dbc->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    die();
}

// Validate table
$initTable = "CREATE TABLE IF NOT EXISTS records (
    name TEXT NOT NULL,
    score INTEGER,
    PRIMARY KEY(name(3))
);";

mysqli_query($dbc, $initTable) or die();
