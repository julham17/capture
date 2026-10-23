import bcrypt from 'bcrypt';
import db from './config/db.mjs'; // Sesuaikan path file koneksi database Anda

async function createAdmin() {
    try {
        const username = 'admin';
        const rawPassword = 'admin2'; // Password teks biasa yang ingin Anda gunakan

        // Enkripsi password menggunakan bcrypt
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Masukkan atau perbarui data admin di database
        // (Menggunakan ON DUPLICATE KEY UPDATE agar jika username sudah ada, password-nya langsung di-update)
        const query = `
            INSERT INTO admins (username, password) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE password = ?
        `;

        await db.query(query, [username, hashedPassword, hashedPassword]);

        console.log('✅ Sukses! Akun admin berhasil dibuat/diperbarui.');
        console.log('Username: admin');
        console.log('Password: admin1');
        process.exit();
    } catch (err) {
        console.error('❌ Gagal membuat admin:', err);
        process.exit(1);
    }
}

createAdmin();