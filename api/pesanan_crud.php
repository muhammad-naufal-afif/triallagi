<?php
// API untuk CRUD Pesanan 
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id_bulan = $_SESSION['active_bulan_id'] ?? null;

if (!$id_bulan) {
    json_response(['error' => 'Bulan aktif belum dipilih.'], 400);
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("
            SELECT p.*, pl.nama_pelanggan 
            FROM pesanan p
            JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
            WHERE p.id_bulan = ? 
            ORDER BY p.tanggal DESC
        ");
        $stmt->execute([$id_bulan]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        json_response($data);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $total = $data['jumlah'] * $data['harga'];
        $keterangan_pendapatan = "Pesanan dari " . $data['nama_pelanggan_text'] . " (" . $data['jenis_pesanan'] . ")";

        // Mulai Transaksi Database
        $pdo->beginTransaction();
        try {
            // 1. Masukkan ke tabel 'pesanan'
            $stmt_pesanan = $pdo->prepare("
                INSERT INTO pesanan (id_pelanggan, id_bulan, tanggal, jenis_pesanan, jumlah, harga, total) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt_pesanan->execute([
                $data['id_pelanggan'], $id_bulan, $data['tanggal'], 
                $data['jenis_pesanan'], $data['jumlah'], $data['harga'], $total
            ]);

            // 2. Masukkan ke tabel 'pendapatan'
            $stmt_pendapatan = $pdo->prepare("
                INSERT INTO pendapatan (id_bulan, tanggal, keterangan, jumlah, harga, total) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt_pendapatan->execute([
                $id_bulan, $data['tanggal'], $keterangan_pendapatan, 
                $data['jumlah'], $data['harga'], $total
            ]);

            $pdo->commit();
            json_response(['success' => true, 'message' => 'Pesanan berhasil ditambahkan dan dicatat sebagai pendapatan.']);

        } catch (Exception $e) {
            $pdo->rollBack();
            json_response(['success' => false, 'message' => 'Gagal menyimpan data: ' . $e->getMessage()], 500);
        }
        break;
}
?>