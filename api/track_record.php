<?php
// API BARU: Khusus untuk mengambil track record pesanan per pelanggan
require 'config.php';

if (empty($_GET['id_pelanggan'])) {
    json_response(['error' => 'ID Pelanggan tidak ada.'], 400);
}

$id_pelanggan = $_GET['id_pelanggan'];

// Query ini mengambil SEMUA pesanan pelanggan,
// dan MENGGABUNGKAN (JOIN) nama bulan dari tabel 'bulan'
$stmt = $pdo->prepare("
    SELECT 
        p.tanggal, 
        p.jenis_pesanan, 
        p.jumlah, 
        p.total, 
        b.nama_bulan, 
        b.tahun
    FROM pesanan p
    JOIN bulan b ON p.id_bulan = b.id_bulan
    WHERE p.id_pelanggan = ?
    ORDER BY p.tanggal DESC
");
$stmt->execute([$id_pelanggan]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response($data);
?>