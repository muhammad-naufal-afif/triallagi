document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    } else {
        initDashboard();
    }
});


//  LOGIN
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


//  DASHBOARD
let activeBulanId = null;
let activeBulanStr = null; 
let activeTahunStr = null; 

// format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// FUNGSI INPUT HARGA
function formatInputRupiah(inputElement) {
    let value = inputElement.value;
    let number_string = value.replace(/[^\d]/g, '').toString();
    if(number_string === "") {
        inputElement.value = "";
        return;
    }
    // format angka 
    let formatted = new Intl.NumberFormat('id-ID').format(number_string);
    
    // Setel kembali nilainya ke input
    inputElement.value = formatted;
}

// Fungsi inisialisasi dashboard
function initDashboard() {
    // Setup Navigasi Sidebar
    setupNavigation();
    
    // Load bulan aktif saat ini
    loadActiveBulan();

    // Setup Event Listeners untuk semua form
    document.getElementById('formTambahBulan').addEventListener('submit', handleTambahBulan);
    document.getElementById('formTambahPendapatan').addEventListener('submit', (e) => handleTambahTransaksi(e, 'pendapatan'));
    document.getElementById('formTambahPengeluaran').addEventListener('submit', (e) => handleTambahTransaksi(e, 'pengeluaran'));
    document.getElementById('formTambahPelanggan').addEventListener('submit', handleTambahPelanggan);
    document.getElementById('formTambahPesanan').addEventListener('submit', handleTambahPesanan);
    document.getElementById('btnExportCSV').addEventListener('click', () => handleExport('csv'));
    document.getElementById('pendapatan_harga').addEventListener('input', (e) => formatInputRupiah(e.target));
    document.getElementById('pengeluaran_harga').addEventListener('input', (e) => formatInputRupiah(e.target));
    document.getElementById('pesanan_harga').addEventListener('input', (e) => formatInputRupiah(e.target));
    document.getElementById('modalCloseBtn').addEventListener('click', closeEditModal);
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });
    document.getElementById('formEditTransaksi').addEventListener('submit', handleUpdateForm);
    document.getElementById('edit_harga').addEventListener('input', (e) => formatInputRupiah(e.target));
    document.getElementById('pelangganModalCloseBtn').addEventListener('click', closeEditPelangganModal);
    document.getElementById('formEditPelanggan').addEventListener('submit', handleUpdatePelanggan);
    document.getElementById('trackRecordModalCloseBtn').addEventListener('click', closeTrackRecordModal);
    document.getElementById('editPelangganModal').addEventListener('click', (e) => {
        if (e.target.id === 'editPelangganModal') closeEditPelangganModal();
    });
    document.getElementById('trackRecordModal').addEventListener('click', (e) => {
        if (e.target.id === 'trackRecordModal') closeTrackRecordModal();
    });
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });
    }

    // Saat layar gelap diklik (tutup sidebar)
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
    });
    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Cek apakah sedang di tampilan mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            }
        });
    });
    setupNavigation();
    loadActiveBulan();
}

// Navigasi Halaman
function setupNavigation() {
    const links = document.querySelectorAll('.sidebar ul li a');
    const sections = document.querySelectorAll('.content-section');
    const dashboardMetric = document.getElementById('dashboard');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === 'logout.php') return true;
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1); 

            sections.forEach(s => s.style.display = 'none');
            if (dashboardMetric) dashboardMetric.style.display = 'none';

            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.style.display = 'block';
            
            if(targetId === 'dashboard' && dashboardMetric) {
                dashboardMetric.style.display = 'grid';
            }

            links.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
            
            switch (targetId) {
                case 'bulan': loadBulan(); break;
                case 'transaksi': 
                    loadTransaksi(); 
                    loadPelangganOptions(); // <-- TAMBAHKAN INI (Biar dropdown pelanggan muncul)
                    break;
                case 'pelanggan': loadPelanggan(); break;
            }
        });
    });
    
    if(dashboardMetric) dashboardMetric.style.display = 'grid';
}

// KELOLA BULAN
async function loadActiveBulan() {
    const response = await fetch('api/bulan_crud.php?action=get_active');
    const data = await response.json();
    
    if (data && data.id_bulan) {
        activeBulanId = data.id_bulan;
        activeBulanStr = data.nama_bulan; 
        activeTahunStr = data.tahun;     
        document.getElementById('bulan-aktif-display').textContent = `${data.nama_bulan} ${data.tahun}`;
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
                <td class="button-container">
                    <button class="btn btn-aksi" onclick="handleSetBulanAktif(${b.id_bulan}, '${b.nama_bulan}', '${b.tahun}')">Set Aktif</button>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusBulan(${b.id_bulan})">Hapus</button>
                </td>
            </tr>`;
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
    activeBulanStr = nama; 
    activeTahunStr = tahun; 
    document.getElementById('bulan-aktif-display').textContent = `${nama} ${tahun}`;
    loadBulan();
    loadDashboardMetrics();
}

// METRIK & TRANSAKSI
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

// GANTI FUNGSI loadTransaksi (VERSI GABUNG TABEL)
async function loadTransaksi() {
    if (!activeBulanId) return;

    let totalPendapatan = 0;
    let totalPengeluaran = 0;

    // --- 1. LOAD PENDAPATAN (SEMUA JADI SATU) ---
    const resPendapatan = await fetch(`api/transaksi_crud.php?type=pendapatan`);
    const dataPendapatan = await resPendapatan.json();
    const tbodyPendapatan = document.getElementById('tabelPendapatan').querySelector('tbody');
    tbodyPendapatan.innerHTML = '';
    
    dataPendapatan.forEach(t => {
        totalPendapatan += parseFloat(t.total);
        
        // Cek apakah ini Pesanan (punya nama pelanggan) atau Manual
        // Kalau manual, kita kasih strip (-) biar rapi
        let namaPelangganDisplay = '-';
        let stylePelanggan = '';

        if (t.nama_pelanggan) {
            namaPelangganDisplay = t.nama_pelanggan;
            stylePelanggan = 'font-weight:bold; color:#2196F3;'; // Biru biar beda
        }

        tbodyPendapatan.innerHTML += `
            <tr>
                <td>${t.tanggal}</td>
                <td style="${stylePelanggan}">${namaPelangganDisplay}</td> <td>${t.keterangan}</td>
                <td>${t.jumlah}</td>
                <td>${formatRupiah(t.total)}</td>
                <td class="button-container">
                    <button class="btn btn-aksi btn-secondary" onclick="openEditModal(${t.id_pendapatan}, 'pendapatan')">Edit</button>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusTransaksi(${t.id_pendapatan}, 'pendapatan')">Hapus</button>
                </td>
            </tr>`;
    });

    // --- 2. LOAD PENGELUARAN (TETAP SAMA) ---
    const resPengeluaran = await fetch(`api/transaksi_crud.php?type=pengeluaran`);
    const dataPengeluaran = await resPengeluaran.json();
    const tbodyPengeluaran = document.getElementById('tabelPengeluaran').querySelector('tbody');
    tbodyPengeluaran.innerHTML = '';
    
    dataPengeluaran.forEach(t => {
        totalPengeluaran += parseFloat(t.total);
        tbodyPengeluaran.innerHTML += `
            <tr>
                <td>${t.tanggal}</td>
                <td>${t.keterangan}</td>
                <td>${t.jumlah}</td>
                <td>${formatRupiah(t.total)}</td>
                <td class="button-container">
                    <button class="btn btn-aksi btn-secondary" onclick="openEditModal(${t.id_pengeluaran}, 'pengeluaran')">Edit</button>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusTransaksi(${t.id_pengeluaran}, 'pengeluaran')">Hapus</button>
                </td>
            </tr>`;
    });

    // Update Footer
    document.getElementById('total-pendapatan-footer').textContent = formatRupiah(totalPendapatan);
    document.getElementById('total-pengeluaran-footer').textContent = formatRupiah(totalPengeluaran);
}

// FUNGSI 'TANGGAL' DAN 'HARGA' 
async function handleTambahTransaksi(e, type) {
    e.preventDefault();
    if (!activeBulanId) {
        alert('Silakan pilih bulan aktif terlebih dahulu di halaman "Kelola Bulan".');
        return;
    }
    const bulanMap = {
        "JANUARI": "01", "FEBRUARI": "02", "MARET": "03", "APRIL": "04", "MEI": "05", "JUNI": "06",
        "JULI": "07", "AGUSTUS": "08", "SEPTEMBER": "09", "OKTOBER": "10", "NOVEMBER": "11", "DESEMBER": "12"
    };
    const hari = document.getElementById(`${type}_tanggal`).value;
    const bulanAngka = bulanMap[activeBulanStr.toUpperCase()];
    const tahun = activeTahunStr;
    const tanggalLengkap = `${tahun}-${bulanAngka}-${String(hari).padStart(2, '0')}`;
    
    const data = {
        tanggal: tanggalLengkap,
        keterangan: document.getElementById(`${type}_keterangan`).value,
        jumlah: document.getElementById(`${type}_jumlah`).value,
        harga: document.getElementById(`${type}_harga`).value.replace(/\./g, ''), // <-- Hapus titik
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

// FUNGSI MODAL EDIT
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}


async function openEditModal(id, type) {
    const response = await fetch(`api/transaksi_crud.php?type=${type}&id=${id}`);
    const data = await response.json();

    const hari = new Date(data.tanggal).getDate();
    document.getElementById('edit_id_transaksi').value = id;
    document.getElementById('edit_tipe_transaksi').value = type;
    document.getElementById('edit_tanggal').value = hari;
    document.getElementById('edit_keterangan').value = data.keterangan;
    document.getElementById('edit_jumlah').value = data.jumlah;
    
    const hargaInput = document.getElementById('edit_harga');
    
    const hargaBersih = data.harga.split('.')[0]; 
    
    hargaInput.value = hargaBersih;
    
    formatInputRupiah(hargaInput); 

    document.getElementById('editModal').style.display = 'flex';
}

async function handleUpdateForm(e) {
    e.preventDefault();
    const id = document.getElementById('edit_id_transaksi').value;
    const type = document.getElementById('edit_tipe_transaksi').value;
    const hari = document.getElementById('edit_tanggal').value;
    
    const bulanMap = {
        "JANUARI": "01", "FEBRUARI": "02", "MARET": "03", "APRIL": "04", "MEI": "05", "JUNI": "06",
        "JULI": "07", "AGUSTUS": "08", "SEPTEMBER": "09", "OKTOBER": "10", "NOVEMBER": "11", "DESEMBER": "12"
    };
    const bulanAngka = bulanMap[activeBulanStr.toUpperCase()];
    const tahun = activeTahunStr;
    const tanggalLengkap = `${tahun}-${bulanAngka}-${String(hari).padStart(2, '0')}`;

    const data = {
        id_transaksi: id, 
        tanggal: tanggalLengkap,
        keterangan: document.getElementById('edit_keterangan').value,
        jumlah: document.getElementById('edit_jumlah').value,
        harga: document.getElementById('edit_harga').value.replace(/\./g, ''), 
    };

    await fetch(`api/transaksi_crud.php?type=${type}`, {
        method: 'POST', 
        body: JSON.stringify(data)
    });

    closeEditModal();
    loadTransaksi();
    loadDashboardMetrics();
}


// KELOLA PELANGGAN
async function loadPelanggan() {
    const response = await fetch('api/pelanggan_crud.php');
    const data = await response.json();
    const tbody = document.getElementById('tabelPelanggan').querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(p => {
        // Kita gunakan backtick (`) untuk string nama agar bisa lolos di 'onclick'
        const namaPelanggan = `\`${p.nama_pelanggan}\``;
        
        tbody.innerHTML += `
            <tr>
                <td>${p.nama_pelanggan}</td>
                <td>${p.nomor_hp}</td>
                <td class="button-container">
                    <button class="btn btn-aksi btn-secondary" onclick="openTrackRecordModal(${p.id_pelanggan}, ${namaPelanggan})">Pesanan</button>
                    <button class="btn btn-aksi" onclick="openEditPelangganModal(${p.id_pelanggan})">Edit</button>
                    <button class="btn-aksi btn-aksi-danger" onclick="handleHapusPelanggan(${p.id_pelanggan})">Hapus</button>
                </td>
            </tr>`;
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
    if (!confirm('Yakin ingin menghapus pelanggan ini?')) return;
    await fetch(`api/pelanggan_crud.php?id_pelanggan=${id}`, { method: 'DELETE' });
    loadPelanggan();
}

// FUNGSI EDIT PELANGGAN
function closeEditPelangganModal() {
    document.getElementById('editPelangganModal').style.display = 'none';
}

async function openEditPelangganModal(id) {
    const response = await fetch(`api/pelanggan_crud.php?id_pelanggan=${id}`);
    const data = await response.json();

    document.getElementById('edit_id_pelanggan').value = data.id_pelanggan;
    document.getElementById('edit_nama_pelanggan').value = data.nama_pelanggan;
    document.getElementById('edit_nomor_hp').value = data.nomor_hp;
    document.getElementById('editPelangganModal').style.display = 'flex';
}

async function handleUpdatePelanggan(e) {
    e.preventDefault();
    const data = {
        id_pelanggan: document.getElementById('edit_id_pelanggan').value,
        nama_pelanggan: document.getElementById('edit_nama_pelanggan').value,
        nomor_hp: document.getElementById('edit_nomor_hp').value,
    };
    await fetch('api/pelanggan_crud.php', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    closeEditPelangganModal();
    loadPelanggan();
}

// FUNGSI TRACK RECORD
function closeTrackRecordModal() {
    document.getElementById('trackRecordModal').style.display = 'none';
}

async function openTrackRecordModal(id, nama) {
    document.getElementById('trackRecordHeader').textContent = `Riwayat Pesanan : ${nama}`;
    const contentDiv = document.getElementById('trackRecordContent');
    contentDiv.innerHTML = '<p>Memuat data...</p>';
    document.getElementById('trackRecordModal').style.display = 'flex';

    const response = await fetch(`api/track_record.php?id_pelanggan=${id}`);
    const data = await response.json();

    if (data.length === 0) {
        contentDiv.innerHTML = '<p>Pelanggan ini belum memiliki riwayat pesanan.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Tanggal Pesan</th>
                    <th>Bulan/Tahun</th>
                    <th>Jenis Pesanan</th>
                    <th>Jumlah</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    let totalOmset = 0;
    data.forEach(p => {
        totalOmset += parseFloat(p.total);
        tableHTML += `
            <tr>
                <td>${p.tanggal}</td>
                <td>${p.nama_bulan} ${p.tahun}</td>
                <td>${p.jenis_pesanan}</td>
                <td>${p.jumlah}</td>
                <td>${formatRupiah(p.total)}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4"><strong>Total Omset dari Pelanggan ini</strong></td>
                    <td><strong>${formatRupiah(totalOmset)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
    contentDiv.innerHTML = tableHTML;
}

// KELOLA PESANAN
async function loadPelangganOptions() {
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
            </tr>`;
    });
}

async function handleTambahPesanan(e) {
    e.preventDefault();
    if (!activeBulanId) {
        alert('Silakan pilih bulan aktif terlebih dahulu.');
        return;
    }
    
    const select = document.getElementById('pesanan_pelanggan');
    const selectedOption = select.options[select.selectedIndex];
    
    const bulanMap = { "JANUARI": "01", "FEBRUARI": "02", "MARET": "03", "APRIL": "04", "MEI": "05", "JUNI": "06", "JULI": "07", "AGUSTUS": "08", "SEPTEMBER": "09", "OKTOBER": "10", "NOVEMBER": "11", "DESEMBER": "12" };
    const hari = document.getElementById('pesanan_tanggal').value;
    const bulanAngka = bulanMap[activeBulanStr.toUpperCase()];
    const tanggalLengkap = `${activeTahunStr}-${bulanAngka}-${String(hari).padStart(2, '0')}`;

    const data = {
        id_pelanggan: select.value,
        nama_pelanggan_text: selectedOption.text,
        tanggal: tanggalLengkap,
        jenis_pesanan: document.getElementById('pesanan_jenis').value,
        jumlah: document.getElementById('pesanan_jumlah').value,
        harga: document.getElementById('pesanan_harga').value.replace(/\./g, ''),
    };

    await fetch('api/pesanan_crud.php', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    e.target.reset();
    
    // REFRESH TABEL TRANSAKSI (Karena pesanan masuk ke situ sekarang)
    loadTransaksi(); 
    loadDashboardMetrics();
}

// EKSPOR
function handleExport(type) {
    if (!activeBulanId) {
        alert('Silakan pilih bulan aktif terlebih dahulu.');
        return;
    }
    window.open(`api/export.php?type=${type}`, '_blank');
}

window.handleHapusBulan = handleHapusBulan;
window.handleSetBulanAktif = handleSetBulanAktif;
window.handleHapusTransaksi = handleHapusTransaksi;
window.handleHapusPelanggan = handleHapusPelanggan;
window.openEditModal = openEditModal;
window.openEditPelangganModal = openEditPelangganModal;
window.openTrackRecordModal = openTrackRecordModal;