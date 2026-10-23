import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import TrackBookingSection from '../components/TrackBooking';

export default function Home() {
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);

    // State untuk Pencarian & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [minCapacity, setMinCapacity] = useState('');

    const navigate = useNavigate();

    // Fetch seluruh data studio sekali saat pertama kali dimuat
    useEffect(() => {
        const fetchStudios = async () => {
            try {
                setLoading(true);
                const response = await API.get('/studio');
                setStudios(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching studios:', err);
                setLoading(false);
            }
        };

        fetchStudios();
    }, []);

    // Filter langsung di frontend (Real-Time Client-Side Filtering)
    const filteredStudios = studios.filter((studio) => {
        const matchesSearch =
            studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (studio.description && studio.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCapacity = minCapacity
            ? studio.capacity >= Number(minCapacity)
            : true;

        return matchesSearch && matchesCapacity;
    });

    return (
        <div className="space-y-20 pb-16">

            {/* Hero Section */}
            <section id="hero" className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-gray-900 text-white py-24 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                        Sewa Studio Foto Impianmu Secara Instan
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
                        Proses booking cepat, transparan, tanpa antre. Cek ketersediaan jadwal secara real-time.
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                        <a
                            href="#katalog"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5"
                        >
                            Pilih Studio Sekarang
                        </a>
                    </div>
                </div>
            </section>

            {/* Katalog Studio Section */}
            <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Pilihan Ruangan Studio
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Temukan studio dengan fasilitas terbaik sesuai kebutuhan sesi pemotretanmu.
                    </p>
                </div>

                {/* Bar Pencarian & Filter */}
                <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-3xl shadow-md border border-gray-200 dark:border-gray-800 mb-10 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cari Nama / Deskripsi</label>
                        <input
                            type="text"
                            placeholder="Cth: Minimalist, Industrial..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="sm:w-64">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min. Kapasitas Orang</label>
                        <select
                            value={minCapacity}
                            onChange={(e) => setMinCapacity(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                            <option value="">Semua Kapasitas</option>
                            <option value="5">Minimal 5 Orang</option>
                            <option value="8">Minimal 8 Orang</option>
                            <option value="10">Minimal 10 Orang</option>
                        </select>
                    </div>
                </div>

                {/* Daftar Studio */}
                {loading ? (
                    <div className="text-center text-gray-500 py-12">Memuat studio...</div>
                ) : filteredStudios.length === 0 ? (
                    <div className="text-center text-gray-400 py-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
                        Tidak ada studio yang sesuai dengan kata kunci "{searchTerm}".
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredStudios.map((studio) => (
                            <div
                                key={studio.id}
                                className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col justify-between transition hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div>
                                    <div className="h-52 w-full bg-gray-200 dark:bg-gray-800 relative">
                                        <img
                                            src={`/images/${studio.image_url}`}
                                            alt={studio.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
                                            }}
                                        />
                                        <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full ${studio.status === 'active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                                            {studio.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{studio.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{studio.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Kapasitas: <strong className="text-gray-800 dark:text-gray-200">{studio.capacity} Orang</strong></p>
                                    </div>
                                </div>

                                <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-4">
                                    <div>
                                        <span className="text-xs text-gray-400 block">Tarif sewa</span>
                                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                            Rp {Number(studio.price_per_hour).toLocaleString('id-ID')}/jam
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/booking/${studio.id}`)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                                    >
                                        Booking
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Section Lacak Resi */}
            <section id="track" className="max-w-4xl mx-auto px-4">
                <TrackBookingSection />
            </section>

        </div>
    );
}