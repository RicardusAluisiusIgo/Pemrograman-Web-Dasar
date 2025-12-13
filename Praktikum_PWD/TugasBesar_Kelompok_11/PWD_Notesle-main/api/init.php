<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

function get_bearer_token() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];

    $auth = '';
    if (isset($headers['Authorization'])) $auth = $headers['Authorization'];
    if (isset($headers['authorization'])) $auth = $headers['authorization'];

    if (!$auth && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
        return $matches[1];
    }
    return null;
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'notes_app');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
  $dsn = "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4";
  $pdo = new PDO($dsn, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch(Exception $e){
  http_response_code(500);
  echo json_encode(['error'=>'DB connection failed']);
  exit;
}

function respond_json($data, $code=200){
  http_response_code($code);
  echo json_encode($data);
  exit;
}

function get_json_body(){
  $input = $_POST;
  if(empty($input)){
    $raw = file_get_contents("php://input");
    $json = json_decode($raw, true);
    if(is_array($json)) $input = $json;
  }
  return $input;
}

function auth_user($require=true){
  global $pdo;
  $token = get_bearer_token();

  if(!$token){
    if($require) respond_json(['error'=>'Unauthorized'], 401);
    return null;
  }

  $sql = "SELECT u.id, u.username, u.email, u.role, u.photo, t.expires_at
          FROM tokens t JOIN users u ON u.id=t.user_id
          WHERE t.token=:token LIMIT 1";
  $st = $pdo->prepare($sql);
  $st->execute([':token'=>$token]);
  $row = $st->fetch();

  if(!$row){
    if($require) respond_json(['error'=>'Invalid token'], 401);
    return null;
  }

  if(strtotime($row['expires_at']) < time()){
    $pdo->prepare("DELETE FROM tokens WHERE token=:t")->execute([':t'=>$token]);
    if($require) respond_json(['error'=>'Token expired'], 401);
    return null;
  }
  return $row;
}
