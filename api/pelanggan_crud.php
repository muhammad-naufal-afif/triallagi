<?php
// API untuk CRUD Pelanggan 
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (!empty($_GET['id_pelanggan'])) {
            // Ambil satu pelanggan untuk modal edit
            $id = $_GET['id_pelanggan'];
            $stmt = $pdo->prepare("SELECT * FROM pelanggan WHERE id_pelanggan = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            json_response($data);
        } else {
            // Ambil semua pelanggan
            $stmt = $pdo->query("SELECT * FROM pelanggan ORDER BY nama_pelanggan ASC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            json_response($data);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['id_pelanggan'])) {
            // Update data pelanggan
            $stmt = $pdo->prepare("
                UPDATE pelanggan 
                SET nama_pelanggan = ?, nomor_hp = ?
                WHERE id_pelanggan = ?
            ");
            $stmt->execute([
                $data['nama_pelanggan'], $data['nomor_hp'], $data['id_pelanggan']
            ]);
            json_response(['success' => true, 'message' => 'Data pelanggan diperbarui.']);

        } else {
            // Tambah pelanggan baru
            $stmt = $pdo->prepare("INSERT INTO pelanggan (nama_pelanggan, nomor_hp) VALUES (?, ?)");
            $stmt->execute([$data['nama_pelanggan'], $data['nomor_hp']]);
            json_response(['success' => true, 'message' => 'Pelanggan berhasil ditambahkan.']);
        }
        break;

    case 'DELETE':
        $id = $_GET['id_pelanggan'];
        $stmt = $pdo->prepare("DELETE FROM pelanggan WHERE id_pelanggan = ?");
        $stmt->execute([$id]);
        json_response(['success' => true, 'message' => 'Pelanggan berhasil dihapus.']);
        break;
}
?>