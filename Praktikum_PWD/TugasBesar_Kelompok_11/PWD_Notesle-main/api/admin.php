<?php
require_once __DIR__.'/init.php';

$user = auth_user(true);
if (($user['role'] ?? '') !== 'admin') {
    respond_json(['error' => 'Forbidden Access'], 403);
}

$action = $_GET['action'] ?? null;
$id = $_GET['id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action) {
    if (!$id) respond_json(['error' => 'ID missing'], 400);

    try {
        if ($action === 'delete_user') {
            $pdo->prepare("DELETE FROM notes WHERE user_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
            respond_json(['success' => true, 'message' => 'User berhasil dihapus']);
        } 
        
        elseif ($action === 'delete_note') {
         
            $pdo->prepare("DELETE FROM notes WHERE id = ?")->execute([$id]);
            respond_json(['success' => true, 'message' => 'Catatan dihapus']);
        }
    } catch (PDOException $e) {
        respond_json(['error' => 'Database error'], 500);
    }
    exit;
}

$countUsers = $pdo->query("SELECT COUNT(*) c FROM users")->fetch()['c'];
$countNotes = $pdo->query("SELECT COUNT(*) c FROM notes")->fetch()['c'];

$users = $pdo->query("
  SELECT u.id, u.username, u.email, u.role, COUNT(n.id) notes_count
  FROM users u
  LEFT JOIN notes n ON n.user_id=u.id
  GROUP BY u.id
  ORDER BY u.id DESC
")->fetchAll();

$latestNotes = $pdo->query("
  SELECT n.id, u.username, n.title, n.created_at
  FROM notes n 
  JOIN users u ON u.id=n.user_id
  ORDER BY n.id DESC LIMIT 10
")->fetchAll();

respond_json([
  'count_users' => (int)$countUsers,
  'count_notes' => (int)$countNotes,
  'users' => $users,
  'latest_notes' => $latestNotes
]);