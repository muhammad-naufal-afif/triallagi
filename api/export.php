<?php
// API untuk Ekspor Data 
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
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $nama_file . '"');

$output = fopen('php://output', 'w');
// Menambahkan BOM untuk Excel agar mengenali UTF-8 (opsional tapi bagus)
fputs($output, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

// --- PENDAPATAN ---
fputcsv($output, ['--- DATA PENDAPATAN ---']);
fputcsv($output, ['Tanggal', 'Keterangan', 'Jumlah', 'Harga', 'Total']);

// Ambil data pendapatan
$stmt_pendapatan = $pdo->prepare("SELECT tanggal, keterangan, jumlah, harga, total FROM pendapatan WHERE id_bulan = ? ORDER BY tanggal ASC");
$stmt_pendapatan->execute([$id_bulan]);
while ($row = $stmt_pendapatan->fetch(PDO::FETCH_ASSOC)) {
    fputcsv($output, $row);
}

// --- TOTAL PENDAPATAN (BARU) ---
$stmt_total_pendapatan = $pdo->prepare("SELECT SUM(total) AS total FROM pendapatan WHERE id_bulan = ?");
$stmt_total_pendapatan->execute([$id_bulan]);
$total_pendapatan = $stmt_total_pendapatan->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
fputcsv($output, ['']); 
// Menambahkan kolom kosong agar 'Jumlah Total' sejajar
fputcsv($output, ['', '', '', 'Jumlah Total Pendapatan:', $total_pendapatan]); 
fputcsv($output, ['']); 

// --- PENGELUARAN ---
fputcsv($output, ['--- DATA PENGELUARAN ---']);
fputcsv($output, ['Tanggal', 'Keterangan', 'Jumlah', 'Harga', 'Total']);

// Ambil data pengeluaran
$stmt_pengeluaran = $pdo->prepare("SELECT tanggal, keterangan, jumlah, harga, total FROM pengeluaran WHERE id_bulan = ? ORDER BY tanggal ASC");
$stmt_pengeluaran->execute([$id_bulan]);
while ($row = $stmt_pengeluaran->fetch(PDO::FETCH_ASSOC)) {
    fputcsv($output, $row);
}

// --- TOTAL PENGELUARAN (BARU) ---
$stmt_total_pengeluaran = $pdo->prepare("SELECT SUM(total) AS total FROM pengeluaran WHERE id_bulan = ?");
$stmt_total_pengeluaran->execute([$id_bulan]);
$total_pengeluaran = $stmt_total_pengeluaran->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
fputcsv($output, ['']); 
// Menambahkan kolom kosong agar 'Jumlah Total' sejajar
fputcsv($output, ['', '', '', 'Jumlah Total Pengeluaran:', $total_pengeluaran]);
fputcsv($output, ['']); 

// --- SISA UANG (BARU) ---
$sisa_uang = $total_pendapatan - $total_pengeluaran;
fputcsv($output, ['--- REKAPITULASI ---']);
fputcsv($output, ['', '', '', 'SISA UANG (Pendapatan - Pengeluaran):', $sisa_uang]);

fclose($output);
exit;
?>