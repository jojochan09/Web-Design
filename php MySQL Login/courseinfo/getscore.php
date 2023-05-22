<?php
// Initialize the session
//Set the maxlifetime of the session

session_start();
//$uid=101;
$uid=$_SESSION['uid'];
settype($uid, 'integer');

define("DB_HOST", "mydb");
define("USERNAME", "dummy");
define("PASSWORD", "c3322b");
define("DB_NAME", "db3322");
$conn = mysqli_connect(DB_HOST, USERNAME, PASSWORD, DB_NAME);
if (isset($_GET['course'])){
       $currentcourse = $_GET['course'];
}

if(!isset($_SESSION["loggedin"]) | $_SESSION["loggedin"] !== true){
    header("location: ../login.php");
    exit;
    }

if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > 300) {
  // last request was more than 15 minutes ago
  session_unset(); // unset $_SESSION variable for the run-time
  //session_destroy(); // destroy session data in storage
  $_SESSION['return_message'] = "Session expired. Please login again.";
  header("Location: ../login.php"); // redirect to login page
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Course grade</title>
    <link rel="stylesheet" href="../styles/styles_getscore.css" />
</head>
<body>
    <h1><?php echo $currentcourse?> - Gradebook</h1>
    <?php
    if (isset($_GET['course'])){
       //$currentcourse = $_GET['course'];
       $query = "SELECT assign, score FROM courseinfo WHERE uid = '$uid' AND course = '$currentcourse'";
       $result = mysqli_query($conn, $query);
       $scoresum = 0;
       if ($result->num_rows > 0) {
       echo "<div><label>Assessment scores:</label></div>";
       echo "<table><tr><th>Item</th><th>Score</th></tr>";
      // output data of each row
         while($row = $result->fetch_assoc()) {
             echo "<tr><td>".$row["assign"]."</td><td>".$row["score"]. "</td></tr>";
             $scoresum = $scoresum + $row["score"];
          }
          echo "<tr><td>"."</td><td><b>ToTal</b> ".$scoresum."</table>";
       }
       else{
              echo "<br>
              <div style='font-size:large';>You do not have the gradebook for the course: $currentcourse in the system</div>";
       }
    }
    ?>
</body>
</html>