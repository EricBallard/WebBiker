<?php

// Resume session
session_start();

// Only allow request with header set to ajax with existing session
if (
    // Bypass check if authenticated
    !isset($_SESSION["VERIFIED"]) &&

    (!isset($_COOKIE["AUTH"]) ||
        !isset($_SESSION["AUTH"]))/* ||
    !isset($_SERVER["HTTP_X_REQUESTED_WITH"]) ||
    strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) != "xmlhttprequest"*/
) {
    echo ("<script> window.location.href = '../index.php'; </script>");
    session_destroy();
    die();
}

// Set timeout
set_time_limit(2);

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