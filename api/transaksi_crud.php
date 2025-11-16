<?php
// Sesi 2: API untuk CRUD Transaksi (VERSI LENGKAP DENGAN EDIT)
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id_bulan = $_SESSION['active_bulan_id'] ?? null;
$type = $_GET['type'] ?? ''; // 'pendapatan' atau 'pengeluaran'

if (empty($type) || ($type !== 'pendapatan' && $type !== 'pengeluaran')) {
    json_response(['error' => 'Tipe transaksi tidak valid.'], 400);
}

$id_column = ($type == 'pendapatan') ? 'id_pendapatan' : 'id_pengeluaran';

switch ($method) {
    case 'GET':
        if (!empty($_GET['id'])) {
            // FITUR BARU: Ambil satu data untuk modal edit
            $id = $_GET['id'];
            $stmt = $pdo->prepare("SELECT * FROM $type WHERE $id_column = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            json_response($data);
        } else {
            // Fitur lama: Ambil semua data untuk tabel
            if (!$id_bulan) {
                json_response(['error' => 'Bulan aktif belum dipilih.'], 400);
            }
            $stmt = $pdo->prepare("SELECT * FROM $type WHERE id_bulan = ? ORDER BY tanggal DESC");
            $stmt->execute([$id_bulan]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            json_response($data);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['id_transaksi'])) {
            // FITUR BARU: Update data yang ada
            $total = $data['jumlah'] * $data['harga'];
            $id_transaksi = $data['id_transaksi'];

            $stmt = $pdo->prepare("
                UPDATE $type 
                SET tanggal = ?, keterangan = ?, jumlah = ?, harga = ?, total = ? 
                WHERE $id_column = ?
            ");
            $stmt->execute([
                $data['tanggal'], $data['keterangan'], $data['jumlah'], 
                $data['harga'], $total, $id_transaksi
            ]);
            json_response(['success' => true, 'message' => 'Data berhasil diperbarui.']);

        } else {
            // Fitur lama: Tambah data baru
            if (!$id_bulan) {
                json_response(['error' => 'Bulan aktif belum dipilih.'], 400);
            }
            $total = $data['jumlah'] * $data['harga'];
            $stmt = $pdo->prepare("INSERT INTO $type (id_bulan, tanggal, keterangan, jumlah, harga, total) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id_bulan, $data['tanggal'], $data['keterangan'], 
                $data['jumlah'], $data['harga'], $total
            ]);
            json_response(['success' => true, 'message' => 'Data berhasil ditambahkan.']);
        }
        break;

    case 'DELETE':
        $id_transaksi = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM $type WHERE $id_column = ?");
        $stmt->execute([$id_transaksi]);
        json_response(['success' => true, 'message' => 'Data berhasil dihapus.']);
        break;
}
?>