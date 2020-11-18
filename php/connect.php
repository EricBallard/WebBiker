<?php

$servername = "webbiker-database.czw3xqzkib0h.us-east-2.rds.amazonaws.com";
$database = "webbikerdatabase";
$username = "admin";
$password = "Pa55word";

// Create connection
$dbc = new mysqli($servername, $username, $password, $database);

// Check connection
if ($dbc -> connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli -> connect_error;
    exit();
}
?>