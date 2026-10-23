import Booking from '../model/bookingModel.mjs';
import Studio from '../model/studioModel.mjs';

// 1. Membuat Booking Baru (Guest Checkout dengan Validasi Double-Booking)
export const buatBooking = async (req, res) => {
    try {
        const { studio_id, customer_name, customer_email, customer_phone, booking_date, start_time, end_time } = req.body;

        // Validasi input wajib
        if (!studio_id || !customer_name || !customer_email || !booking_date || !start_time || !end_time) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi dengan lengkap!' });
        }

        // Cek apakah studio ada dan aktif
        const studio = await Studio.getById(studio_id);
        if (!studio || studio.status !== 'active') {
            return res.status(404).json({ message: 'Studio tidak ditemukan atau sedang dalam pemeliharaan.' });
        }

        // Cek Bentrok Jadwal (Double-Booking Prevention)
        const konflikJadwal = await Booking.checkConflict(studio_id, booking_date, start_time, end_time);
        if (konflikJadwal.length > 0) {
            return res.status(400).json({
                error: 'Maaf, slot jam pada tanggal tersebut sudah dibooking oleh orang lain. Silakan pilih jam lain.'
            });
        }

        // Hitung total harga otomatis (Durasi Jam * Harga per Jam)
        const startHour = parseInt(start_time.split(':')[0]);
        const endHour = parseInt(end_time.split(':')[0]);
        const duration = endHour - startHour;

        if (duration <= 0) {
            return res.status(400).json({ message: 'Jam selesai harus lebih besar dari jam mulai!' });
        }

        const total_price = duration * studio.price_per_hour;

        // Generate Kode Booking Unik (Resi)
        const booking_code = `STO-${Date.now().toString().slice(-6)}`;

        // Simpan ke database
        const bookingId = await Booking.create({
            booking_code,
            studio_id,
            customer_name,
            customer_email,
            customer_phone,
            booking_date,
            start_time,
            end_time,
            total_price
        });

        res.status(201).json({
            message: 'Booking berhasil dibuat! Silakan lakukan pembayaran dan simpan kode booking Anda.',
            data: {
                id: bookingId,
                booking_code,
                customer_name,
                studio_name: studio.name,
                booking_date,
                start_time,
                end_time,
                total_price,
                payment_status: 'pending'
            }
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 2. Melacak Status Pesanan Berdasarkan Kode Booking (Sistem Resi)
export const lacakBooking = async (req, res) => {
    try {
        const { kode } = req.params;
        const booking = await Booking.getByCode(kode);

        if (!booking) {
            return res.status(404).json({ message: `Pesanan dengan kode ${kode} tidak ditemukan.` });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error tracking booking:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 3. Mengambil Semua Daftar Booking (Untuk Admin)
export const getSemuaBooking = async (req, res) => {
    try {
        const bookings = await Booking.getAll();
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 4. Update Status Pembayaran / Verifikasi oleh Admin
export const updateStatusPembayaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body; // pending, confirmed, canceled, completed

        const validStatuses = ['pending', 'confirmed', 'canceled', 'completed'];
        if (!validStatuses.includes(payment_status)) {
            return res.status(400).json({ message: 'Status pembayaran tidak valid!' });
        }

        const affectedRows = await Booking.updateStatus(id, payment_status);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Data booking tidak ditemukan.' });
        }

        res.status(200).json({ message: `Status pembayaran berhasil diubah menjadi ${payment_status}!` });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

export const getStudioSchedule = async (req, res) => {
    try {
        const { studioId } = req.params;
        const { date } = req.query;

        console.log("Menerima request jadwal untuk Studio ID:", studioId, "Tanggal:", date);

        if (!date) {
            return res.status(400).json({ message: 'Parameter tanggal wajib diisi!' });
        }

        const query = `
            SELECT start_time, end_time, payment_status
            FROM bookings
            WHERE studio_id = ? AND booking_date = ? AND payment_status != 'canceled'
        `;
        const [rows] = await db.query(query, [studioId, date]);

        console.log("Data booking ditemukan di DB:", rows); // Cek terminal backend Anda saat tanggal dipilih!

        const formattedRows = rows.map(item => ({
            start_time: typeof item.start_time === 'string' ? item.start_time.slice(0, 5) : item.start_time,
            end_time: typeof item.end_time === 'string' ? item.end_time.slice(0, 5) : item.end_time,
            payment_status: item.payment_status
        }));

        res.status(200).json(formattedRows);
    } catch (error) {
        console.error('Error fetching studio schedule:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};