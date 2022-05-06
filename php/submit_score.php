<?php
require 'connect.php';

// Submit data
$initials = $_GET['initials'];
$scoreObtained = $_GET['scoreObtained'];

$query = "INSERT INTO records (name, score) values ('$initials', $scoreObtained) ON DUPLICATE KEY UPDATE score = $scoreObtained";
$result = mysqli_query($dbc, $query) or die("Failed to submit score!");

// Close mysql conn
$dbc->close();