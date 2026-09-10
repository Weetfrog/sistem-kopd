/**
 * STATE MANAGER V3 - Firebase Firestore Integration
 * Mengelola Autentikasi, Multi-OPD, dan Keamanan Sesi di Cloud
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, writeBatch, deleteDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Konfigurasi Firebase dari User
const firebaseConfig = {
    apiKey: "AIzaSyA7to6QJroKFZZVchsbkeWZ8RSF4u-mg4E",
    authDomain: "sistem-kopd-359d7.firebaseapp.com",
    projectId: "sistem-kopd-359d7",
    storageBucket: "sistem-kopd-359d7.firebasestorage.app",
    messagingSenderId: "992627198139",
    appId: "1:992627198139:web:bd2923e4b737d1bdb5419e"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Fungsi Cetak 12 Variabel Kosong
function generateInitialVariabel() {
    let vars = {};
    for (let i = 1; i <= 12; i++) {
        vars[`v${i}`] = {
            status: 0,
            levelPilihan: i === 12 ? 1 : null,
            levelDisetujui: 0,
            deskripsi: "",
            driveLink: "",
            uploads: {},
            catatanAdmin: ""
        };
    }
    return vars;
}

// 2. Seeding Awal Database (Berjalan Otomatis jika kosong)
async function initFirebaseSeed() {
    try {
        const settingsRef = doc(db, "settings", "main");
        const snap = await getDoc(settingsRef);
        
        if (!snap.exists()) {
            console.log("Sistem: Database Firestore kosong, melakukan seeding...");
            await setDoc(settingsRef, {
                broadcastMessage: "",
                tahunAktif: new Date().getFullYear().toString(),
                adminUsername: "admin",
                adminPassword: "123",
                adminName: "Super Admin Bagian Organisasi"
            });

            // Seed 2 OPD bawaan
            const opd1Ref = doc(collection(db, "opds"));
            await setDoc(opd1Ref, {
                id: 1, username: 'dinkes', password: '123', name: 'Dinas Kesehatan', isLocked: false, variabelStatus: generateInitialVariabel()
            });

            const opd2Ref = doc(collection(db, "opds"));
            await setDoc(opd2Ref, {
                id: 2, username: 'disdik', password: '123', name: 'Dinas Pendidikan, Kepemudaan dan Olahraga', isLocked: false, variabelStatus: generateInitialVariabel()
            });
            console.log("Sistem: Seeding selesai.");
        }
    } catch (e) {
        console.error("Gagal inisialisasi Firestore:", e);
    }
}

// 3. Autentikasi Login (Async)
async function loginUser(username, password) {
    try {
        // Cek Admin
        const settingsSnap = await getDoc(doc(db, "settings", "main"));
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            if (username === data.adminUsername && password === data.adminPassword) {
                sessionStorage.setItem('kopd_session', JSON.stringify({ role: 'admin', id: null, name: data.adminName }));
                localStorage.setItem('kopd_last_user', username);
                return { success: true, redirect: 'admin/index.html' };
            }
        }

        // Cek OPD
        const querySnapshot = await getDocs(collection(db, "opds"));
        let foundOpd = null;
        querySnapshot.forEach((docSnap) => {
            const o = docSnap.data();
            if (o.username === username && o.password === password) {
                foundOpd = { docId: docSnap.id, ...o };
            }
        });

        if (foundOpd) {
            if (foundOpd.isLocked) return { success: false, message: 'Akun Anda dikunci oleh Super Admin.' };
            sessionStorage.setItem('kopd_session', JSON.stringify({ 
                role: 'opd', 
                id: foundOpd.id, // ID logis
                docId: foundOpd.docId, // ID Firestore
                name: foundOpd.name 
            }));
            localStorage.setItem('kopd_last_user', username);
            return { success: true, redirect: 'opd/index.html' };
        }

        return { success: false, message: 'Username atau Password salah!' };
    } catch (e) {
        console.error("Login error", e);
        return { success: false, message: 'Koneksi ke server gagal. Periksa koneksi internet.' };
    }
}

// 4. Proses Logout
function logoutUser() {
    sessionStorage.removeItem('kopd_session');
}

// 5. Pengecekan Sesi (Sinkron - baca sessionStorage saja)
function checkSession(expectedRole, basePath = '../') {
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) { window.location.reload(); }
    });

    const rawData = sessionStorage.getItem('kopd_session');
    if (!rawData) {
        window.location.replace(basePath + 'login.html');
        return false;
    }

    try {
        const session = JSON.parse(rawData);
        if (session.role !== expectedRole) {
            sessionStorage.removeItem('kopd_session');
            window.location.replace(basePath + 'login.html');
            return false;
        }
        if (session.role === 'opd' && !session.docId) {
            sessionStorage.removeItem('kopd_session');
            window.location.replace(basePath + 'login.html');
            return false;
        }
        return session;
    } catch (e) {
        sessionStorage.removeItem('kopd_session');
        window.location.replace(basePath + 'login.html');
        return false;
    }
}

// 6. Ambil Data Instansi Saat Ini (Async)
async function getCurrentOpdData() {
    const raw = sessionStorage.getItem('kopd_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.role !== 'opd' || !session.docId) return null;

    try {
        const snap = await getDoc(doc(db, "opds", session.docId));
        return snap.exists() ? { docId: snap.id, ...snap.data() } : null;
    } catch (e) {
        console.error("Gagal memuat data OPD", e);
        return null;
    }
}

// 7. Ambil Tahun Aktif (Async)
async function getTahunAktif() {
    try {
        const snap = await getDoc(doc(db, "settings", "main"));
        if (snap.exists() && snap.data().tahunAktif) {
            return snap.data().tahunAktif;
        }
    } catch (e) {
        console.error("Gagal mengambil tahun", e);
    }
    return new Date().getFullYear().toString();
}

// 8. Ambil Pengaturan Umum (Async)
async function getSettings() {
    try {
        const snap = await getDoc(doc(db, "settings", "main"));
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        console.error("Gagal mengambil settings", e);
        return null;
    }
}

// --- Eksport API Global (Untuk Skrip HTML Lama) ---
window.generateInitialVariabel = generateInitialVariabel;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.checkSession = checkSession;
window.getCurrentOpdData = getCurrentOpdData;
window.getTahunAktif = getTahunAktif;
window.getSettings = getSettings;

// Eksport Utility Firebase untuk Admin / Fungsi Khusus
window.db = db;
window.fbCollection = collection;
window.fbGetDocs = getDocs;
window.fbGetDoc = getDoc;
window.fbDoc = doc;
window.fbSetDoc = setDoc;
window.fbUpdateDoc = updateDoc;
window.fbDeleteDoc = deleteDoc;
window.fbWriteBatch = writeBatch;

// Jalankan Seeding Otomatis
initFirebaseSeed();