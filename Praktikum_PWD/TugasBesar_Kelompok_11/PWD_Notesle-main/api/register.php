<?php
require_once __DIR__.'/init.php';

if($_SERVER['REQUEST_METHOD']!=='POST')
  respond_json(['error'=>'Method not allowed'],405);

$input = get_json_body();
$username = trim($input['username'] ?? '');
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if($username===''||$email===''||$password==='')
  respond_json(['error'=>'Semua field wajib diisi'],400);

$cek = $pdo->prepare("SELECT id FROM users WHERE email=:e OR username=:u LIMIT 1");
$cek->execute([':e'=>$email, ':u'=>$username]);
if($cek->fetch())
  respond_json(['error'=>'Email/username sudah terdaftar'],409);

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("
  INSERT INTO users(username,email,password_hash,role)
  VALUES(:u,:e,:p,'user')
");
$stmt->execute([
  ':u'=>$username,
  ':e'=>$email,
  ':p'=>$hash
]);

respond_json(['message'=>'Registrasi berhasil. Silakan login.'],201);