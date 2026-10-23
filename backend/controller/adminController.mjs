import db from '../config/db.mjs';
import bcrypt from 'bcrypt';

export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validasi input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan Password wajib diisi!' });
        }

        // 2. Cari admin berdasarkan username
        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Username atau Password Admin salah!' });
        }

        const admin = rows[0];

        // 3. Bandingkan password terenkripsi (bcrypt)
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username atau Password Admin salah!' });
        }

        // 4. Berhasil Login
        res.json({
            message: 'Login berhasil!',
            admin: {
                id: admin.id,
                username: admin.username
            }
        });

    } catch (err) {
        console.error('Error saat login admin:', err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};