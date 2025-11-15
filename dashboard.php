<?php
// Sesi 2: Kita akan tambahkan session_start() dan pengecekan login di sini
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: index.php');
    exit;
}

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - Pembukuan</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>

    <div class="dashboard-container">
        
        <nav class="sidebar">
            <div class="sidebar-header">
                <h3>Pembukuan</h3>
            </div>
            <ul>
                <li class="active"><a href="#dashboard"><i class="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
                <li><a href="#bulan"><i class="fas fa-calendar-alt"></i><span>Kelola Bulan</span></a></li>
                <li><a href="#transaksi"><i class="fas fa-exchange-alt"></i><span>Pendapatan/Pengeluaran</span></a></li>
                <li><a href="#pelanggan"><i class="fas fa-users"></i><span>Data Pelanggan</span></a></li>
                <li><a href="#pesanan"><i class="fas fa-shopping-cart"></i><span>Data Pesanan</span></a></li>
                <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
            </ul>
        </nav>

        <main class="main-content">
            <header class="main-header">
                <h2>Selamat Datang, Admin!</h2>
                <div class="current-month">
                    Bulan Aktif: <strong id="bulan-aktif-display">Belum Dipilih</strong>
                </div>
            </header>

            <section id="bulan" class="content-section" style="display:none;">
                <h3>Kelola Bulan</h3>
                <form id="formTambahBulan" class="form-grid">
                    <input type="text" id="nama_bulan" placeholder="Nama Bulan (cth: Januari)" required>
                    <input type="number" id="tahun" placeholder="Tahun (cth: 2024)" required>
                    <button type="submit" class="btn">Tambah Bulan</button>
                </form>
                <div class="table-container">
                    <table id="tabelBulan">
                        <thead>
                            <tr>
                                <th>Nama Bulan</th>
                                <th>Tahun</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </section>
            
            <section id="transaksi" class="content-section" style="display:none;">
                <h3>Kelola Pendapatan & Pengeluaran</h3>
                <div class="export-buttons">
                    <button id="btnExportCSV" class="btn btn-secondary"><i class="fas fa-file-csv"></i> Ekspor ke CSV</button>
                    </div>
                
                <div class="transaksi-container">
                    <div class="transaksi-col">
                        <h4>Tambah Pendapatan</h4>
                        <form id="formTambahPendapatan" class="form-grid">
                            <input type="date" id="pendapatan_tanggal" required>
                            <input type="text" id="pendapatan_keterangan" placeholder="Keterangan" required>
                            <input type="number" id="pendapatan_jumlah" placeholder="Jumlah" value="1" required>
                            <input type="number" id="pendapatan_harga" placeholder="Harga/Nominal" required>
                            <button type="submit" class="btn">Tambah</button>
                        </form>
                        <div class="table-container">
                            <table id="tabelPendapatan">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Keterangan</th>
                                        <th>Total</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                    <div class="transaksi-col">
                        <h4>Tambah Pengeluaran</h4>
                        <form id="formTambahPengeluaran" class="form-grid">
                            <input type="date" id="pengeluaran_tanggal" required>
                            <input type="text" id="pengeluaran_keterangan" placeholder="Keterangan" required>
                            <input type="number" id="pengeluaran_jumlah" placeholder="Jumlah" value="1" required>
                            <input type="number" id="pengeluaran_harga" placeholder="Harga/Nominal" required>
                            <button type="submit" class="btn btn-danger">Tambah</button>
                        </form>
                        <div class="table-container">
                            <table id="tabelPengeluaran">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Keterangan</th>
                                        <th>Total</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <section id="pelanggan" class="content-section" style="display:none;">
                <h3>Kelola Data Pelanggan</h3>
                <form id="formTambahPelanggan" class="form-grid">
                    <input type="text" id="pelanggan_nama" placeholder="Nama Pelanggan" required>
                    <input type="text" id="pelanggan_hp" placeholder="Nomor HP">
                    <button type="submit" class="btn">Tambah Pelanggan</button>
                </form>
                <div class="table-container">
                    <table id="tabelPelanggan">
                        <thead>
                            <tr>
                                <th>Nama Pelanggan</th>
                                <th>Nomor HP</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </section>
            
            <section id="pesanan" class="content-section" style="display:none;">
                <h3>Kelola Data Pesanan</h3>
                <p>Menambah pesanan di sini akan otomatis masuk ke data **Pendapatan**.</p>
                <form id="formTambahPesanan" class="form-grid-pesanan">
                    <select id="pesanan_pelanggan" required>
                        <option value="">-- Pilih Pelanggan --</option>
                        </select>
                    <input type="date" id="pesanan_tanggal" required>
                    <input type="text" id="pesanan_jenis" placeholder="Jenis Pesanan" required>
                    <input type="number" id="pesanan_jumlah" placeholder="Jumlah" value="1" required>
                    <input type="number" id="pesanan_harga" placeholder="Harga" required>
                    <button type="submit" class="btn">Tambah Pesanan</TCA></button>
                </form>
                <div class="table-container">
                    <table id="tabelPesanan">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Nama Pelanggan</th>
                                <th>Jenis Pesanan</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            </tbody>
                    </table>
                </div>
            </section>

        </main>
    </div>

    </body>
</html>