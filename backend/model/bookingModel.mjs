import db from '../config/db.mjs';

const Booking = {
    // 1. Cek bentrok jadwal untuk mencegah double-booking
    checkConflict: async (studioId, bookingDate, startTime, endTime) => {
        const [rows] = await db.query(
            `SELECT * FROM bookings 
             WHERE studio_id = ? 
             AND booking_date = ? 
             AND (payment_status IS NULL OR payment_status != 'canceled')
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
    },

    // FIX [C3]: Moved getSchedule query from controller into model.
    // The controller was using `db` directly without importing it — ReferenceError at runtime.
    // Formatting (slice to HH:MM) is also done here to keep controller lean.
    //
    // NOTE [Mi5]: For production, add a DB-level constraint to prevent TOCTOU double-booking:
    //   ALTER TABLE bookings ADD UNIQUE KEY uq_studio_booking (studio_id, booking_date, start_time);
    getSchedule: async (studioId, date) => {
        const [rows] = await db.query(
            `SELECT start_time, end_time, payment_status
             FROM bookings
             WHERE studio_id = ? AND booking_date = ?
               AND (payment_status IS NULL OR payment_status != 'canceled')`,
            [studioId, date]
        );

        return rows.map((item) => ({
            start_time: typeof item.start_time === 'string'
                ? item.start_time.slice(0, 5)
                : item.start_time,
            end_time: typeof item.end_time === 'string'
                ? item.end_time.slice(0, 5)
                : item.end_time,
            payment_status: item.payment_status,
        }));
    },
};

export default Booking;
