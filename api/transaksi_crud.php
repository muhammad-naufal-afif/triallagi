<?php
// Sesi 2: API untuk CRUD Transaksi (Pendapatan & Pengeluaran)
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id_bulan = $_SESSION['active_bulan_id'] ?? null;
$type = $_GET['type'] ?? ''; // 'pendapatan' atau 'pengeluaran'

if (!$id_bulan) {
    json_response(['error' => 'Bulan aktif belum dipilih.'], 400);
}
if ($type !== 'pendapatan' && $type !== 'pengeluaran') {
     json_response(['error' => 'Tipe transaksi tidak valid.'], 400);
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("SELECT * FROM $type WHERE id_bulan = ? ORDER BY tanggal DESC");
        $stmt->execute([$id_bulan]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        json_response($data);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $total = $data['jumlah'] * $data['harga'];
        
        $stmt = $pdo->prepare("INSERT INTO $type (id_bulan, tanggal, keterangan, jumlah, harga, total) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id_bulan, $data['tanggal'], $data['keterangan'], $data['jumlah'], $data['harga'], $total]);
        json_response(['success' => true, 'message' => 'Data berhasil ditambahkan.']);
        break;

    case 'DELETE':
        $id_transaksi = $_GET['id'];
        $id_column = ($type == 'pendapatan') ? 'id_pendapatan' : 'id_pengeluaran';
        
        $stmt = $pdo->prepare("DELETE FROM $type WHERE $id_column = ?");
        $stmt->execute([$id_transaksi]);
        json_response(['success' => true, 'message' => 'Data berhasil dihapus.']);
        break;
}
?>