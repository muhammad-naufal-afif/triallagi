<?php
// Sesi 2: API untuk CRUD Pelanggan
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM pelanggan ORDER BY nama_pelanggan ASC");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        json_response($data);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO pelanggan (nama_pelanggan, nomor_hp) VALUES (?, ?)");
        $stmt->execute([$data['nama_pelanggan'], $data['nomor_hp']]);
        json_response(['success' => true, 'message' => 'Pelanggan berhasil ditambahkan.']);
        break;

    case 'DELETE':
        $id = $_GET['id_pelanggan'];
        // Catatan: Jika pelanggan dihapus, pesanannya mungkin perlu dihapus/dianonimkan.
        // Untuk saat ini, kita biarkan pesanan tetap ada (FOREIGN KEY tidak ON DELETE CASCADE)
        $stmt = $pdo->prepare("DELETE FROM pelanggan WHERE id_pelanggan = ?");
        $stmt->execute([$id]);
        json_response(['success' => true, 'message' => 'Pelanggan berhasil dihapus.']);
        break;
}
?>