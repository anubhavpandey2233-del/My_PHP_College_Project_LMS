<?php

$password = "admin123";

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

echo "Original Password: " . $password . "<br><br>";
echo "Hashed Password:<br>";
echo $hashedPassword;