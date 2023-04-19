<?php

// Resume session
session_start();

// Only allow request with header set to ajax with existing session
if (
    // Bypass check if authenticated
    !isset($_SESSION["VERIFIED"]) &&

    // Is cookie set
    (!isset($_COOKIE["AUTH"]) ||
        // Is session initiated
        !isset($_SESSION["AUTH"]) ||
        // Is page requested with ajax xmlhttprequest
        !isset($_SERVER["HTTP_X_REQUESTED_WITH"]) ||
        strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) != "xmlhttprequest")
) {
    // One of these condition was not met, deny access
    echo ("<script> window.location.href = '../index.php'; </script>");
    session_destroy();
    die();
}

// Set timeout
set_time_limit(2);

// Create connection
$dbc = new mysqli(
    $_SERVER["mysql_host"],  $_SERVER["mysql_user"],   $_SERVER["mysql_pass"],  $_SERVER["mysql_db"]
);

// Check connection
if ($dbc->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    session_destroy();
    die();
}

// Reset verification
unset($_SESSION["VERIFIED"]);

/* Create table
$initTable = "CREATE TABLE IF NOT EXISTS records (
    name TEXT NOT NULL,
    score INTEGER,
    PRIMARY KEY(name(3))
);";

mysqli_query($dbc, $initTable) or die();
*/