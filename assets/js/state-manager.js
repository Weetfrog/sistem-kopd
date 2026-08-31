/**
 * STATE MANAGER V2 - Sistem KOPD Manggarai Barat
 * Mengelola Autentikasi, Multi-OPD, dan Keamanan Sesi
 */

// 1. Fungsi untuk membuat 11 variabel kosong (Struktur Baru)
function generateInitialVariabel() {
    let vars = {};
    for (let i = 1; i <= 11; i++) {
        vars[`v${i}`] = {
            status: 0,
            levelPilihan: null,
            levelDisetujui: 0, // <--- TAMBAHAN BARU: Menyimpan skor permanen
            deskripsi: "",
            uploads: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, // Array untuk multi-file
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
        return { success: true, redirect: 'admin/index.html' };
    }

    // Cek OPD
    const opd = db.opds.find(o => o.username === username && o.password === password);
    if (opd) {
        if (opd.isLocked) return { success: false, message: 'Akun Anda dikunci oleh Super Admin.' };
        db.session = { role: 'opd', id: opd.id, name: opd.name };
        localStorage.setItem('kopd_db', JSON.stringify(db));
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

// 5. Pengecekan Sesi (Anti-Looping)
function checkSession(expectedRole, basePath = '../') {
    const rawData = localStorage.getItem('kopd_db');

    // Jika tidak ada data, tendang ke login dan hentikan eksekusi (return false)
    if (!rawData) {
        window.location.href = basePath + 'login.html';
        return false;
    }

    try {
        const db = JSON.parse(rawData);

        // Jika sesi kosong atau role salah, tendang ke login
        if (!db.session || db.session.role !== expectedRole) {
            window.location.href = basePath + 'login.html';
            return false;
        }

        return db.session; // Lolos verifikasi
    } catch (e) {
        // Jika JSON rusak, hapus dan paksa login
        localStorage.removeItem('kopd_db');
        window.location.href = basePath + 'login.html';
        return false;
    }
}

// 6. Ambil Data Instansi Saat Ini
function getCurrentOpdData() {
    const db = JSON.parse(localStorage.getItem('kopd_db'));
    return db.opds.find(o => o.id === db.session.id);
}

// Jalankan otomatis saat fail dipanggil
initLocalDB();