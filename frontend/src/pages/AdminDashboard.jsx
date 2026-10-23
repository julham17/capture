import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' atau 'studios'

    // State Bookings
    const [bookings, setBookings] = useState([]);

    // State Studios
    const [studios, setStudios] = useState([]);
    const [showStudioModal, setShowStudioModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Perhatikan: image diubah menjadi null untuk menampung file objek lokal
    const [studioForm, setStudioForm] = useState({
        id: '',
        name: '',
        description: '',
        capacity: '',
        price_per_hour: '',
        image: null,
        status: 'active'
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // 1. Validasi Autentikasi Admin saat Halaman Dimuat
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/');
            return;
        }
        fetchData();
    }, [navigate]);

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookingRes, studioRes] = await Promise.all([
                API.get('/booking'),
                API.get('/studio')
            ]);
            setBookings(bookingRes.data);
            setStudios(studioRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Gagal memuat data admin:', err);
            setLoading(false);
        }
    };

    // Handler Logout Admin
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    // Handler Status Booking
    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/booking/${id}/status`, { payment_status: newStatus });
            setMessage(`Status pesanan berhasil diubah!`);
            setTimeout(() => setMessage(null), 3000);
            fetchData();
        } catch (err) {
            alert('Gagal mengubah status pembayaran.');
        }
    };

    // Handler Submit Studio Menggunakan FormData (Create & Update)
    const handleStudioSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', studioForm.name);
            formData.append('description', studioForm.description);
            formData.append('capacity', studioForm.capacity);
            formData.append('price_per_hour', studioForm.price_per_hour);
            formData.append('status', studioForm.status);

            // Lampirkan file gambar jika admin memilih file baru
            if (studioForm.image) {
                formData.append('image', studioForm.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (isEditing) {
                await API.put(`/studio/${studioForm.id}`, formData, config);
                setMessage('Studio berhasil diperbarui!');
            } else {
                await API.post('/studio', formData, config);
                setMessage('Studio baru berhasil ditambahkan!');
            }
            setShowStudioModal(false);
            resetStudioForm();
            setTimeout(() => setMessage(null), 3000);
            fetchData();
        } catch (err) {
            console.error('Gagal menyimpan studio:', err);
            alert('Terjadi kesalahan saat menyimpan data studio.');
        }
    };

    // Handler Delete Studio
    const handleDeleteStudio = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus studio ini?')) {
            try {
                await API.delete(`/studio/${id}`);
                setMessage('Studio berhasil dihapus!');
                setTimeout(() => setMessage(null), 3000);
                fetchData();
            } catch (err) {
                alert('Gagal menghapus studio.');
            }
        }
    };

    const openEditStudio = (studio) => {
        setStudioForm({
            id: studio.id,
            name: studio.name,
            description: studio.description,
            capacity: studio.capacity,
            price_per_hour: studio.price_per_hour,
            image: null, // Reset input file saat edit, biarkan backend pakai gambar lama jika tidak diubah
            status: studio.status
        });
        setIsEditing(true);
        setShowStudioModal(true);
    };

    const openAddStudio = () => {
        resetStudioForm();
        setIsEditing(false);
        setShowStudioModal(true);
    };

    const resetStudioForm = () => {
        setStudioForm({
            id: '',
            name: '',
            description: '',
            capacity: '',
            price_per_hour: '',
            image: null,
            status: 'active'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2.5 py-1 rounded-full text-xs font-bold">CONFIRMED</span>;
            case 'canceled':
                return <span className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2.5 py-1 rounded-full text-xs font-bold">CANCELED</span>;
            case 'completed':
                return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-bold">COMPLETED</span>;
            default:
                return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 px-2.5 py-1 rounded-full text-xs font-bold">PENDING</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">Memuat dashboard admin...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">

                {/* Header Dashboard & Nav Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                            Dashboard Admin Studio
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola pesanan masuk dan data ruangan studio dalam satu panel.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        {/* Tab Navigation */}
                        <div className="flex bg-gray-200 dark:bg-gray-900 p-1.5 rounded-2xl gap-2">
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${activeTab === 'bookings' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                📦 Pesanan ({bookings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('studios')}
                                className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${activeTab === 'studios' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                📸 Studio ({studios.length})
                            </button>
                        </div>

                        {/* Tombol Logout */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                            🚪 Keluar
                        </button>
                    </div>
                </div>

                {/* Notifikasi Pesan */}
                {message && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-4 py-3 rounded-2xl text-sm shadow-sm">
                        {message}
                    </div>
                )}

                {/* TAB 1: KELOLA PESANAN */}
                {activeTab === 'bookings' && (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                                    <th className="py-4 px-6">Kode Resi</th>
                                    <th className="py-4 px-6">Pemesan</th>
                                    <th className="py-4 px-6">Studio</th>
                                    <th className="py-4 px-6">Jadwal Sewa</th>
                                    <th className="py-4 px-6">Total Harga</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-center">Aksi Verifikasi</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm text-gray-800 dark:text-gray-200">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-400">
                                            Belum ada data pesanan masuk.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                                            <td className="py-4 px-6 font-black text-indigo-600 dark:text-indigo-400">
                                                {item.booking_code}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold">{item.customer_name}</div>
                                                <div className="text-xs text-gray-400">{item.customer_phone}</div>
                                            </td>
                                            <td className="py-4 px-6 font-medium">
                                                {item.studio_name}
                                            </td>
                                            <td className="py-4 px-6 text-xs">
                                                <div>{item.booking_date.split('T')[0]}</div>
                                                <div className="text-gray-400">{item.start_time} - {item.end_time}</div>
                                            </td>
                                            <td className="py-4 px-6 font-bold">
                                                Rp {Number(item.total_price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(item.payment_status)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <select
                                                    value={item.payment_status}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="canceled">Canceled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: KELOLA STUDIO (CRUD) */}
                {activeTab === 'studios' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Daftar Ruangan Studio</h2>
                            <button
                                onClick={openAddStudio}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-2xl shadow-md transition cursor-pointer text-sm"
                            >
                                + Tambah Studio Baru
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                                        <th className="py-4 px-6">Nama Studio</th>
                                        <th className="py-4 px-6">Kapasitas</th>
                                        <th className="py-4 px-6">Tarif / Jam</th>
                                        <th className="py-4 px-6">File Gambar</th>
                                        <th className="py-4 px-6">Status</th>
                                        <th className="py-4 px-6 text-center">Aksi</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm text-gray-800 dark:text-gray-200">
                                    {studios.map((studio) => (
                                        <tr key={studio.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                                            <td className="py-4 px-6 font-bold">
                                                {studio.name}
                                            </td>
                                            <td className="py-4 px-6">{studio.capacity} Orang</td>
                                            <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                                                Rp {Number(studio.price_per_hour).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-400 font-mono">
                                                {studio.image_url}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${studio.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                                    {studio.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center space-x-2">
                                                <button
                                                    onClick={() => openEditStudio(studio)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudio(studio.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL FORM TAMBAH / EDIT STUDIO DENGAN INPUT FILE LOKAL */}
                {showStudioModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                {isEditing ? 'Edit Data Studio' : 'Tambah Studio Baru'}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                                {isEditing ? 'Edit informasi studio dan ganti gambar jika perlu.' : 'Pilih file gambar dari komputer Anda untuk studio baru.'}
                            </p>

                            <form onSubmit={handleStudioSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Studio</label>
                                    <input
                                        type="text"
                                        required
                                        value={studioForm.name}
                                        onChange={(e) => setStudioForm({...studioForm, name: e.target.value})}
                                        className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Contoh: Studio C - Luxury"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Kapasitas (Orang)</label>
                                        <input
                                            type="number"
                                            required
                                            value={studioForm.capacity}
                                            onChange={(e) => setStudioForm({...studioForm, capacity: e.target.value})}
                                            className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tarif per Jam (Rp)</label>
                                        <input
                                            type="number"
                                            required
                                            value={studioForm.price_per_hour}
                                            onChange={(e) => setStudioForm({...studioForm, price_per_hour: e.target.value})}
                                            className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="150000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Gambar Studio (File Lokal)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setStudioForm({...studioForm, image: e.target.files[0]})}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-gray-400 mt-1 block">Format didukung: JPG, PNG, JPEG.</span>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Fasilitas</label>
                                    <textarea
                                        rows="3"
                                        value={studioForm.description}
                                        onChange={(e) => setStudioForm({...studioForm, description: e.target.value})}
                                        className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Deskripsi fasilitas ruangan..."
                                    ></textarea>
                                </div>
                                {isEditing && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status Studio</label>
                                        <select
                                            value={studioForm.status}
                                            onChange={(e) => setStudioForm({...studioForm, status: e.target.value})}
                                            className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowStudioModal(false)}
                                        className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-2xl text-sm font-semibold cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-sm font-semibold shadow-md cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}