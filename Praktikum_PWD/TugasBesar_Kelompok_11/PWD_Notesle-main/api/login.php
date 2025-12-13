<?php
require_once __DIR__.'/init.php';

if($_SERVER['REQUEST_METHOD']!=='POST')
  respond_json(['error'=>'Method not allowed'],405);

$input = get_json_body();
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if($email===''||$password==='')
  respond_json(['error'=>'Email & password wajib diisi'],400);

$st = $pdo->prepare("SELECT * FROM users WHERE email=:e LIMIT 1");
$st->execute([':e'=>$email]);
$user = $st->fetch();
if(!$user || !password_verify($password, $user['password_hash']))
  respond_json(['error'=>'Email / password salah'],401);

$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time()+7*24*3600);

$ins = $pdo->prepare("INSERT INTO tokens(token,user_id,expires_at) VALUES(:t,:uid,:ex)");
$ins->execute([':t'=>$token, ':uid'=>$user['id'], ':ex'=>$expires]);

respond_json([
  'token'=>$token,
  'role'=>$user['role'],
  'message'=>'Login berhasil'
]);
