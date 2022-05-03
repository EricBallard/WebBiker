<?php

// Block direct access to file, echo js to redirect to index
$ajax = $_GET['ajax'];

if (!$ajax) {
    echo ("<script> window.location.href = '../index.html'; </script>");
    exit();
}

// Set timeout
set_time_limit(3);

// Create connection
$dbc = new mysqli(
    getenv("mysql_host"),
    getenv("mysql_user"),
    getenv("mysql_pass"),
    getenv("mysql_db")
);

//$dbc = new mysqli(
//    "127.0.0.1",
//    "user",
//    "password",
//    "hiscores"
//);


// Check connection
if ($dbc->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    exit();
}

// Validate table
$initTable = "CREATE TABLE IF NOT EXISTS records (
    name TEXT NOT NULL,
    score INTEGER,
    PRIMARY KEY(name(3))
);";

mysqli_query($dbc, $initTable) or die("Bad Query: $initTable");
