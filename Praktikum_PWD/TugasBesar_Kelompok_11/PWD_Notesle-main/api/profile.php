<?php
require_once __DIR__ . '/init.php';
$user = auth_user(true);
$uid  = $user['id'];

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

$base = dirname($_SERVER['SCRIPT_NAME']);
$base = str_replace('/api', '', $base);

/* PROFILE */
if ($method === 'GET') {
  $st = $pdo->prepare("SELECT id, username, email, photo, created_at FROM users WHERE id=:id");
  $st->execute([':id' => $uid]);
  $u = $st->fetch();

  if (!$u) respond_json(['error' => 'User tidak ditemukan'], 404);

  $u['avatar_url'] = $u['photo'] ? $base . "/uploads/" . $u['photo'] : null;

  respond_json($u);
}

/* HAPUS AVATARNYA  */
if ($method === 'POST' && $action === 'remove_photo') {

   $st = $pdo->prepare("SELECT photo FROM users WHERE id=:id");
  $st->execute([':id' => $uid]);
  $oldPhoto = $st->fetchColumn();

  if ($oldPhoto) {
    $filePath = __DIR__ . "/../uploads/" . $oldPhoto;
    if (is_file($filePath)) @unlink($filePath);
  }

  $pdo->prepare("UPDATE users SET photo=NULL WHERE id=:id")
      ->execute([':id' => $uid]);

  respond_json([
    "message" => "Foto profil dihapus",
    "avatar_url" => null
  ]);
}

/*  UPDATE PROFILENYA  */
if ($method === 'POST' && !$action) {

  $username = trim($_POST['username'] ?? '');
  $email    = trim($_POST['email'] ?? '');
  $password = trim($_POST['password'] ?? '');

  if (!$username || !$email) {
    respond_json(['error' => 'Username dan email wajib diisi'], 400);
  }

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond_json(['error' => 'Format email tidak valid'], 400);
  }

  $stOld = $pdo->prepare("SELECT photo FROM users WHERE id=:id");
  $stOld->execute([':id' => $uid]);
  $oldPhoto = $stOld->fetchColumn();

  $newPhotoName = null;

  if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $tmp  = $_FILES['avatar']['tmp_name'];
    $orig = $_FILES['avatar']['name'];

    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    $allowed = ['jpg','jpeg','png','webp'];

    if (!in_array($ext, $allowed)) {
      respond_json(['error' => 'Format foto harus jpg/png/webp'], 400);
    }

    $newPhotoName = "user{$uid}_" . time() . "." . $ext;

    $uploadDir = __DIR__ . "/../uploads";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $dest = $uploadDir . "/" . $newPhotoName;
    if (!move_uploaded_file($tmp, $dest)) {
      respond_json(['error' => 'Gagal menyimpan file foto'], 500);
    }

    if ($oldPhoto) {
      $oldPath = $uploadDir . "/" . $oldPhoto;
      if (is_file($oldPath)) @unlink($oldPath);
    }
  }

  $fields = [
    "username" => $username,
    "email"    => $email,
  ];

  if ($newPhotoName) {
    $fields["photo"] = $newPhotoName;
  }

  if ($password) {
    $fields["password_hash"] = password_hash($password, PASSWORD_DEFAULT);
  }

  $setParts = [];
  $params = [":id" => $uid];

  foreach ($fields as $col => $val) {
    $setParts[] = "$col=:$col";
    $params[":$col"] = $val;
  }

  $sql = "UPDATE users SET " . implode(", ", $setParts) . " WHERE id=:id";
  $st = $pdo->prepare($sql);
  $st->execute($params);

  $currentPhoto = $newPhotoName ?: $oldPhoto;

  respond_json([
    "message"    => "Profil berhasil diperbarui",
    "photo"      => $newPhotoName,
    "avatar_url" => $currentPhoto ? $base . "/uploads/" . $currentPhoto : null
  ]);
}

respond_json(['error' => 'Method not allowed'], 405);
