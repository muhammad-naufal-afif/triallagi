<?php
// Sesi 2: API untuk CRUD Bulan
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Cek jika ini request untuk set bulan aktif
        if (isset($_GET['action']) && $_GET['action'] == 'set_active') {
            $id = $_GET['id_bulan'];
            // 1. Set semua ke nonaktif
            $pdo->query("UPDATE bulan SET status = 'nonaktif'");
            // 2. Set yang dipilih ke aktif
            $stmt = $pdo->prepare("UPDATE bulan SET status = 'aktif' WHERE id_bulan = ?");
            $stmt->execute([$id]);
            // Simpan di session
            $_SESSION['active_bulan_id'] = $id;
            json_response(['success' => true, 'message' => 'Bulan aktif telah diubah.']);
        } 
        // Cek jika ini request untuk get bulan aktif
        elseif (isset($_GET['action']) && $_GET['action'] == 'get_active') {
            $stmt = $pdo->query("SELECT * FROM bulan WHERE status = 'aktif' LIMIT 1");
            $active_bulan = $stmt->fetch(PDO::FETCH_ASSOC);
            if($active_bulan) {
                 $_SESSION['active_bulan_id'] = $active_bulan['id_bulan'];
            }
            json_response($active_bulan ? $active_bulan : null);
        }
        // Jika tidak, ambil semua bulan
        else {
            $stmt = $pdo->query("SELECT * FROM bulan ORDER BY tahun DESC, id_bulan DESC");
            $bulan = $stmt->fetchAll(PDO::FETCH_ASSOC);
            json_response($bulan);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO bulan (nama_bulan, tahun) VALUES (?, ?)");
        $stmt->execute([$data['nama_bulan'], $data['tahun']]);
        json_response(['success' => true, 'message' => 'Bulan berhasil ditambahkan.']);
        break;

    case 'DELETE':
        $id = $_GET['id_bulan'];
        // Hapus juga semua data terkait (pendapatan, pengeluaran, pesanan)
        // Kita sudah setting 'ON DELETE CASCADE' di Sesi 1, jadi ini otomatis
        $stmt = $pdo->prepare("DELETE FROM bulan WHERE id_bulan = ?");
        $stmt->execute([$id]);
        json_response(['success' => true, 'message' => 'Bulan berhasil dihapus.']);
        break;
}
?>