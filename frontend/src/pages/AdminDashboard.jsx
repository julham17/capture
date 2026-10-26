import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
    LogOut,
    Plus,
    CheckCircle,
    Pencil,
    Trash2,
    Search,
    Building2,
    CalendarDays,
    Banknote,
    Clock,
    Sparkles,
    Shield,
    Image as ImageIcon,
    X,
    Filter,
    FileDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { generateReceiptPDF } from '../utils/generateReceiptPDF';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import ReceiptModal from '../components/ReceiptModal';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'studios'
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // State Bookings
    const [bookings, setBookings] = useState([]);
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    // State Studios
    const [studios, setStudios] = useState([]);
    const [showStudioModal, setShowStudioModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

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
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
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
    }, []);

    // 1. Validasi Autentikasi Admin
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/');
            return;
        }
        const timeoutId = window.setTimeout(() => {
            void fetchData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchData, navigate]);

    // Handler Logout Admin
    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setShowLogoutModal(false);
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    // Handler Status Booking
    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/booking/${id}/status`, { payment_status: newStatus });
            setMessage(`Status reservasi berhasil diperbarui menjadi ${newStatus.toUpperCase()}!`);
            setTimeout(() => setMessage(null), 3000);
            fetchData();
        } catch (err) {
            console.error('Gagal mengubah status pembayaran:', err);
            alert('Gagal mengubah status pembayaran.');
        }
    };

    // Handler Image Selection for Studio Form
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStudioForm({ ...studioForm, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Handler Submit Studio
    const handleStudioSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', studioForm.name);
            formData.append('description', studioForm.description);
            formData.append('capacity', studioForm.capacity);
            formData.append('price_per_hour', studioForm.price_per_hour);
            formData.append('status', studioForm.status);

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
                setMessage('Ruangan studio berhasil diperbarui!');
            } else {
                await API.post('/studio', formData, config);
                setMessage('Ruangan studio baru berhasil ditambahkan!');
            }

            setShowStudioModal(false);
            resetStudioForm();
            setTimeout(() => setMessage(null), 3000);
            fetchData();
        } catch (err) {
            console.error('Gagal menyimpan studio:', err);
            alert('Terjadi kendala saat menyimpan data studio.');
        }
    };

    // Handler Delete Studio
    const handleDeleteStudio = async (id, name) => {
        if (window.confirm(`Hapus permanen ruangan "${name}"?`)) {
            try {
                await API.delete(`/studio/${id}`);
                setMessage(`Studio "${name}" telah dihapus.`);
                setTimeout(() => setMessage(null), 3000);
                fetchData();
            } catch (err) {
                console.error('Gagal menghapus studio:', err);
                alert('Gagal menghapus studio.');
            }
        }
    };

    const openEditStudio = (studio) => {
        setStudioForm({
            id: studio.id,
            name: studio.name,
            description: studio.description || '',
            capacity: studio.capacity,
            price_per_hour: studio.price_per_hour,
            image: null,
            status: studio.status
        });
        setImagePreview(studio.image_url ? `/studio/${studio.image_url}` : null);
        setIsEditing(true);
        setShowStudioModal(true);
    };

    const openAddStudio = () => {
        resetStudioForm();
        setIsEditing(false);
        setImagePreview(null);
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
        setImagePreview(null);
    };

    // Metrics calculation
    const metrics = useMemo(() => {
        const total = bookings.length;
        const pending = bookings.filter(b => b.payment_status === 'pending').length;
        const confirmed = bookings.filter(b => b.payment_status === 'confirmed').length;
        const totalRevenue = bookings
            .filter(b => b.payment_status !== 'canceled')
            .reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);

        return { total, pending, confirmed, totalRevenue };
    }, [bookings]);

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter((item) => {
            const matchesSearch =
                item.booking_code?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                item.customer_name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                item.studio_name?.toLowerCase().includes(bookingSearch.toLowerCase());

            const matchesStatus =
                bookingStatusFilter === 'all' ? true : item.payment_status === bookingStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [bookings, bookingSearch, bookingStatusFilter]);

    // Reset pagination to page 1 whenever filter / search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [bookingSearch, bookingStatusFilter]);

    // Pagination calculations (Limit 10 data per page)
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-950/70 border border-emerald-600/50 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Confirmed
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-sky-950/70 border border-sky-600/50 text-sky-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        Completed
                    </span>
                );
            case 'canceled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-red-950/70 border border-red-600/50 text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Canceled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-950/70 border border-amber-600/50 text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#08080a] gap-4">
                <div className="relative w-12 h-12">
                    <span className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
                    <span className="absolute inset-2 rounded-full bg-[#D4AF37]/10 animate-pulse" />
                </div>
                <p className="font-mono text-xs tracking-[0.25em] uppercase text-neutral-400">
                    Membuka Panel Pengelola...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08080a] text-neutral-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#D4AF37] selection:text-black">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Atelier Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-black/60 flex items-center justify-center text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            <Shield size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-white">
                                    iDZOEL Dashboard
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase">
                                    Admin
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                Selamat bertugas, <span className="text-[#D4AF37] font-medium">{adminUser.username || 'Pengelola'}</span>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        {/* Tab Switcher */}
                        <div className="flex bg-[#12121a] border border-neutral-800 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                    activeTab === 'bookings'
                                        ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                Reservasi ({bookings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('studios')}
                                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                    activeTab === 'studios'
                                        ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                Studio ({studios.length})
                            </button>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-800/60 bg-red-950/30 text-red-400 hover:bg-red-900/40 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                        >
                            <LogOut size={14} />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>

                {/* Success Toast */}
                {message && (
                    <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 px-5 py-3.5 rounded-2xl text-xs sm:text-sm animate-fadeIn">
                        <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#101017] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between text-neutral-400 mb-2">
                            <span className="text-[10px] font-mono tracking-widest uppercase">Total Pesanan</span>
                            <CalendarDays size={16} className="text-[#D4AF37]" />
                        </div>
                        <span className="font-display text-3xl font-bold text-white">{metrics.total}</span>
                    </div>

                    <div className="bg-[#101017] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between text-neutral-400 mb-2">
                            <span className="text-[10px] font-mono tracking-widest uppercase">Menunggu Verifikasi</span>
                            <Clock size={16} className="text-amber-400" />
                        </div>
                        <span className="font-display text-3xl font-bold text-amber-300">{metrics.pending}</span>
                    </div>

                    <div className="bg-[#101017] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between text-neutral-400 mb-2">
                            <span className="text-[10px] font-mono tracking-widest uppercase">Terkonfirmasi</span>
                            <Sparkles size={16} className="text-emerald-400" />
                        </div>
                        <span className="font-display text-3xl font-bold text-emerald-300">{metrics.confirmed}</span>
                    </div>

                    <div className="bg-[#101017] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between text-neutral-400 mb-2">
                            <span className="text-[10px] font-mono tracking-widest uppercase">Est. Omzet Masuk</span>
                            <Banknote size={16} className="text-[#D4AF37]" />
                        </div>
                        <span className="font-display text-xl sm:text-2xl font-bold text-[#D4AF37]">
                            Rp {metrics.totalRevenue.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    TAB 1: BOOKING MANAGEMENT
                ══════════════════════════════════════════════════════════════ */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        
                        {/* Search & Filter Controls */}
                        <div className="bg-[#101017] border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-80">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type="text"
                                    placeholder="Cari kode resi, nama, studio..."
                                    value={bookingSearch}
                                    onChange={(e) => setBookingSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#171722] border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>

                            {/* Status Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                                {['all', 'pending', 'confirmed', 'completed', 'canceled'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setBookingStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                            bookingStatusFilter === st
                                                ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37]'
                                                : 'border border-neutral-800 text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        {st === 'all' ? 'Semua' : st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bookings Table */}
                        <div className="bg-[#0f0f15] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr className="bg-[#14141d] text-neutral-400 text-[10px] font-mono uppercase tracking-[0.2em] border-b border-neutral-800">
                                            <th className="py-4 px-6">Resi Reservasi</th>
                                            <th className="py-4 px-6">Nama Pemesan</th>
                                            <th className="py-4 px-6">Studio</th>
                                            <th className="py-4 px-6">Jadwal Sesi</th>
                                            <th className="py-4 px-6">Total Biaya</th>
                                            <th className="py-4 px-6">Status</th>
                                            <th className="py-4 px-6 text-center">Tindakan Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/60">
                                        {filteredBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-16 text-center text-neutral-500 text-xs">
                                                    Tidak ada data reservasi yang sesuai filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentBookings.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-neutral-800/30 transition-colors"
                                                >
                                                    <td className="py-4 px-6 font-mono font-bold text-[#D4AF37]">
                                                        {item.booking_code}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-semibold text-white">{item.customer_name}</div>
                                                        <div className="text-[11px] text-neutral-500">{item.customer_phone}</div>
                                                    </td>
                                                    <td className="py-4 px-6 font-medium text-neutral-300">
                                                        {item.studio_name}
                                                    </td>
                                                    <td className="py-4 px-6 text-xs font-mono">
                                                        <div className="text-white">{item.booking_date.split('T')[0]}</div>
                                                        <div className="text-neutral-500">{item.start_time} – {item.end_time} WIB</div>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-white font-mono">
                                                        Rp {Number(item.total_price).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getStatusBadge(item.payment_status)}
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <select
                                                                value={item.payment_status}
                                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                                className="bg-[#181824] border border-neutral-700 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 font-mono focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="confirmed">Confirmed</option>
                                                                <option value="completed">Completed</option>
                                                                <option value="canceled">Canceled</option>
                                                            </select>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedReceiptBooking(item);
                                                                    setShowReceiptModal(true);
                                                                }}
                                                                className="p-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black transition-all cursor-pointer"
                                                                title="Pratayang & Cetak Resi (PDF)"
                                                            >
                                                                <FileDown size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls Bar (Maksimal 10 Data per Halaman) */}
                            {filteredBookings.length > 0 && (
                                <div className="px-6 py-4 border-t border-neutral-800 bg-[#12121b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                                    <div className="text-neutral-400 font-mono text-[11px]">
                                        Menampilkan <span className="text-white font-semibold">{startIndex + 1}</span>–<span className="text-white font-semibold">{Math.min(endIndex, filteredBookings.length)}</span> dari <span className="text-[#D4AF37] font-semibold">{filteredBookings.length}</span> data reservasi
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={handlePrevPage}
                                            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-white hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                                            title="Halaman Sebelumnya"
                                        >
                                            <ChevronLeft size={14} />
                                            <span>Sebelumnya</span>
                                        </button>

                                        {/* Page indicator */}
                                        <div className="flex items-center gap-1.5 px-2 font-mono text-[11px] text-neutral-400">
                                            <span className="px-2.5 py-1 rounded-md bg-[#D4AF37] text-black font-bold">
                                                {currentPage}
                                            </span>
                                            <span>/</span>
                                            <span>{totalPages}</span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={currentPage === totalPages}
                                            onClick={handleNextPage}
                                            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-white hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                                            title="Halaman Selanjutnya"
                                        >
                                            <span>Selanjutnya</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TAB 2: STUDIOS CRUD
                ══════════════════════════════════════════════════════════════ */}
                {activeTab === 'studios' && (
                    <div className="space-y-6">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-white tracking-wide">
                                    Inventaris Ruangan Studio
                                </h2>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    Kelola daftar ruangan, tarif per jam, kapasitas, dan foto showcase.
                                </p>
                            </div>

                            <button
                                onClick={openAddStudio}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ECC876] to-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
                            >
                                <Plus size={15} />
                                Tambah Studio Baru
                            </button>
                        </div>

                        {/* Studios Grid Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studios.map((studio) => (
                                <div
                                    key={studio.id}
                                    className="bg-[#0f0f15] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all duration-300 shadow-xl"
                                >
                                    <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                                        <img
                                            src={`/studio/${studio.image_url}`}
                                            alt={studio.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600';
                                            }}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                                                    studio.status === 'active'
                                                        ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-400'
                                                        : 'bg-amber-950/80 border border-amber-600 text-amber-300'
                                                }`}
                                            >
                                                {studio.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-3 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-display text-lg font-bold text-white">
                                                {studio.name}
                                            </h3>
                                            <span className="font-mono text-sm font-bold text-[#D4AF37]">
                                                Rp {Number(studio.price_per_hour).toLocaleString('id-ID')}
                                                <span className="text-[10px] text-neutral-500 font-sans font-normal ml-0.5">/jam</span>
                                            </span>
                                        </div>

                                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                                            {studio.description || 'Tidak ada deskripsi.'}
                                        </p>

                                        <div className="text-[11px] text-neutral-400 font-mono">
                                            Kapasitas: <span className="text-white font-medium">{studio.capacity} Orang</span>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 pt-3 border-t border-neutral-800/80 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditStudio(studio)}
                                            className="px-3.5 py-1.5 rounded-lg border border-neutral-700 hover:border-[#D4AF37] text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Pencil size={13} className="text-[#D4AF37]" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudio(studio.id, studio.name)}
                                            className="px-3.5 py-1.5 rounded-lg border border-red-900/60 hover:bg-red-950/60 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    MODAL: ADD / EDIT STUDIO
                ══════════════════════════════════════════════════════════════ */}
                {showStudioModal && (
                    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="relative bg-[#0e0e14] border border-[#D4AF37]/40 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                            
                            <button
                                onClick={() => setShowStudioModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full text-neutral-500 hover:text-white"
                            >
                                <X size={16} />
                            </button>

                            <div>
                                <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#D4AF37] block mb-1">
                                    {isEditing ? 'Pembaruan Data' : 'Registrasi Ruangan'}
                                </span>
                                <h3 className="font-display text-2xl font-bold text-white tracking-wide">
                                    {isEditing ? 'Sunting Data Studio' : 'Tambah Studio Baru'}
                                </h3>
                            </div>

                            <form onSubmit={handleStudioSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                        Nama Ruangan Studio
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={studioForm.name}
                                        onChange={(e) => setStudioForm({ ...studioForm, name: e.target.value })}
                                        className="w-full bg-[#161622] border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="Contoh: Studio IV — Noir Atelier"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                            Kapasitas (Orang)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={studioForm.capacity}
                                            onChange={(e) => setStudioForm({ ...studioForm, capacity: e.target.value })}
                                            className="w-full bg-[#161622] border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                                            placeholder="6"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                            Tarif Sewa / Jam (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={studioForm.price_per_hour}
                                            onChange={(e) => setStudioForm({ ...studioForm, price_per_hour: e.target.value })}
                                            className="w-full bg-[#161622] border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                                            placeholder="175000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                        Foto Ruangan Studio
                                    </label>
                                    
                                    {imagePreview && (
                                        <div className="mb-3 relative h-36 w-full rounded-xl overflow-hidden border border-neutral-700">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full bg-[#161622] border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-neutral-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-[#ECC876] cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                        Deskripsi & Fasilitas Ruangan
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={studioForm.description}
                                        onChange={(e) => setStudioForm({ ...studioForm, description: e.target.value })}
                                        className="w-full bg-[#161622] border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="Sebutkan nuansa, warna backdrop, dan keunggulan studio..."
                                    />
                                </div>

                                {isEditing && (
                                    <div>
                                        <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                            Status Ketersediaan
                                        </label>
                                        <select
                                            value={studioForm.status}
                                            onChange={(e) => setStudioForm({ ...studioForm, status: e.target.value })}
                                            className="w-full bg-[#161622] border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                                        >
                                            <option value="active">Active (Tersedia)</option>
                                            <option value="maintenance">Maintenance (Perbaikan)</option>
                                        </select>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowStudioModal(false)}
                                        className="flex-1 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#ECC876] to-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
                                    >
                                        Simpan Ruangan
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Logout Admin */}
                <LogoutConfirmModal
                    isOpen={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={handleConfirmLogout}
                />

                {/* Pop-up Pratayang Resi dengan Tombol Unduh PDF */}
                <ReceiptModal
                    isOpen={showReceiptModal}
                    onClose={() => setShowReceiptModal(false)}
                    bookingData={selectedReceiptBooking}
                />

            </div>
        </div>
    );
}
