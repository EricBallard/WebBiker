<?php

$servername = "host";
$database = "database";
$username = "username";
$password = "password";

// Create connection
$dbc = new mysqli($servername, $username, $password, $database);

// Check connection
if ($dbc -> connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli -> connect_error;
    exit();
}
?>