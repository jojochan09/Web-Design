<?php
#This is a demo program using testmail.cs.hku.hk to send email
#Prerequisite: Must connect to HKUVPN before sending email

//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//Load PHPMailer
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

//Connect to docker database
define("DB_HOST", "mydb");
define("USERNAME", "dummy");
define("PASSWORD", "c3322b");
define("DB_NAME", "db3322");
$conn = mysqli_connect(DB_HOST, USERNAME, PASSWORD, DB_NAME);

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);
$null = NULL;

session_start();

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
    header("location: courseinfo/index.php");
    exit;
    }

if(isset($_GET['token'])){
    $auth = $_GET['token'];
    $auth = hex2bin($auth);
    $json = json_decode($auth, true);
    $a_uid = $json["uid"];
    $a_secret = $json["secret"];

    $a_time = time();
    $query = "SELECT timestamp FROM user WHERE  uid = '$a_uid'";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
    $sent_time = $row["timestamp"];

    $query = "SELECT secret FROM user WHERE  uid = '$a_uid'";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
    $correct_secret = $row["secret"];

    if ($a_secret != $correct_secret){
      $error = "Fail to authenticate - incorrect secret!";
      //mysqli_query($conn, $sql);
    }
    elseif (time() - $sent_time > 60){
      $error = "Fail to authenticate - OTP expired!";
      $sql = "UPDATE user SET secret = NULL WHERE uid='$a_uid'";
      mysqli_query($conn, $sql);
      $sql = "UPDATE user SET timestamp = NULL WHERE uid='$a_uid'";
      mysqli_query($conn, $sql);
    }

    else{
    
    $sql = "SELECT uid FROM user WHERE secret = '$a_secret' AND uid = '$a_uid'";
    $a_result = mysqli_query($conn, $sql);
 
      $row = mysqli_fetch_array($a_result,MYSQLI_ASSOC);

      $a_count = mysqli_num_rows($a_result);

       if($a_count == 1){
         session_start();

         $_SESSION["loggedin"] = true;
         $_SESSION['last_activity'] = time();
         $_SESSION['uid'] = $a_uid;
         $sql = "UPDATE user SET secret = NULL WHERE uid='$a_uid'";
         mysqli_query($conn, $sql);
         $sql = "UPDATE user SET timestamp = NULL WHERE uid='$a_uid'";
         mysqli_query($conn, $sql);
         header("location: courseinfo/index.php");
        }
        else{
        $error = "Unknown user - cannot identify the student";
        }
      }
}
?>
<?php
   if($_SERVER["REQUEST_METHOD"] == "POST") {
      // sent from form 

      $useremail = mysqli_real_escape_string($conn,$_POST['mail']);
      
      $query = "SELECT uid FROM user WHERE email = '$useremail'";
      $result = mysqli_query($conn, $query);
 
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
      $uid = $row["uid"];
      $name = "student";

      $count = mysqli_num_rows($result);

      if($count != 1) {
      $error = "Unknown user - we don't have the records for $useremail in the system.";
      }
      else{
         //session_start();
         $secret = bin2hex(random_bytes(8));
         $sql = "UPDATE user SET secret='$secret' WHERE uid='$uid'";
         mysqli_query($conn, $sql);
         $time = time();
         $sql = "UPDATE user SET timestamp='$time' WHERE uid='$uid'";
         mysqli_query($conn, $sql);
         $token = array("uid" => $uid, "secret" =>$secret);
         $tokenURL="http://localhost:9080/login.php?token=".bin2hex(json_encode($token));
          try {
         //Server settings
           $mail->CharSet   = "UTF-8";
          // $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
           $mail->isSMTP();                                            //Send using SMTP
           $mail->Host       = 'testmail.cs.hku.hk';                     //Set the SMTP server to send through
           $mail->SMTPAuth   = false;                                   //Enable SMTP authentication
  
           $mail->Port       = 25;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
  
           //Sender
           $mail->setFrom('c3322@cs.hku.hk', 'COMP3322');
           //******** Add a recipient to receive your email *************
           $mail->addAddress($useremail, $name);     
  
           //Content
           $mail->isHTML(true);                                  //Set email format to HTML
           $mail->Subject = 'Send by PHPMailer';
           $mail->Body    = "Dear Student,\n You can log on to the system via the following link:\n ".$tokenURL;
           $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';
  
           $mail->send();
           $error = "Please check your email for the authentication URL.";
           //$_SESSION['token_match'] = false;
           //$_SESSION['uid'] = $uid;
           //$_SESSION['token_sent'] = time();

          } 
          catch (Exception $e) {
                echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
          }
      }
    }
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link rel="stylesheet" href="styles/styles_login.css" />
<title>Login</title>
</head>
<body>
    <h1>Gradebook Accessing Page</h1>
    <form  method="post" action="">
    <fieldset>
    <legend>My Gradebooks</legend>
    <div class="input">
    <br><label for="email">Email:</label> 
<input 
id="mail"
type="text" 
name="mail" 
pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@connect.hku.hk|[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@cs.hku.hk" 
oninvalid="setCustomValidity('Custom error message')" 
required>
<br>
<div class="error" aria-live="polite"></div>
<br>
<input id="submit" type="submit" value="login"><br>
</div>
    </fieldset>
<form>
<fieldset class="WrongInput">
      <?php echo $error ?>
      <?php if (isset($_SESSION['return_message'])){
          echo "<label>".$_SESSION['return_message']."</label>";
          session_destroy(); //delete the session(so everything will be clear when refresh)
      }
      ?>
    </fieldset>
</body>
<script>
const form = document.querySelector("form");
const email = document.getElementById("mail");
const emailError = document.querySelector(".error");

email.addEventListener("input", (event) => {
  // Each time the user types something, we check if the
  // form fields are valid.

  if (email.validity.valid) {
    // In case there is an error message visible, if the field
    // is valid, we remove the error message.
    emailError.textContent = ""; // Reset the content of the message
    emailError.className = "error"; // Reset the visual state of the message
  } else {
    // If there is still an error, show the correct error
    emailError.textContent = "Must be an email address with @cs.hku.hk or @connect.hku.hk";
    emailError.className = "error active";
  }
});

form.addEventListener("submit", (event) => {
  // if the email field is valid, we let the form submit
  if (!email.validity.valid) {
    // If it isn't, we display an appropriate error message
    emailError.textContent = "Must be an email address with @cs.hku.hk or @connect.hku.hk";
    emailError.className = "error active";
    // Then we prevent the form from being sent by canceling the event
    event.preventDefault();
  }
});
</script>
</html>
