<?php
// API untuk Metrik Dashboard
require 'config.php';

if (!isset($_SESSION['active_bulan_id'])) {
    json_response(['pendapatan' => 0, 'pengeluaran' => 0, 'sisa' => 0]);
}

$id_bulan = $_SESSION['active_bulan_id'];

// 1.  Pendapatan
$stmt_pendapatan = $pdo->prepare("SELECT SUM(total) AS total_pendapatan FROM pendapatan WHERE id_bulan = ?");
$stmt_pendapatan->execute([$id_bulan]);
$pendapatan = $stmt_pendapatan->fetch(PDO::FETCH_ASSOC)['total_pendapatan'] ?? 0;

// 2.  Pengeluaran
$stmt_pengeluaran = $pdo->prepare("SELECT SUM(total) AS total_pengeluaran FROM pengeluaran WHERE id_bulan = ?");
$stmt_pengeluaran->execute([$id_bulan]);
$pengeluaran = $stmt_pengeluaran->fetch(PDO::FETCH_ASSOC)['total_pengeluaran'] ?? 0;

// 3. Hitung Sisa
$sisa = $pendapatan - $pengeluaran;

json_response([
    'pendapatan' => $pendapatan,
    'pengeluaran' => $pengeluaran,
    'sisa' => $sisa
]);
?>