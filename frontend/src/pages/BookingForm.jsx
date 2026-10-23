import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function BookingForm() {
    const { studioId } = useParams();
    const navigate = useNavigate();

    const [studio, setStudio] = useState(null);
    const [loadingStudio, setLoadingStudio] = useState(true);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        booking_date: '',
        start_time: '10:00',
        end_time: '12:00'
    });

    const [loadingBooking, setLoadingBooking] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successData, setSuccessData] = useState(null);

    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    useEffect(() => {
        const fetchStudioDetail = async () => {
            try {
                const response = await API.get(`/studio/${studioId}`);
                setStudio(response.data);
                setLoadingStudio(false);
            } catch (err) {
                console.error('Gagal mengambil detail studio:', err);
                setErrorMessage('Studio tidak ditemukan.');
                setLoadingStudio(false);
            }
        };

        fetchStudioDetail();
    }, [studioId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingBooking(true);
        setErrorMessage(null);

        try {
            const payload = {
                studio_id: Number(studioId),
                ...formData
            };

            const response = await API.post('/booking', payload);
            setSuccessData(response.data.data);
            setLoadingBooking(false);
        } catch (err) {
            console.error('Gagal membuat booking:', err);
            setLoadingBooking(false);
            if (err.response && err.response.data) {
                setErrorMessage(err.response.data.error || err.response.data.message);
            } else {
                setErrorMessage('Terjadi kesalahan pada server. Coba lagi nanti.');
            }
        }
    };

    // Fungsi untuk mengarahkan ke WhatsApp Admin dengan format pesan otomatis
    const handleOpenWhatsApp = () => {
        if (!successData) return;

        // Nomor WhatsApp Admin (Ganti dengan nomor WhatsApp studio Anda, gunakan awalan 62)
        const adminPhone = '6289673309449';

        const message =
            `Halo Admin StudioFoto Manager, saya ingin mengkonfirmasi pesanan sewa studio saya:\n\n` +
            `*Kode Booking:* ${successData.booking_code}\n` +
            `*Nama Pemesan:* ${successData.customer_name}\n` +
            `*Studio:* ${successData.studio_name || studio.name}\n` +
            `*Tanggal:* ${successData.booking_date}\n` +
            `*Waktu:* ${successData.start_time} - ${successData.end_time} WIB\n` +
            `*Total Biaya:* Rp ${Number(successData.total_price).toLocaleString('id-ID')}\n\n` +
            `Mohon bantu verifikasi pembayaran saya. Terima kasih!`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');
    };

    if (loadingStudio) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">Memuat form booking...</p>
            </div>
        );
    }

    if (!studio) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
                <div className="bg-red-100 text-red-700 px-6 py-4 rounded-2xl shadow-md">
                    <p className="font-bold">Error</p>
                    <p>{errorMessage || 'Studio tidak ditemukan.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">

                {/* Header Info Studio */}
                <div className="bg-indigo-600 dark:bg-indigo-700 px-8 py-6 text-white">
                    <h1 className="text-2xl font-black">Booking: {studio.name}</h1>
                    <p className="text-indigo-200 text-sm mt-1">{studio.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm bg-indigo-700/60 dark:bg-indigo-800/60 px-4 py-2.5 rounded-2xl">
                        <span>Kapasitas: <strong>{studio.capacity} Orang</strong></span>
                        <span className="font-bold text-lg">Rp {Number(studio.price_per_hour).toLocaleString('id-ID')} / jam</span>
                    </div>
                </div>

                {/* Jika Booking Berhasil */}
                {successData ? (
                    <div className="p-8 text-center">
                        <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/50 dark:text-green-300 p-6 rounded-3xl mb-6">
                            <h2 className="text-2xl font-bold mb-2">🎉 Booking Berhasil Dibuat!</h2>
                            <p className="text-sm mb-4">Simpan kode booking Anda atau kirim konfirmasi langsung via WhatsApp.</p>

                            <div className="bg-white dark:bg-gray-800 py-3 px-6 rounded-2xl inline-block border border-green-300 dark:border-green-700 shadow-sm">
                                <span className="text-xs text-gray-400 block">KODE BOOKING (RESI)</span>
                                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">{successData.booking_code}</span>
                            </div>
                        </div>

                        <div className="text-left bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p><strong>Nama Pemesan:</strong> {successData.customer_name}</p>
                            <p><strong>Tanggal Sewa:</strong> {successData.booking_date}</p>
                            <p><strong>Jam:</strong> {successData.start_time} - {successData.end_time}</p>
                            <p><strong>Total Biaya:</strong> <span className="text-indigo-600 dark:text-indigo-400 font-bold">Rp {Number(successData.total_price).toLocaleString('id-ID')}</span></p>
                        </div>

                        {/* Tombol Aksi WhatsApp & Kembali */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleOpenWhatsApp}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-2xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                            >
                                💬 Kirim Konfirmasi via WhatsApp
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold px-6 py-3 rounded-2xl transition cursor-pointer"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form Input Booking */
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {errorMessage && (
                            <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-4 py-3 rounded-2xl text-sm">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    required
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    placeholder="Masukkan nama Anda"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="customer_email"
                                    required
                                    value={formData.customer_email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    placeholder="nama@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor WhatsApp / Telepon</label>
                            <input
                                type="text"
                                name="customer_phone"
                                required
                                value={formData.customer_phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                placeholder="081234567890"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Sewa</label>
                                <input
                                    type="date"
                                    name="booking_date"
                                    required
                                    value={formData.booking_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm dark:[color-scheme:dark]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Mulai</label>
                                <select
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm cursor-pointer"
                                >
                                    {timeSlots.map((time) => (
                                        <option key={time} value={time} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                                            {time} WIB
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Selesai</label>
                                <select
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm cursor-pointer"
                                >
                                    {timeSlots.map((time) => (
                                        <option key={time} value={time} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                                            {time} WIB
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm cursor-pointer"
                            >
                                ← Batal / Kembali
                            </button>

                            <button
                                type="submit"
                                disabled={loadingBooking}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-2xl transition shadow-md cursor-pointer disabled:bg-gray-400 text-sm"
                            >
                                {loadingBooking ? 'Memproses...' : 'Konfirmasi Booking'}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}