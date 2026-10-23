import Studio from '../model/studioModel.mjs';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Konfigurasi Multer untuk penyimpanan file gambar fisik
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), '../frontend/public/studio/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'studio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });

// 1. Ambil Semua Data Studio
export const getSemuaStudio = async (req, res) => {
    try {
        const studio = await Studio.getAll();
        res.status(200).json(studio);
    } catch (error) {
        console.error('Error fetching studio:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 2. Ambil Detail Studio Berdasarkan ID
export const getStudioById = async (req, res) => {
    try {
        const { id } = req.params;
        const studio = await Studio.getById(id);

        if (!studio) {
            return res.status(404).json({ message: `Studio dengan ID ${id} tidak ditemukan` });
        }

        res.status(200).json(studio);
    } catch (error) {
        console.error('Error fetching studio by id:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 3. Tambah Studio Baru (Create dengan File Upload)
export const tambahStudio = async (req, res) => {
    try {
        const { name, description, capacity, price_per_hour } = req.body;

        if (!name || !capacity || !price_per_hour) {
            return res.status(400).json({ message: 'Nama, kapasitas, dan harga per jam wajib diisi!' });
        }

        // Ambil nama file dari hasil upload multer, jika tidak ada gunakan default
        const image_url = req.file ? req.file.filename : 'default-studio.jpg';

        const newStudioId = await Studio.create({
            name,
            description: description || '',
            capacity,
            price_per_hour,
            image_url
        });

        res.status(201).json({
            message: 'Studio berhasil ditambahkan!',
            data: {
                id: newStudioId,
                name,
                capacity,
                price_per_hour,
                image_url
            }
        });
    } catch (error) {
        console.error('Error adding studio:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 4. Update Data Studio (Support Ganti Gambar)
export const updateStudio = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, capacity, price_per_hour, status } = req.body;

        const studioExist = await Studio.getById(id);
        if (!studioExist) {
            return res.status(404).json({ message: `Studio dengan ID ${id} tidak ditemukan` });
        }

        // Jika ada file baru yang di-upload, gunakan file baru. Jika tidak, tetap gunakan gambar lama.
        const image_url = req.file ? req.file.filename : studioExist.image_url;

        await Studio.update(id, {
            name: name || studioExist.name,
            description: description !== undefined ? description : studioExist.description,
            capacity: capacity || studioExist.capacity,
            price_per_hour: price_per_hour || studioExist.price_per_hour,
            image_url: image_url,
            status: status || studioExist.status
        });

        res.status(200).json({ message: 'Data studio berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updating studio:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 5. Hapus Studio (Delete)
export const hapusStudio = async (req, res) => {
    try {
        const { id } = req.params;

        const studioExist = await Studio.getById(id);
        if (!studioExist) {
            return res.status(404).json({ message: `Studio dengan ID ${id} tidak ditemukan` });
        }

        // Opsional: Hapus file fisik gambar dari folder public/studio
        if (studioExist.image_url && studioExist.image_url !== 'default-studio.jpg') {
            const filePath = path.join(process.cwd(), '../frontend/public/studio/', studioExist.image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Studio.delete(id);
        res.status(200).json({ message: `Studio dengan ID ${id} berhasil dihapus!` });
    } catch (error) {
        console.error('Error deleting studio:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// Filter Pencarian Studio
export const getStudios = async (req, res) => {
    try {
        const { search, capacity } = req.query;
        let query = 'SELECT * FROM studios WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (capacity) {
            query += ' AND capacity >= ?';
            params.push(Number(capacity));
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil data studio' });
    }
};