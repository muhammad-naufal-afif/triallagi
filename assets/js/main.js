// Sesi 2: File JavaScript Utama
document.addEventListener("DOMContentLoaded", () => {
    
    // Cek di halaman mana kita berada
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        // --- LOGIKA HALAMAN LOGIN ---
        loginForm.addEventListener("submit", handleLogin);
    } else {
        // --- LOGIKA HALAMAN DASHBOARD ---
        initDashboard();
    }
});

// ===================================
// FUNGSI LOGIN
// ===================================
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("login-error");

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = 'dashboard.php';
        } else {
            errorEl.textContent = data.message || 'Login gagal.';
        }
    } catch (error) {
        errorEl.textContent = 'Tidak dapat terhubung ke server.';
    }
}


// ===================================
// FUNGSI DASHBOARD
// ===================================

let activeBulanId = null;

// Fungsi helper format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Fungsi inisialisasi dashboard
function initDashboard() {
    // 1. Setup Navigasi Sidebar
    setupNavigation();
    
    // 2. Load bulan aktif saat ini
    loadActiveBulan();

    // 3. Setup Event Listeners untuk semua form
    document.getElementById('formTambahBulan').addEventListener('submit', handleTambahBulan);
    document.getElementById('formTambahPendapatan').addEventListener('submit', (e) => handleTambahTransaksi(e, 'pendapatan'));
    document.getElementById('formTambahPengeluaran').addEventListener('submit', (e) => handleTambahTransaksi(e, 'pengeluaran'));
    document.getElementById('formTambahPelanggan').addEventListener('submit', handleTambahPelanggan);
    document.getElementById('formTambahPesanan').addEventListener('submit', handleTambahPesanan);
    document.getElementById('btnExportCSV').addEventListener('click', () => handleExport('csv'));
}

// Navigasi Halaman
function setupNavigation() {
    const links = document.querySelectorAll('.sidebar ul li a');
    const sections = document.querySelectorAll('.content-section');
    const dashboardMetric = document.getElementById('dashboard');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // Cek jika ini link logout
            if (link.getAttribute('href') === 'logout.php') {
                return true;
            }
            
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1); // remove '#'

            // Sembunyikan semua section
            sections.forEach(s => s.style.display = 'none');
            dashboardMetric.style.display = 'none';

            // Tampilkan target
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Tampilkan metric jika targetnya 'dashboard'
            if(targetId === 'dashboard') {
                dashboardMetric.style.display = 'grid';
            }

            // Hapus kelas aktif dari semua link
            links.forEach(l => l.parentElement.classList.remove('active'));
            // Tambah kelas aktif ke link yang diklik
            link.parentElement.classList.add('active');
            
            // Load data spesifik saat pindah halaman
            switch (targetId) {
                case 'bulan':
                    loadBulan();
                    break;
                case 'transaksi':
                    loadTransaksi();
                    break;
                case 'pelanggan':
                    loadPelanggan();
                    break;
                case 'pesanan':
                    loadPelangganOptions(); // Untuk dropdown
                    loadPesanan();
                    break;
            }
        });
    });
    
    // Tampilkan dashboard sebagai default
    document.getElementById('dashboard').style.display = 'grid';
}

// --- KELOLA BULAN ---

async function loadActiveBulan() {
    const response = await fetch('api/bulan_crud.php?action=get_active');
    const data = await response.json();
    
    if (data && data.id_bulan) {
        activeBulanId = data.id_bulan;
        document.getElementById('bulan-aktif-display').textContent = `${data.nama_bulan} ${data.tahun}`;
        // Load metric untuk bulan aktif
        loadDashboardMetrics();
    } else {
        document.getElementById('bulan-aktif-display').textContent = 'Belum Dipilih';
    }
}

async function loadBulan() {
    const response = await fetch('api/bulan_crud.php');
    const data = await response.json();
    const tbody = document.getElementById('tabelBulan').querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(b => {
        tbody.innerHTML += `
            <tr class="${b.status === 'aktif' ? 'row-aktif' : ''}">
                <td>${b.nama_bulan}</td>
                <td>${b.tahun}</td>
                <td>${b.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</td>
                <td>
                    <button class="btn btn-aksi" onclick="handleSetBulanAktif(${b.id_bulan}, '${b.nama_bulan}', '${b.tahun}')">Set Aktif</button>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusBulan(${b.id_bulan})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

async function handleTambahBulan(e) {
    e.preventDefault();
    const nama_bulan = document.getElementById('nama_bulan').value;
    const tahun = document.getElementById('tahun').value;
    
    await fetch('api/bulan_crud.php', {
        method: 'POST',
        body: JSON.stringify({ nama_bulan, tahun })
    });
    
    e.target.reset();
    loadBulan();
}

async function handleHapusBulan(id) {
    if (!confirm('Yakin ingin menghapus bulan ini? SEMUA data transaksi dan pesanan di bulan ini akan HILANG.')) return;
    
    await fetch(`api/bulan_crud.php?id_bulan=${id}`, { method: 'DELETE' });
    loadBulan();
    if (id === activeBulanId) {
        activeBulanId = null;
        loadActiveBulan();
    }
}

async function handleSetBulanAktif(id, nama, tahun) {
    await fetch(`api/bulan_crud.php?action=set_active&id_bulan=${id}`);
    activeBulanId = id;
    document.getElementById('bulan-aktif-display').textContent = `${nama} ${tahun}`;
    loadBulan();
    loadDashboardMetrics();
}

// --- METRIK & TRANSAKSI ---

async function loadDashboardMetrics() {
    if (!activeBulanId) {
        document.getElementById('metric-pendapatan').textContent = formatRupiah(0);
        document.getElementById('metric-pengeluaran').textContent = formatRupiah(0);
        document.getElementById('metric-sisa').textContent = formatRupiah(0);
        return;
    }
    
    const response = await fetch('api/dashboard_metrics.php');
    const data = await response.json();
    
    document.getElementById('metric-pendapatan').textContent = formatRupiah(data.pendapatan);
    document.getElementById('metric-pengeluaran').textContent = formatRupiah(data.pengeluaran);
    document.getElementById('metric-sisa').textContent = formatRupiah(data.sisa);
}

async function loadTransaksi() {
    if (!activeBulanId) return;

    // Load Pendapatan
    const resPendapatan = await fetch(`api/transaksi_crud.php?type=pendapatan`);
    const dataPendapatan = await resPendapatan.json();
    const tbodyPendapatan = document.getElementById('tabelPendapatan').querySelector('tbody');
    tbodyPendapatan.innerHTML = '';
    dataPendapatan.forEach(t => {
        tbodyPendapatan.innerHTML += `
            <tr>
                <td>${t.tanggal}</td>
                <td>${t.keterangan}</td>
                <td>${formatRupiah(t.total)}</td>
                <td>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusTransaksi(${t.id_pendapatan}, 'pendapatan')">Hapus</button>
                </td>
            </tr>
        `;
    });

    // Load Pengeluaran
    const resPengeluaran = await fetch(`api/transaksi_crud.php?type=pengeluaran`);
    const dataPengeluaran = await resPengeluaran.json();
    const tbodyPengeluaran = document.getElementById('tabelPengeluaran').querySelector('tbody');
    tbodyPengeluaran.innerHTML = '';
    dataPengeluaran.forEach(t => {
        tbodyPengeluaran.innerHTML += `
            <tr>
                <td>${t.tanggal}</td>
                <td>${t.keterangan}</td>
                <td>${formatRupiah(t.total)}</td>
                <td>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusTransaksi(${t.id_pengeluaran}, 'pengeluaran')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

async function handleTambahTransaksi(e, type) {
    e.preventDefault();
    if (!activeBulanId) {
        alert('Silakan pilih bulan aktif terlebih dahulu di halaman "Kelola Bulan".');
        return;
    }
    
    const data = {
        tanggal: document.getElementById(`${type}_tanggal`).value,
        keterangan: document.getElementById(`${type}_keterangan`).value,
        jumlah: document.getElementById(`${type}_jumlah`).value,
        harga: document.getElementById(`${type}_harga`).value,
    };

    await fetch(`api/transaksi_crud.php?type=${type}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    e.target.reset();
    loadTransaksi();
    loadDashboardMetrics();
}

async function handleHapusTransaksi(id, type) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    
    await fetch(`api/transaksi_crud.php?type=${type}&id=${id}`, { method: 'DELETE' });
    loadTransaksi();
    loadDashboardMetrics();
}

// --- KELOLA PELANGGAN ---

async function loadPelanggan() {
    const response = await fetch('api/pelanggan_crud.php');
    const data = await response.json();
    const tbody = document.getElementById('tabelPelanggan').querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.nama_pelanggan}</td>
                <td>${p.nomor_hp}</td>
                <td>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusPelanggan(${p.id_pelanggan})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

async function handleTambahPelanggan(e) {
    e.preventDefault();
    const data = {
        nama_pelanggan: document.getElementById('pelanggan_nama').value,
        nomor_hp: document.getElementById('pelanggan_hp').value,
    };
    
    await fetch('api/pelanggan_crud.php', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    e.target.reset();
    loadPelanggan();
}

async function handleHapusPelanggan(id) {
    if (!confirm('Yakin ingin menghapus pelanggan ini? (Data pesanan lama akan tetap ada)')) return;
    
    await fetch(`api/pelanggan_crud.php?id_pelanggan=${id}`, { method: 'DELETE' });
    loadPelanggan();
}

// --- KELOLA PESANAN ---

async function loadPelangganOptions() {
    // Fungsi ini untuk mengisi dropdown <select> di form pesanan
    const response = await fetch('api/pelanggan_crud.php');
    const data = await response.json();
    const select = document.getElementById('pesanan_pelanggan');
    select.innerHTML = '<option value="">-- Pilih Pelanggan --</option>';

    data.forEach(p => {
        select.innerHTML += `<option value="${p.id_pelanggan}">${p.nama_pelanggan}</option>`;
    });
}

async function loadPesanan() {
    if (!activeBulanId) return;

    const response = await fetch('api/pesanan_crud.php');
    const data = await response.json();
    const tbody = document.getElementById('tabelPesanan').querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.tanggal}</td>
                <td>${p.nama_pelanggan}</td>
                <td>${p.jenis_pesanan}</td>
                <td>${formatRupiah(p.total)}</td>
            </tr>
        `;
        // Hapus pesanan tidak diimplementasikan untuk menjaga integritas data pendapatan
    });
}

async function handleTambahPesanan(e) {
    e.preventDefault();
    if (!activeBulanId) {
        alert('Silakan pilih bulan aktif terlebih dahulu di halaman "Kelola Bulan".');
        return;
    }
    
    const select = document.getElementById('pesanan_pelanggan');
    const selectedOption = select.options[select.selectedIndex];
    
    const data = {
        id_pelanggan: select.value,
        nama_pelanggan_text: selectedOption.text, // Untuk keterangan di tabel pendapatan
        tanggal: document.getElementById('pesanan_tanggal').value,
        jenis_pesanan: document.getElementById('pesanan_jenis').value,
        jumlah: document.getElementById('pesanan_jumlah').value,
        harga: document.getElementById('pesanan_harga').value,
    };

    await fetch('api/pesanan_crud.php', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    e.target.reset();
    loadPesanan();
    loadTransaksi(); // Reload transaksi karena pendapatan bertambah
    loadDashboardMetrics(); // Reload metrik
}

// --- EKSPOR ---

function handleExport(type) {
    if (!activeBulanId) {
        alert('Silakan pilih bulan aktif terlebih dahulu.');
        return;
    }
    // Buka di tab baru
    window.open(`api/export.php?type=${type}`, '_blank');
}

// --- Helper untuk membuat fungsi global yang bisa dipanggil dari HTML (onclick) ---
// Ini cara untuk mengekspos fungsi dari dalam scope modul/DOMContentLoaded
window.handleHapusBulan = handleHapusBulan;
window.handleSetBulanAktif = handleSetBulanAktif;
window.handleHapusTransaksi = handleHapusTransaksi;
window.handleHapusPelanggan = handleHapusPelanggan;