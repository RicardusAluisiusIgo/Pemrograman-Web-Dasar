<?php
require_once __DIR__.'/init.php';

if($_SERVER['REQUEST_METHOD']!=='POST')
  respond_json(['error'=>'Method not allowed'],405);

$in = get_json_body();
$type  = $in['type'] ?? '';
$value = trim($in['value'] ?? '');

if(!$type || !$value)
  respond_json(['available'=>false,'error'=>'Data tidak lengkap'],400);

if($type==='email'){
  $st=$pdo->prepare("SELECT id FROM users WHERE email=:v LIMIT 1");
}else if($type==='username'){
  $st=$pdo->prepare("SELECT id FROM users WHERE username=:v LIMIT 1");
}else{
  respond_json(['available'=>false,'error'=>'Type invalid'],400);
}

$st->execute([':v'=>$value]);
respond_json(['available'=> $st->fetch() ? false : true]);
