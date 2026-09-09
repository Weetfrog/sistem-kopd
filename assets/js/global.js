/**
 * Render Sidebar Dinamis
 * @param {string} basePath - path menuju root ('../' untuk admin/opd, './' jika di root)
 * @param {string} role - 'opd' atau 'admin' untuk menyesuaikan menu
 */
function renderSidebar(basePath, role = 'opd') {
    const sidebarContainer = document.getElementById('sidebar-container');
    if(!sidebarContainer) return;

    let menuHTML = '';
    if (role === 'opd') {
        menuHTML = `
            <li><a href="${basePath}opd/index.html"><i class="fa-solid fa-house"></i> Dashboard</a></li>
            <li><a href="${basePath}opd/matriks.html"><i class="fa-solid fa-table-cells-large"></i> Papan Matriks</a></li>
            <li><a href="${basePath}opd/laporan.html"><i class="fa-solid fa-print"></i> Laporan Akhir</a></li>
        `;
    } else if (role === 'admin') {
        menuHTML = `
            <li><a href="${basePath}admin/index.html"><i class="fa-solid fa-chart-pie"></i> Dasbor Global</a></li>
            <li><a href="${basePath}admin/verifikasi.html"><i class="fa-solid fa-clipboard-check"></i> Meja Verifikasi</a></li>
            <li><a href="${basePath}admin/kelola-opd.html"><i class="fa-solid fa-users-gear"></i> Kelola Akun OPD</a></li>
        `;
    }

    sidebarContainer.innerHTML = `
        <aside class="sidebar" style="width: 250px; background: var(--primary-green); color: white; padding: 20px;">
            <div class="logo">
                <h3 style="color: var(--water-yellow)">KOPD Mabar ${typeof getTahunAktif === 'function' ? getTahunAktif() : ''}</h3>
            </div>
            <ul style="list-style: none; margin-top: 30px;">
                ${menuHTML}
            </ul>
        </aside>
    `;
}

// Fungsi Trigger Animasi Air
function setWaterProgress(terisi, total) {
    const tube = document.getElementById('progress-tube');
    const textElement = document.getElementById('progress-text');
    if (tube && textElement) {
        let percentage = Math.min((terisi / total) * 100, 100);
        tube.style.setProperty('--water-height', `${percentage}%`);
        textElement.innerText = `${terisi} / ${total} Variabel`;
    }
}
