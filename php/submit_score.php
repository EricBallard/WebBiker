<?php
    require 'connect.php';

    // Validate table
    $initTable = "CREATE TABLE IF NOT EXISTS hiscores (
        name TEXT NOT NULL,
        score INTEGER,
        PRIMARY KEY(name(3))
    );";
  
    mysqli_query($dbc, $initTable) or die("Bad Query: $initTable");

    // Submit data
    $initials = $_GET['initials'];
    $scoreObtained = $_GET['scoreObtained'];

    $query = "INSERT INTO hiscores (name, score) values ('$initials', $scoreObtained) ON DUPLICATE KEY UPDATE score = $scoreObtained";
    $result = mysqli_query($dbc, $query) or die("Bad Query: $query");
?>