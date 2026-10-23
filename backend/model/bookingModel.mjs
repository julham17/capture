import db from '../config/db.mjs';

const Booking = {
    // 1. Cek bentrok jadwal untuk mencegah double-booking
    checkConflict: async (studioId, bookingDate, startTime, endTime) => {
        const [rows] = await db.query(
            `SELECT * FROM bookings 
             WHERE studio_id = ? 
             AND booking_date = ? 
             AND payment_status != 'canceled' 
             AND (start_time < ? AND end_time > ?)`,
            [studioId, bookingDate, endTime, startTime]
        );
        return rows;
    },

    // 2. Membuat booking baru
    create: async (data) => {
        const {
            booking_code,
            studio_id,
            customer_name,
            customer_email,
            customer_phone,
            booking_date,
            start_time,
            end_time,
            total_price
        } = data;

        const [result] = await db.query(
            `INSERT INTO bookings (booking_code, studio_id, customer_name, customer_email, customer_phone, booking_date, start_time, end_time, total_price, payment_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [booking_code, studio_id, customer_name, customer_email, customer_phone, booking_date, start_time, end_time, total_price]
        );
        return result.insertId;
    },

    // 3. Mencari booking berdasarkan kode unik (Sistem Pelacakan Resi)
    getByCode: async (bookingCode) => {
        const [rows] = await db.query(
            `SELECT b.*, s.name as studio_name, s.price_per_hour 
             FROM bookings b 
             JOIN studios s ON b.studio_id = s.id 
             WHERE b.booking_code = ?`,
            [bookingCode]
        );
        return rows[0];
    },

    // 4. Mengambil semua data booking (Untuk panel Admin)
    getAll: async () => {
        const [rows] = await db.query(
            `SELECT b.*, s.name as studio_name 
             FROM bookings b 
             JOIN studios s ON b.studio_id = s.id 
             ORDER BY b.created_at DESC`
        );
        return rows;
    },

    // 5. Update status pembayaran / verifikasi oleh admin
    updateStatus: async (id, paymentStatus) => {
        const [result] = await db.query(
            `UPDATE bookings SET payment_status = ? WHERE id = ?`,
            [paymentStatus, id]
        );
        return result.affectedRows;
    }
};

export default Booking;