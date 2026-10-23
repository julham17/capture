import React, { useState } from 'react';
import API from '../services/api';

export default function TrackBooking() {
    const [bookingCode, setBookingCode] = useState('');
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!bookingCode.trim()) return;

        setLoading(true);
        setError(null);
        setBookingData(null);

        try {
            const response = await API.get(`/booking/track/${bookingCode.trim()}`);
            setBookingData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Gagal melacak booking:', err);
            setLoading(false);
            if (err.response && err.response.status === 404) {
                setError('Kode booking tidak ditemukan. Periksa kembali resi Anda.');
            } else {
                setError('Terjadi kesalahan pada server. Coba beberapa saat lagi.');
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">CONFIRMED (Dikonfirmasi)</span>;
            case 'canceled':
                return <span className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold">CANCELED (Dibatalkan)</span>;
            case 'completed':
                return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">COMPLETED (Selesai)</span>;
            default:
                return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold">PENDING (Menunggu)</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 sm:p-12 transition-colors duration-200">
            <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Lacak Status Pesanan
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Masukkan kode booking (resi) Anda untuk melihat status sewa studio secara real-time.
                </p>
            </div>

            {/* Form Input Lacak */}
            <form onSubmit={handleTrack} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 mb-8">
                <input
                    type="text"
                    required
                    placeholder="CONTOH: STO-123456"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    className="flex-1 px-4 py-3.5 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-bold tracking-wider text-sm"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition shadow-md cursor-pointer disabled:bg-gray-400"
                >
                    {loading ? 'Mencari...' : 'Cek Status'}
                </button>
            </form>

            {/* Pesan Error */}
            {error && (
                <div className="max-w-xl mx-auto bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-4 py-3 rounded-2xl text-sm mb-6 text-center">
                    {error}
                </div>
            )}

            {/* Hasil Data Pesanan */}
            {bookingData && (
                <div className="max-w-xl mx-auto bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div>
                            <span className="text-xs text-gray-400 block">KODE BOOKING</span>
                            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{bookingData.booking_code}</span>
                        </div>
                        <div>
                            {getStatusBadge(bookingData.payment_status)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                            <p className="text-gray-400 text-xs">Nama Pemesan</p>
                            <p className="font-semibold">{bookingData.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Studio Pilihan</p>
                            <p className="font-semibold">{bookingData.studio_name}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Tanggal Sewa</p>
                            <p className="font-semibold">{bookingData.booking_date.split('T')[0]}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Waktu</p>
                            <p className="font-semibold">{bookingData.start_time} - {bookingData.end_time} WIB</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Biaya:</span>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                            Rp {Number(bookingData.total_price).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}