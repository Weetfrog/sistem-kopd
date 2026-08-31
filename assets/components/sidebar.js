/**
 * SIDEBAR MODULAR COMPONENT V2 - KOPD Mabar 2025
 * Fitur: Collapsible (Hamburger), Dropdown Pintasan 11 Var, & Live Red-Dot Notification
 */

function renderSidebar(basePath = '../', role = 'opd') {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    // 1. Ambil data untuk deteksi Notifikasi Titik Merah (Khusus OPD)
    let globalHasAlert = false;
    let varAlerts = Array(12).fill(false); // Index 1-11 untuk mencatat variabel mana yang revisi

    if (role === 'opd') {
        const db = JSON.parse(localStorage.getItem('kopd_db'));
        if (db && db.session && db.session.role === 'opd') {
            const currentOpd = db.opds.find(o => o.id === db.session.id);
            if (currentOpd) {
                for (let i = 1; i <= 11; i++) {
                    // Jika status = 2 (Butuh Revisi/Merah), nyalakan alert titik merah
                    if (currentOpd.variabelStatus[`v${i}`].status === 2) {
                        varAlerts[i] = true;
                        globalHasAlert = true; // Trigger titik merah di menu utama Papan Matriks
                    }
                }
            }
        }
    }

    // 2. Generate Item Menu sesuai Role
    let menuHTML = '';
    if (role === 'opd') {
        // Generate list pintasan 11 variabel untuk dropdown
        let dropdownItems = '';
        const daftarNamaVar = [
            "Perencanaan Pembangunan", "Monitoring & Pengendalian", "Penjaminan Mutu Layanan",
            "SOP Pelayanan", "Diklat Aparatur", "Analisis Kebijakan",
            "Manajemen Sumber Daya", "Manajemen Resiko", "Pengukuran Kinerja",
            "Pengembangan Inovasi", "Budaya Organisasi"
        ];

        daftarNamaVar.forEach((nama, index) => {
            const vId = index + 1;
            // Cek apakah variabel ini punya alert revisi
            const redDot = varAlerts[vId] ? '<span class="nav-red-dot"></span>' : '';
            dropdownItems += `
                <li>
                    <a href="${basePath}opd/detail.html?v=${vId}">
                        <span class="var-num">${vId}</span> ${nama} ${redDot}
                    </a>
                </li>
            `;
        });

        const mainMatrixDot = globalHasAlert ? '<span class="nav-red-dot main-dot"></span>' : '';

        menuHTML = `
            <li><a href="${basePath}opd/index.html"><i class="fa-solid fa-house"></i> <span>Dasbor Utama</span></a></li>
            <li class="has-dropdown">
                <a href="#" id="btn-matrix-dropdown" class="menu-trigger">
                    <i class="fa-solid fa-table-cells-large"></i> 
                    <span>Papan Matriks ${mainMatrixDot}</span>
                    <i class="fa-solid fa-chevron-down arrow-icon"></i>
                </a>
                <ul class="sidebar-dropdown-menu" id="matrix-dropdown">
                    <li><a href="${basePath}opd/matriks.html" style="font-weight: bold; background: rgba(255,255,255,0.05);"><i class="fa-solid fa-eye"></i> Lihat Semua Card</a></li>
                    ${dropdownItems}
                </ul>
            </li>
            <li><a href="${basePath}opd/laporan.html"><i class="fa-solid fa-print"></i> <span>Laporan Akhir</span></a></li>
        `;
        //blok if (role === 'admin')
    } else if (role === 'admin') {
        menuHTML = `
            <li><a href="${basePath}admin/index.html"><i class="fa-solid fa-chart-pie"></i> <span>Dasbor Global</span></a></li>
            <li><a href="${basePath}admin/verifikasi.html"><i class="fa-solid fa-clipboard-check"></i> <span>Meja Verifikasi</span></a></li>
            <li><a href="${basePath}admin/kelola-opd.html"><i class="fa-solid fa-users-gear"></i> <span>Kelola Akun OPD</span></a></li>
            <li><a href="${basePath}admin/laporan-global.html"><i class="fa-solid fa-globe"></i> <span>Laporan Keseluruhan</span></a></li>
        `;
    }

    // 3. Gabungkan struktur HTML (Termasuk Tombol Hamburger Terpisah)
    container.innerHTML = `
        <button class="hamburger-toggle" id="hamburger-btn">
            <i class="fa-solid fa-bars"></i>
        </button>

        <aside class="sidebar-wrapper" id="main-sidebar">
            <div class="sidebar-header">
                <h2 class="logo-text">KOPD Mabar</h2>
                <p class="logo-sub">Tahun 2025</p>
            </div>
            <ul class="sidebar-menu">
                ${menuHTML}
            </ul>
            <div class="sidebar-footer">
                <a href="#" id="logout-link">
                    <i class="fa-solid fa-right-from-bracket"></i> <span>Keluar</span>
                </a>
            </div>
        </aside>

        <style>
            :root {
                --sb-width: 260px;
            }
            
            /* Tombol Hamburger */
            .hamburger-toggle {
                position: fixed; top: 15px; left: 15px;
                width: 40px; height: 40px; background: var(--primary-green);
                color: var(--water-yellow); border: none; border-radius: 8px;
                font-size: 1.2rem; cursor: pointer; z-index: 999;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.3s;
            }
            .hamburger-toggle:hover { background: var(--secondary-green); }

            /* Wrapper Sidebar */
            .sidebar-wrapper {
                width: var(--sb-width); background: var(--primary-green); color: white;
                height: 100vh; position: sticky; top: 0; left: 0;
                display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 990; box-shadow: 4px 0 10px rgba(0,0,0,0.05);
            }
            
            /* Header & Footer */
            .sidebar-header { padding: 24px; padding-left: 70px; border-bottom: 1px solid rgba(255,255,255,0.08); }
            .logo-text { color: var(--water-yellow); font-size: 1.3rem; margin: 0; font-weight: 700; transition: 0.2s; }
            .logo-sub { font-size: 0.8rem; color: var(--sage-bg); margin-top: 2px; }
            .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.08); }
            
            /* Menu Styling */
            .sidebar-menu { list-style: none; padding: 15px 0; margin: 0; flex: 1; overflow-y: auto; }
            .sidebar-menu::-webkit-scrollbar { width: 5px; }
            .sidebar-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            
            .sidebar-menu li a, .sidebar-menu li .menu-trigger {
                display: flex; align-items: center; gap: 14px; padding: 12px 24px;
                color: #e5e7eb; text-decoration: none; font-weight: 500; cursor: pointer;
                transition: 0.2s; position: relative; border-right: 4px solid transparent;
            }
            .sidebar-menu li a:hover, .sidebar-menu li .menu-trigger:hover {
                background: var(--secondary-green); color: white; border-right-color: var(--water-yellow);
            }
            .sidebar-menu li a i, .sidebar-menu li .menu-trigger i { font-size: 1.1rem; width: 20px; text-align: center; }
            
            /* Dropdown Arrow Animation */
            .arrow-icon { margin-left: auto; font-size: 0.8rem !important; transition: transform 0.3s; }
            .has-dropdown.active .arrow-icon { transform: rotate(180deg); }

            /* Sub-Menu Dropdown (Accordion style) */
            .sidebar-dropdown-menu {
                list-style: none; padding: 0; margin: 0; background: rgba(0, 0, 0, 0.15);
                max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out;
            }
            .has-dropdown.active .sidebar-dropdown-menu { max-height: 400px; overflow-y: auto; }
            .sidebar-dropdown-menu li a { padding: 8px 24px 8px 45px; font-size: 0.85rem; border-right: none; }
            .var-num {
                background: rgba(255,255,255,0.1); font-size: 0.75rem; font-weight: bold;
                width: 18px; height: 18px; display: inline-flex; align-items: center;
                justify-content: center; border-radius: 4px; color: var(--water-yellow);
            }

            /* Efek saat Sidebar Ditutup (COLLAPSED STATE) */
            body.sidebar-collapsed .sidebar-wrapper { width: 0px; overflow: hidden; }
            body.sidebar-collapsed .hamburger-toggle { left: 15px; }
            
            /* Tombol Keluar */
            #logout-link { color: #fca5a5; text-decoration: none; display: flex; align-items: center; gap: 10px; font-weight: 500; padding: 10px; border-radius: 6px; }
            #logout-link:hover { background: #991b1b; color: white; }

            /* NOTIFIKASI TITIK MERAH (RED DOT) */
            .nav-red-dot {
                width: 8px; height: 8px; background-color: #991b1b;
                border-radius: 50%; display: inline-block;
                animation: pulse-red 1.5s infinite;
            }
            .nav-red-dot.main-dot { position: absolute; left: 35px; top: 12px; border: 2px solid var(--primary-green); }
            @keyframes pulse-red {
                0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(153, 27, 27, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(153, 27, 27, 0); }
                100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(153, 27, 27, 0); }
            }

            /* Penyesuaian area cetak laporan agar tombol hamburger hilang otomatis */
            @media print { .hamburger-toggle { display: none !important; } }
        </style>
    `;

    // 4. DAFTARKAN EVENT LISTENERS (LOGIKA JAVASCRIPT SIDEBAR)

    // Logika Hamburger Buka-Tutup
    const hamburgerBtn = document.getElementById('hamburger-btn');
    hamburgerBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });

    // Logika Accordion Dropdown Papan Matriks
    if (role === 'opd') {
        const trigger = document.getElementById('btn-matrix-dropdown');
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            trigger.parentElement.classList.toggle('active');
        });
    }

    // Logika Logout Otentik
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
            logoutUser(); // Fungsi dari state-manager.js
            window.location.href = basePath + 'login.html';
        }
    });
}