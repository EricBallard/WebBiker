<?php
    require 'connect.php';

$query = "SELECT * FROM records ORDER BY score DESC LIMIT 5";
$result = mysqli_query($dbc, $query) or die("Bad Query: $query");

echo "<table class='queryresults' border='1'>";
echo "<tr><td><b>Initials</b></td><td><b>Score</b></td></tr>\n";

while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>
    <td>{$row['name']}</td>
    <td>{$row['score']}</td>
    </tr>";
}

echo "</table>";
?>