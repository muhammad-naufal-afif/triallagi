<?php
// API untuk Autentikasi (Login)
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['username']) && isset($data['password'])) {
    $username = $data['username'];
    $password = $data['password'];

    $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verifikasi password
    if ($admin && password_verify($password, $admin['password'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $admin['id_admin'];
        $_SESSION['admin_username'] = $admin['username'];
        
        json_response(['success' => true, 'message' => 'Login berhasil.']);
    } else {
        json_response(['success' => false, 'message' => 'Username atau password salah.'], 401);
    }
} else {
    json_response(['success' => false, 'message' => 'Data tidak lengkap.'], 400);
}
?>