import db from '../config/db.mjs'

const Studio = {
    // Mengambil semua data studio yang aktif
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM studios');
        return rows;
    },

    // Mencari studio berdasarkan ID
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM studios WHERE id = ?', [id]);
        return rows[0];
    },

    // Menambah studio baru (untuk keperluan admin)
    create: async (data) => {
        const { name, description, capacity, price_per_hour, image_url } = data;
        const [result] = await db.query(
            'INSERT INTO studios (name, description, capacity, price_per_hour, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, description, capacity, price_per_hour, image_url]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { name, description, capacity, price_per_hour, image_url, status } = data;
        const [result] = await db.query(
            'UPDATE studios SET name = ?, description = ?, capacity = ?, price_per_hour = ?, image_url = ?, status = ? WHERE id = ?',
            [name, description, capacity, price_per_hour, image_url, status, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM studios WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default Studio;