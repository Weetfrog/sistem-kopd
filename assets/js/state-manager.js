/**
 * STATE MANAGER V2 - Sistem KOPD Manggarai Barat
 * Mengelola Autentikasi, Multi-OPD, dan Keamanan Sesi
 */

// 1. Fungsi untuk membuat 12 variabel kosong (1-11 Indikator Kematangan, 12 Link Google Drive)
function generateInitialVariabel() {
    let vars = {};
    for (let i = 1; i <= 12; i++) {
        vars[`v${i}`] = {
            status: 0,
            levelPilihan: i === 12 ? 1 : null,
            levelDisetujui: 0,
            deskripsi: "",
            driveLink: "", // Khusus tautan Google Drive
            uploads: {}, // Deprecated, tetap ada untuk kompatibilitas data lama
            catatanAdmin: ""
        };
    }
    return vars;
}

// 2. Inisialisasi & Auto-Healing Database Lokal
function initLocalDB() {
    const raw = localStorage.getItem('kopd_db');
    let shouldReset = false;

    if (raw) {
        try {
            const db = JSON.parse(raw);
            // CEK STRUKTUR: Jika tidak ada array 'opds' atau objek 'admin', reset!
            if (!db || typeof db !== 'object' || !Array.isArray(db.opds) || !db.admin) {
                shouldReset = true;
            } else {
                // Auto-healing & migrasi data: pastikan seluruh OPD memiliki variabel v1 sampai v12
                let updated = false;
                db.opds.forEach(opd => {
                    if (!opd.variabelStatus) {
                        opd.variabelStatus = generateInitialVariabel();
                        updated = true;
                    } else {
                        for (let i = 1; i <= 12; i++) {
                            if (!opd.variabelStatus[`v${i}`]) {
                                opd.variabelStatus[`v${i}`] = {
                                    status: 0,
                                    levelPilihan: i === 12 ? 1 : null,
                                    levelDisetujui: 0,
                                    deskripsi: "",
                                    driveLink: "",
                                    uploads: {},
                                    catatanAdmin: ""
                                };
                                updated = true;
                            }
                        }
                    }
                });
                if (updated) {
                    localStorage.setItem('kopd_db', JSON.stringify(db));
                    console.log("Sistem: Database lokal berhasil dimigrasikan ke 12 variabel.");
                }

                // Auto-healing: pastikan field tahunAktif ada
                if (!db.tahunAktif) {
                    db.tahunAktif = new Date().getFullYear().toString();
                    localStorage.setItem('kopd_db', JSON.stringify(db));
                    console.log("Sistem: Field tahunAktif ditambahkan.");
                }
            }
        } catch (e) {
            // Jika JSON korup/bukan JSON, reset!
            shouldReset = true;
        }
    } else {
        shouldReset = true; // Jika kosong, buat baru
    }

    if (shouldReset) {
        const db = {
            admin: { username: 'admin', password: '123', name: 'Super Admin Bagian Organisasi' },
            opds: [
                { id: 1, username: 'dinkes', password: '123', name: 'Dinas Kesehatan', isLocked: false, variabelStatus: generateInitialVariabel() },
                { id: 2, username: 'disdik', password: '123', name: 'Dinas Pendidikan, Kepemudaan dan Olahraga', isLocked: false, variabelStatus: generateInitialVariabel() }
            ],
            broadcastMessage: "",
            tahunAktif: new Date().getFullYear().toString(),
            session: null
        };
        localStorage.setItem('kopd_db', JSON.stringify(db));
        console.log("Sistem: Database direset ke struktur yang benar.");
    }
}

// 3. Autentikasi Login
function loginUser(username, password) {
    const db = JSON.parse(localStorage.getItem('kopd_db'));

    // Cek Admin
    if (username === db.admin.username && password === db.admin.password) {
        db.session = { role: 'admin', id: null, name: db.admin.name };
        localStorage.setItem('kopd_db', JSON.stringify(db));
        localStorage.setItem('kopd_last_user', username);
        return { success: true, redirect: 'admin/index.html' };
    }

    // Cek OPD
    const opd = db.opds.find(o => o.username === username && o.password === password);
    if (opd) {
        if (opd.isLocked) return { success: false, message: 'Akun Anda dikunci oleh Super Admin.' };
        db.session = { role: 'opd', id: opd.id, name: opd.name };
        localStorage.setItem('kopd_db', JSON.stringify(db));
        localStorage.setItem('kopd_last_user', username);
        return { success: true, redirect: 'opd/index.html' };
    }

    return { success: false, message: 'Username atau Password salah!' };
}

// 4. Proses Logout
function logoutUser() {
    const raw = localStorage.getItem('kopd_db');
    if (raw) {
        try {
            const db = JSON.parse(raw);
            db.session = null;
            localStorage.setItem('kopd_db', JSON.stringify(db));
        } catch (e) { }
    }
    sessionStorage.clear();
}

// 5. Pengecekan Sesi (Anti-Looping + Back-Button Protection)
function checkSession(expectedRole, basePath = '../') {
    // Cegah browser menampilkan halaman dari cache saat tombol Back ditekan
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) { window.location.reload(); }
    });

    const rawData = localStorage.getItem('kopd_db');

    // Jika tidak ada data, tendang ke login dan hentikan eksekusi (return false)
    if (!rawData) {
        window.location.replace(basePath + 'login.html');
        return false;
    }

    try {
        const db = JSON.parse(rawData);

        // Jika sesi kosong atau role salah, tendang ke login
        if (!db.session || db.session.role !== expectedRole) {
            window.location.replace(basePath + 'login.html');
            return false;
        }

        return db.session; // Lolos verifikasi
    } catch (e) {
        // Jika JSON rusak, hapus dan paksa login
        localStorage.removeItem('kopd_db');
        window.location.replace(basePath + 'login.html');
        return false;
    }
}

// 6. Ambil Data Instansi Saat Ini
function getCurrentOpdData() {
    const db = JSON.parse(localStorage.getItem('kopd_db'));
    return db.opds.find(o => o.id === db.session.id);
}

// 7. Ambil Tahun Aktif dari Database
function getTahunAktif() {
    try {
        const db = JSON.parse(localStorage.getItem('kopd_db'));
        return db.tahunAktif || new Date().getFullYear().toString();
    } catch (e) {
        return new Date().getFullYear().toString();
    }
}

// Jalankan otomatis saat fail dipanggil
initLocalDB();