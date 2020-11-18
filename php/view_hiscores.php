<?php
    require 'connect.php';

$query = "SELECT * FROM hiscores ORDER BY score DESC LIMIT 10";
$result = mysqli_query($dbc, $query) or die("Bad Query: $query");


echo "<table border='1'>";
echo "<tr><td>Name</td><td>Score</td></tr>\n";

while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>
    <td>{$row['name']}</td>
    <td>{$row['score']}</td>
    </tr>";
}

echo "</table>";
?>