// /assets/components/sidebar.js

function renderSidebar(basePath, role) {
    const sidebarContainer = document.getElementById('sidebar-container');
    let menuHTML = '';

    if (role === 'admin') {
        menuHTML = `
            <li><a href="${basePath}admin/index.html"><i class="fa-solid fa-chart-pie"></i> <span>Dasbor Global</span></a></li>
            <li><a href="${basePath}admin/verifikasi.html"><i class="fa-solid fa-clipboard-check"></i> <span>Meja Verifikasi</span></a></li>
            <li><a href="${basePath}admin/kelola-opd.html"><i class="fa-solid fa-users-gear"></i> <span>Kelola Akun OPD</span></a></li>
            <li><a href="${basePath}admin/laporan-global.html"><i class="fa-solid fa-globe"></i> <span>Laporan Keseluruhan</span></a></li>
        `;
    } else if (role === 'opd') {
        menuHTML = `
            <li><a href="${basePath}opd/index.html"><i class="fa-solid fa-house"></i> <span>Beranda</span></a></li>
            <li><a href="${basePath}opd/matriks.html"><i class="fa-solid fa-table-cells"></i> <span>Matriks Kematangan</span></a></li>
            <li><a href="${basePath}opd/laporan.html"><i class="fa-solid fa-file-pdf"></i> <span>Unggah Laporan Final</span></a></li>
        `;
    }

    sidebarContainer.innerHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <h3>KOPD MABAR</h3>
                <button id="toggle-sidebar"><i class="fa-solid fa-bars"></i></button>
            </div>
            <ul class="sidebar-menu">
                ${menuHTML}
                <li style="margin-top:auto;"><a href="#" onclick="logout('${basePath}')"><i class="fa-solid fa-right-from-bracket"></i> <span>Logout</span></a></li>
            </ul>
        </div>
    `;

    // Logika tombol hamburger
    document.getElementById('toggle-sidebar').addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });
}

function logout(basePath) {
    sessionStorage.clear();
    window.location.href = basePath + 'index.html';
}