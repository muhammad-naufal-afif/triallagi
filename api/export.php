<?php
// Sesi 2: API untuk Ekspor Data
require 'config.php';

if (!isset($_SESSION['active_bulan_id'])) {
    die("Bulan aktif tidak ditemukan.");
}

$id_bulan = $_SESSION['active_bulan_id'];

// Ambil data bulan
$stmt_bulan = $pdo->prepare("SELECT * FROM bulan WHERE id_bulan = ?");
$stmt_bulan->execute([$id_bulan]);
$bulan = $stmt_bulan->fetch(PDO::FETCH_ASSOC);
$nama_file = "Laporan_" . $bulan['nama_bulan'] . "_" . $bulan['tahun'] . ".csv";

// Set header untuk download CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="' . $nama_file . '"');

$output = fopen('php://output', 'w');

// Header CSV untuk Pendapatan
fputcsv($output, ['--- DATA PENDAPATAN ---']);
fputcsv($output, ['Tanggal', 'Keterangan', 'Jumlah', 'Harga', 'Total']);

// Ambil data pendapatan
$stmt_pendapatan = $pdo->prepare("SELECT tanggal, keterangan, jumlah, harga, total FROM pendapatan WHERE id_bulan = ?");
$stmt_pendapatan->execute([$id_bulan]);
while ($row = $stmt_pendapatan->fetch(PDO::FETCH_ASSOC)) {
    fputcsv($output, $row);
}

// Spasi
fputcsv($output, ['']);
fputcsv($output, ['--- DATA PENGELUARAN ---']);
fputcsv($output, ['Tanggal', 'Keterangan', 'Jumlah', 'Harga', 'Total']);

// Ambil data pengeluaran
$stmt_pengeluaran = $pdo->prepare("SELECT tanggal, keterangan, jumlah, harga, total FROM pengeluaran WHERE id_bulan = ?");
$stmt_pengeluaran->execute([$id_bulan]);
while ($row = $stmt_pengeluaran->fetch(PDO::FETCH_ASSOC)) {
    fputcsv($output, $row);
}

fclose($output);
exit;
?>