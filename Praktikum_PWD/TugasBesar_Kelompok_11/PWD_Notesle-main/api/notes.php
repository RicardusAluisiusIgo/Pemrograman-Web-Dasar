<?php
require_once __DIR__.'/init.php';
$user = auth_user(true);

$pdo->exec("DELETE FROM notes 
            WHERE status='trashed' 
            AND trashed_at IS NOT NULL 
            AND trashed_at < (NOW() - INTERVAL 7 DAY)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$status = $_GET['status'] ?? 'active';
$action = $_GET['action'] ?? null;
$id = $_GET['id'] ?? null;

/* GET */
if($method === 'GET'){
  if(!in_array($status, ['active','archived','trashed'])) $status='active';

  $st = $pdo->prepare("SELECT * FROM notes 
                       WHERE user_id=:uid AND status=:st
                       ORDER BY id DESC");
  $st->execute([':uid'=>$user['id'], ':st'=>$status]);
  respond_json($st->fetchAll());
}

if($method === 'POST' && !$action){

  $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
  if (stripos($contentType, 'application/json') !== false) {
      $in = get_json_body();
  } else {
      $in = $_POST;
  }

  $title = trim($in['title'] ?? '');
  $body  = trim($in['body'] ?? '');
  $lat   = $in['lat'] ?? null;
  $lng   = $in['lng'] ?? null;
  $color = $in['color'] ?? null;
  $location_name = $in['location_name'] ?? null;

  if(!$title || !$body) respond_json(['error'=>'Data tidak lengkap'],400);

  $st=$pdo->prepare("INSERT INTO notes(user_id,title,body,lat,lng,color,location_name,status) 
                      VALUES(:u,:t,:b,:lat,:lng,:c,:loc,'active')");
                      
  $st->execute([
    ':u'=>$user['id'],
    ':t'=>$title,
    ':b'=>$body,
    ':lat'=>$lat ?: null,
    ':lng'=>$lng ?: null,
    ':c'=>$color ?: null,
    ':loc'=>$location_name ?: null,
  ]);

  respond_json(['message'=>'Note dibuat']);
}

/*  PUT (UPDATE)*/
if($method === 'PUT'){
  if(!$id) respond_json(['error'=>'ID tidak ditemukan'], 400);

  $title = trim($_POST['title'] ?? '');
  $body  = trim($_POST['body'] ?? '');
  if(!$title || !$body) respond_json(['error'=>'Judul dan isi wajib'], 400);

  $st = $pdo->prepare("UPDATE notes 
                       SET title=:title, body=:body 
                       WHERE id=:id AND user_id=:uid AND status!='trashed'");
  $st->execute([
    ':title'=>$title,
    ':body'=>$body,
    ':id'=>$id,
    ':uid'=>$user['id']
  ]);

  if($st->rowCount()===0){
    respond_json(['error'=>'Catatan tidak ditemukan / sudah dihapus'],404);
  }

  respond_json(['message'=>'Catatan berhasil diupdate']);
}

/*  DELETE (SOFT DELETE ke TRASH) */
if($method === 'DELETE'){
  if(!$id) respond_json(['error'=>'ID tidak ditemukan'], 400);

  $st = $pdo->prepare("UPDATE notes 
                       SET status='trashed', trashed_at=NOW() 
                       WHERE id=:id AND user_id=:uid AND status!='trashed'");
  $st->execute([
    ':id'=>$id,
    ':uid'=>$user['id']
  ]);

  if($st->rowCount()===0){
    respond_json(['error'=>'Catatan tidak ditemukan / sudah di trash'],404);
  }

  respond_json(['message'=>'Catatan masuk sampah']);
}

/*  PATCH (ACTIONS nya) */
if($method === 'PATCH'){
  if(!$id) respond_json(['error'=>'ID tidak ditemukan'], 400);
  if(!$action) respond_json(['error'=>'Action tidak ada'],400);

  if($action === 'archive'){
    $st=$pdo->prepare("UPDATE notes 
                       SET status='archived', archived_at=NOW() 
                       WHERE id=:id AND user_id=:uid AND status='active'");
    $st->execute([':id'=>$id,':uid'=>$user['id']]);
    respond_json(['message'=>'Diarsipkan']);
  }

  if($action === 'unarchive'){
    $st=$pdo->prepare("UPDATE notes 
                       SET status='active', archived_at=NULL 
                       WHERE id=:id AND user_id=:uid AND status='archived'");
    $st->execute([':id'=>$id,':uid'=>$user['id']]);
    respond_json(['message'=>'Dikembalikan']);
  }

  if($action === 'restore'){
    $st=$pdo->prepare("UPDATE notes 
                       SET status='active', trashed_at=NULL 
                       WHERE id=:id AND user_id=:uid AND status='trashed'");
    $st->execute([':id'=>$id,':uid'=>$user['id']]);
    respond_json(['message'=>'Restore berhasil']);
  }

  if($action === 'purge'){
    $st=$pdo->prepare("DELETE FROM notes 
                       WHERE id=:id AND user_id=:uid AND status='trashed'");
    $st->execute([':id'=>$id,':uid'=>$user['id']]);
    respond_json(['message'=>'Hapus permanen']);
  }

  respond_json(['error'=>'Action tidak dikenal'],400);
}

respond_json(['error'=>'Method not allowed'],405);
