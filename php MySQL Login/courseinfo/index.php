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
 
// Check if the user is logged in, if not then redirect him to login page
/*(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}*/
?>
<?php
if($_SERVER["REQUEST_METHOD"] == "GET") {
  //$_GET['course']
}
?>
 
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
</head>
<body>
    <h1>Course Information</h1>
    <h3>Retrieve continuous assessment scores for:</h3>
    <?php
    $query = "SELECT DISTINCT course FROM courseinfo WHERE uid = '$uid'";
    $result = mysqli_query($conn, $query);
    if ($result->num_rows > 0) {
    echo "<table><tr>";
      // output data of each row
         while($row = $result->fetch_assoc()) {
             echo "<tr><td>".
             "<form action='getscore.php' method='get'>".
             "<input style='
               background-color: transparent;
	           border: none;
	           color: blue;
	           padding: 12px 20px;
	           text-align: center;
               cursor: pointer;'
             name='course' type='submit' value=".$row["course"].">".
             "</form>";
          }
          echo "</table>";
     }
     ?>
</body>
</html>