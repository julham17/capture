import db from './config/db.mjs';
import bcrypt from 'bcrypt';

async function seed() {
    try {
        const username = 'admin';
        const rawPassword = 'admin1';

        // Generate Hash
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Hapus admin 'admin' lama jika ada
        await db.query('DELETE FROM admins WHERE username = ?', [username]);

        // Insert admin baru
        await db.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);

        console.log('----------------------------------------------------');
        console.log('✅ Akun Admin Berhasil Dibuat Ulang!');
        console.log(`Username : ${username}`);
        console.log(`Password : ${rawPassword}`);
        console.log('----------------------------------------------------');
        process.exit();
    } catch (err) {
        console.error('❌ Error Seeding Admin:', err);
        process.exit(1);
    }
}

seed();