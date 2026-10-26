import Booking from '../model/bookingModel.mjs';
import Studio from '../model/studioModel.mjs';

// Helper: converts "HH:MM" string to total minutes
const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

// 1. Membuat Booking Baru (Guest Checkout dengan Validasi Double-Booking)
export const buatBooking = async (req, res) => {
    try {
        const {
            studio_id,
            customer_name,
            customer_email,
            customer_phone,
            booking_date,
            start_time,
            end_time
        } = req.body;

        // FIX [M4]: Added customer_phone to required-field validation
        if (!studio_id || !customer_name || !customer_email || !customer_phone || !booking_date || !start_time || !end_time) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi dengan lengkap!' });
        }

        // Cek apakah studio ada dan aktif
        const studio = await Studio.getById(studio_id);
        if (!studio || studio.status !== 'active') {
            return res.status(404).json({ message: 'Studio tidak ditemukan atau sedang dalam pemeliharaan.' });
        }

        // Validasi waktu reservasi minimal 3 jam dari sekarang & tidak boleh waktu lampau
        const bookingDateTime = new Date(`${booking_date}T${start_time}:00`);
        const now = new Date();
        const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffHours < 3) {
            return res.status(400).json({
                error: 'Reservasi studio hanya dapat dilakukan minimal 3 jam sebelum jam sesi dimulai.'
            });
        }

        // Cek Bentrok Jadwal (Double-Booking Prevention)
        const konflikJadwal = await Booking.checkConflict(studio_id, booking_date, start_time, end_time);
        if (konflikJadwal.length > 0) {
            return res.status(400).json({
                error: 'Maaf, slot jam pada tanggal tersebut sudah dibooking oleh orang lain. Silakan pilih jam lain.'
            });
        }

        // FIX [M3]: Calculate duration in minutes for accuracy — handles non-whole-hour edge cases
        const durationMinutes = toMinutes(end_time) - toMinutes(start_time);

        if (durationMinutes <= 0) {
            return res.status(400).json({ message: 'Jam selesai harus lebih besar dari jam mulai!' });
        }

        const durationHours = durationMinutes / 60;
        const total_price = durationHours * studio.price_per_hour;

        // FIX [M5]: More collision-resistant booking code using full timestamp + random suffix
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const booking_code = `STO-${Date.now()}-${randomSuffix}`;

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

// 5. Mengambil Jadwal Studio (Slot yang Sudah Terpesan) pada Tanggal Tertentu
export const getStudioSchedule = async (req, res) => {
    try {
        const { studioId } = req.params;
        const { date } = req.query;

        // FIX [Mi4]: Validate studioId is a positive integer
        const studioIdNum = parseInt(studioId, 10);
        if (isNaN(studioIdNum) || studioIdNum <= 0) {
            return res.status(400).json({ message: 'Studio ID tidak valid.' });
        }

        if (!date) {
            return res.status(400).json({ message: 'Parameter tanggal wajib diisi!' });
        }

        console.log("Menerima request jadwal untuk Studio ID:", studioIdNum, "Tanggal:", date);

        // FIX [C3]: Removed raw db.query (db was never imported here).
        // Query moved into bookingModel.mjs as Booking.getSchedule()
        const rows = await Booking.getSchedule(studioIdNum, date);

        console.log("Data booking ditemukan di DB:", rows);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching studio schedule:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
