<?php
// API untuk CRUD Transaksi (Versi dengan Nama Pelanggan)
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id_bulan = $_SESSION['active_bulan_id'] ?? null;
$type = $_GET['type'] ?? ''; 

if (empty($type) || ($type !== 'pendapatan' && $type !== 'pengeluaran')) {
    json_response(['error' => 'Tipe transaksi tidak valid.'], 400);
}

$id_column = ($type == 'pendapatan') ? 'id_pendapatan' : 'id_pengeluaran';

switch ($method) {
    case 'GET':
        if (!empty($_GET['id'])) {
            // Ambil satu data untuk edit
            $id = $_GET['id'];
            $stmt = $pdo->prepare("SELECT * FROM $type WHERE $id_column = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            json_response($data);
        } else {
            // Ambil semua data untuk tabel
            if (!$id_bulan) {
                json_response(['error' => 'Bulan aktif belum dipilih.'], 400);
            }

            if ($type == 'pendapatan') {
                // KHUSUS PENDAPATAN: JOIN ke tabel pesanan & pelanggan
                $sql = "
                    SELECT t.*, pl.nama_pelanggan 
                    FROM pendapatan t
                    LEFT JOIN pesanan p ON t.id_pesanan = p.id_pesanan
                    LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
                    WHERE t.id_bulan = ? 
                    ORDER BY t.tanggal DESC
                ";
            } else {
                // PENGELUARAN: Biasa saja
                $sql = "SELECT * FROM pengeluaran WHERE id_bulan = ? ORDER BY tanggal DESC";
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id_bulan]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            json_response($data);
        }
        break;

    // ... (Bagian POST dan DELETE di bawah ini TETAP SAMA seperti sebelumnya) ...
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['id_transaksi'])) {
            $total = $data['jumlah'] * $data['harga'];
            $id_transaksi = $data['id_transaksi'];
            $stmt = $pdo->prepare("UPDATE $type SET tanggal=?, keterangan=?, jumlah=?, harga=?, total=? WHERE $id_column=?");
            $stmt->execute([$data['tanggal'], $data['keterangan'], $data['jumlah'], $data['harga'], $total, $id_transaksi]);
            json_response(['success' => true, 'message' => 'Data diperbarui.']);
        } else {
            $total = $data['jumlah'] * $data['harga'];
            $stmt = $pdo->prepare("INSERT INTO $type (id_bulan, tanggal, keterangan, jumlah, harga, total) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id_bulan, $data['tanggal'], $data['keterangan'], $data['jumlah'], $data['harga'], $total]);
            json_response(['success' => true, 'message' => 'Data ditambahkan.']);
        }
        break;

    case 'DELETE':
        $id_transaksi = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM $type WHERE $id_column = ?");
        $stmt->execute([$id_transaksi]);
        json_response(['success' => true, 'message' => 'Data dihapus.']);
        break;
}
?>