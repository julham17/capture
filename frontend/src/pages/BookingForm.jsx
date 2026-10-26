import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import confetti from 'canvas-confetti';
import {
    ArrowLeft,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    MessageCircle,
    Clock,
    Users,
    Calendar,
    Sparkles,
    Copy,
    Check,
    CreditCard,
    ShieldCheck,
    Camera,
    FileDown
} from 'lucide-react';
import { generateReceiptPDF } from '../utils/generateReceiptPDF';

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
    });

    // Manajemen slot waktu ala bioskop
    const [bookedSlots, setBookedSlots] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);

    const [loadingBooking, setLoadingBooking] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [scheduleError, setScheduleError] = useState('');
    const [copiedCode, setCopiedCode] = useState(false);

    // Master slot jam operasional
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    // Helper numeric sort untuk jam
    const toMinutes = (value) => {
        const [h, m] = value.split(':').map(Number);
        return h * 60 + m;
    };

    // 1. Ambil detail studio
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

    // 2. Ambil jadwal terisi saat tanggal berubah
    useEffect(() => {
        let active = true;

        const fetchSchedule = async () => {
            setBookedSlots([]);
            setSelectedSlots([]);
            setScheduleError('');
            setErrorMessage(null);

            if (!formData.booking_date) {
                setLoadingSchedule(false);
                return;
            }

            setLoadingSchedule(true);

            try {
                const response = await API.get(
                    `/booking/studio/${studioId}/schedule`,
                    {
                        params: { date: formData.booking_date }
                    }
                );

                if (!active) return;

                if (!Array.isArray(response.data)) {
                    throw new Error('Format data jadwal tidak valid.');
                }

                setBookedSlots(response.data);
            } catch (err) {
                if (!active) return;
                console.error('Gagal memuat jadwal studio:', err);
                setBookedSlots([]);
                setScheduleError('Jadwal gagal dimuat. Silakan coba pilih kembali tanggal.');
            } finally {
                if (active) setLoadingSchedule(false);
            }
        };

        fetchSchedule();

        return () => {
            active = false;
        };
    }, [formData.booking_date, studioId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const isSlotBooked = (time) => {
        if (!Array.isArray(bookedSlots)) return false;

        const slotStart = toMinutes(time);
        const slotEnd = slotStart + 60;

        return bookedSlots.some((booking) => {
            if (!booking.start_time || !booking.end_time) {
                return false;
            }

            const bookingStart = toMinutes(booking.start_time.slice(0, 5));
            const bookingEnd = toMinutes(booking.end_time.slice(0, 5));

            return slotStart < bookingEnd && slotEnd > bookingStart;
        });
    };

    /**
     * Memeriksa apakah slot waktu sudah terlewat dari jam sekarang
     * atau berjarak kurang dari 3 jam (kebijakan minimum 3 jam sebelum reservasi).
     */
    const getSlotTimingStatus = (time) => {
        if (!formData.booking_date) {
            return { isRestricted: false, reason: null, label: null };
        }

        const [hour, minute] = time.split(':');
        const slotDateTime = new Date(`${formData.booking_date}T${hour}:${minute}:00`);
        const now = new Date();

        const diffMs = slotDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Jika jam slot sudah terlewat dari waktu saat ini
        if (diffMs <= 0) {
            return { isRestricted: true, reason: 'past', label: 'Terlewat' };
        }

        // Jika jam slot berjarak kurang dari 3 jam dari waktu saat ini
        if (diffHours < 3) {
            return { isRestricted: true, reason: 'too_soon', label: 'Min. 3 Jam' };
        }

        return { isRestricted: false, reason: null, label: null };
    };

    const handleSlotClick = (time) => {
        const timing = getSlotTimingStatus(time);

        if (loadingSchedule || scheduleError || isSlotBooked(time) || timing.isRestricted) {
            return;
        }

        const current = [...selectedSlots].sort((a, b) => toMinutes(a) - toMinutes(b));

        if (current.includes(time)) {
            const first = current[0];
            const last = current[current.length - 1];

            if (time !== first && time !== last) {
                setErrorMessage(
                    'Slot di tengah rentang tidak bisa dilepas langsung. ' +
                    'Hapus slot dari ujung rentang terlebih dahulu.'
                );
                return;
            }

            setSelectedSlots(current.filter((t) => t !== time));
            setErrorMessage(null);
            return;
        }

        if (current.length >= 4) {
            setErrorMessage('Batas maksimal reservasi mandiri adalah 4 jam per sesi.');
            return;
        }

        if (current.length > 0) {
            const first = toMinutes(current[0]);
            const last = toMinutes(current[current.length - 1]);
            const clicked = toMinutes(time);

            const isAdjacent = clicked === first - 60 || clicked === last + 60;

            if (!isAdjacent) {
                setErrorMessage(
                    'Pilihlah slot jam yang berdampingan (berurutan) dengan jam yang telah Anda pilih.'
                );
                return;
            }
        }

        setSelectedSlots([...current, time].sort((a, b) => toMinutes(a) - toMinutes(b)));
        setErrorMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingBooking(true);
        setErrorMessage(null);

        if (selectedSlots.length === 0) {
            setErrorMessage('Silakan pilih minimal 1 slot jam sewa studio.');
            setLoadingBooking(false);
            return;
        }

        // Validasi aturan: jam tidak boleh sudah lewat dan wajib minimal 3 jam dari sekarang
        for (const slot of selectedSlots) {
            const timing = getSlotTimingStatus(slot);
            if (timing.isRestricted) {
                setErrorMessage(
                    timing.reason === 'past'
                        ? `Slot jam ${slot} sudah terlewat dari jam saat ini. Silakan pilih jam lain yang tersedia.`
                        : `Slot jam ${slot} berjarak kurang dari 3 jam dari sekarang. Reservasi wajib dilakukan minimal 3 jam sebelum jam pemotretan dimulai.`
                );
                setLoadingBooking(false);
                return;
            }
        }

        const sortedSlots = [...selectedSlots].sort((a, b) => toMinutes(a) - toMinutes(b));
        const startTime = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];

        const [hour, minute] = lastSlot.split(':');
        const endHourNum = Number(hour) + 1;
        if (endHourNum > 23) {
            setErrorMessage('Slot jam terakhir melebihi jam operasional. Silakan pilih jam lebih awal.');
            setLoadingBooking(false);
            return;
        }
        const endTime = `${String(endHourNum).padStart(2, '0')}:${minute}`;

        try {
            const payload = {
                studio_id: Number(studioId),
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                booking_date: formData.booking_date,
                start_time: startTime,
                end_time: endTime
            };

            const response = await API.post('/booking', payload);
            setSelectedSlots([]);
            setSuccessData(response.data.data);
            setLoadingBooking(false);

            // Trigger golden celebratory confetti
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#ECC876']
            });
        } catch (err) {
            console.error('Gagal membuat booking:', err);
            setLoadingBooking(false);
            if (err.response && err.response.data) {
                setErrorMessage(err.response.data.error || err.response.data.message);
            } else {
                setErrorMessage('Terjadi kendala pada server. Mohon coba beberapa saat lagi.');
            }
        }
    };

    const handleCopyCode = () => {
        if (!successData?.booking_code) return;
        navigator.clipboard.writeText(successData.booking_code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleOpenWhatsApp = () => {
        if (!successData) return;
        const adminPhone = '6289673309449';
        const message =
            `Halo Concierge Capture Atelier, saya telah menyelesaikan reservasi online:\n\n` +
            `*Kode Resi:* ${successData.booking_code}\n` +
            `*Nama Pemesan:* ${successData.customer_name}\n` +
            `*Ruangan:* ${successData.studio_name ?? 'Studio Foto'}\n` +
            `*Tanggal Sewa:* ${successData.booking_date}\n` +
            `*Waktu:* ${successData.start_time} - ${successData.end_time} WIB\n` +
            `*Total Biaya:* Rp ${Number(successData.total_price).toLocaleString('id-ID')}\n\n` +
            `Mohon bantuannya untuk verifikasi dan panduan kedatangan. Terima kasih!`;

        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Loading State
    if (loadingStudio) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#08080a] gap-4">
                <div className="relative w-12 h-12">
                    <span className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
                    <span className="absolute inset-2 rounded-full bg-[#D4AF37]/10 animate-pulse" />
                </div>
                <p className="font-mono text-xs tracking-[0.25em] uppercase text-neutral-400">
                    Menyiapkan Atelier...
                </p>
            </div>
        );
    }

    // Error State
    if (!studio) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#08080a] px-4">
                <div className="bg-red-950/40 border border-red-800 text-red-300 p-8 rounded-2xl max-w-md text-center space-y-4">
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                    <h3 className="font-display text-xl font-bold text-white">Studio Tidak Ditemukan</h3>
                    <p className="text-xs text-neutral-400">{errorMessage || 'ID studio tidak valid.'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2.5 rounded-full border border-neutral-700 text-xs uppercase tracking-wider text-neutral-300 hover:text-white hover:border-neutral-500"
                    >
                        Kembali ke Katalog
                    </button>
                </div>
            </div>
        );
    }

    const calculatedTotal = selectedSlots.length * Number(studio.price_per_hour);

    return (
        <div className="min-h-screen bg-[#08080a] text-neutral-100 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F3E5AB] mb-8 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali ke Koleksi Ruangan</span>
                </button>

                {/* SUCCESS SCREEN */}
                {successData ? (
                    <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#13131c] to-[#0c0c12] border border-[#D4AF37]/40 rounded-3xl p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.15)] text-center relative overflow-hidden animate-fadeIn">
                        
                        {/* Gold Top Flare */}
                        <div className="h-[2px] -mx-12 -mt-12 mb-8 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                        {/* Confirmation Badge */}
                        <div className="w-20 h-20 rounded-full border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 to-black/60 flex items-center justify-center text-[#D4AF37] mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.25)]">
                            <CheckCircle2 size={36} strokeWidth={1.5} />
                        </div>

                        <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#D4AF37] block mb-2">
                            Reservasi Berhasil Diajukan
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-wider mb-3">
                            Tiket Reservasi Atelier
                        </h2>
                        <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto mb-8">
                            Jadwal Anda telah tercatat dalam sistem kami. Simpan kode resi berikut dan lakukan konfirmasi pembayaran melalui WhatsApp concierge.
                        </p>

                        {/* Resi Box */}
                        <div className="bg-[#181824] border border-[#D4AF37]/40 rounded-2xl p-5 mb-8 inline-flex flex-col sm:flex-row items-center gap-4 justify-between w-full max-w-md mx-auto">
                            <div className="text-left">
                                <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 block mb-0.5 font-mono">
                                    Nomor Resi Pemesanan
                                </span>
                                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#D4AF37] tracking-wider">
                                    {successData.booking_code}
                                </span>
                            </div>
                            <button
                                onClick={handleCopyCode}
                                className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-[#D4AF37] transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                <span>{copiedCode ? 'Tersalin' : 'Salin Kode'}</span>
                            </button>
                        </div>

                        {/* Summary details */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-left space-y-3 mb-8 text-xs sm:text-sm">
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-neutral-400">Nama Tamu</span>
                                <span className="text-white font-medium">{successData.customer_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-neutral-400">Ruangan Studio</span>
                                <span className="text-white font-medium">{successData.studio_name ?? studio.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-neutral-400">Tanggal Sewa</span>
                                <span className="text-white font-medium">{successData.booking_date}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-neutral-400">Rentang Waktu</span>
                                <span className="text-white font-medium">{successData.start_time} – {successData.end_time} WIB</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-neutral-300 font-semibold uppercase tracking-wider text-xs">Total Pembayaran</span>
                                <span className="font-display text-xl font-bold text-[#D4AF37]">
                                    Rp {Number(successData.total_price).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button
                                type="button"
                                onClick={() => generateReceiptPDF(successData)}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#A58019] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-black font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                                <FileDown size={16} />
                                Unduh Resi (PDF)
                            </button>
                            <button
                                type="button"
                                onClick={handleOpenWhatsApp}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all"
                            >
                                <MessageCircle size={16} />
                                Konfirmasi via WhatsApp
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer"
                            >
                                Selesai & Kembali
                            </button>
                        </div>
                    </div>
                ) : (
                    /* FORM LAYOUT: 2 Columns */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Studio Vignette & Order Summary (5 cols) */}
                        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                            
                            {/* Studio Card */}
                            <div className="bg-[#0f0f15] border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
                                <div className="relative h-60 w-full overflow-hidden bg-neutral-900">
                                    <img
                                        src={`/studio/${studio.image_url}`}
                                        alt={studio.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f15] via-transparent to-black/20" />
                                    
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-black/70 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40">
                                            Studio Terpilih
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <h2 className="font-display text-2xl font-bold text-white tracking-wide">
                                            {studio.name}
                                        </h2>
                                        <p className="text-neutral-400 text-xs sm:text-sm mt-1 leading-relaxed font-light">
                                            {studio.description || 'Ruangan eksklusif siap digunakan untuk sesi profesional.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2 text-xs text-neutral-300">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                                            <Users size={13} className="text-[#D4AF37]" />
                                            <span>Max. {studio.capacity} Orang</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                                            <Camera size={13} className="text-[#D4AF37]" />
                                            <span>Lighting Kit Siap</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Order Summary Box */}
                            <div className="bg-[#12121a] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-xl space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-1.5">
                                        <Sparkles size={12} />
                                        Ringkasan Biaya
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        Rp {Number(studio.price_per_hour).toLocaleString('id-ID')} / jam
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-neutral-300">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Tanggal Sesi:</span>
                                        <span className="font-medium text-white">
                                            {formData.booking_date || 'Belum dipilih'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Durasi Terpilih:</span>
                                        <span className="font-medium text-white">
                                            {selectedSlots.length > 0 ? `${selectedSlots.length} Jam` : '0 Jam'}
                                        </span>
                                    </div>
                                    {selectedSlots.length > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Jam Operasional:</span>
                                            <span className="font-medium text-[#D4AF37]">
                                                {selectedSlots[0]} – {
                                                    (() => {
                                                        const last = selectedSlots[selectedSlots.length - 1];
                                                        const h = Number(last.split(':')[0]) + 1;
                                                        return `${String(h).padStart(2, '0')}:00 WIB`;
                                                    })()
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] tracking-widest uppercase text-neutral-400 block">
                                            Total Estimasi
                                        </span>
                                        <span className="font-display text-2xl font-bold text-[#D4AF37]">
                                            Rp {calculatedTotal.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="text-right text-[10px] text-neutral-500">
                                        Termasuk fasilitas studio & perlengkapan standar
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Interactive Booking Process (7 cols) */}
                        <div className="lg:col-span-7 bg-[#0e0e14] border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                            
                            <div>
                                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#D4AF37] block mb-1">
                                    Formulir Reservasi Mandiri
                                </span>
                                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wider">
                                    Data Pemesan & Waktu
                                </h3>
                            </div>

                            {/* Error Alert */}
                            {errorMessage && (
                                <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800/60 text-red-300 p-4 rounded-2xl text-xs sm:text-sm animate-shake">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                                    <span className="leading-relaxed">{errorMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                
                                {/* Section 1: Customer Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37]">
                                        <span>1.</span>
                                        <span>Informasi Tamu</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                name="customer_name"
                                                required
                                                value={formData.customer_name}
                                                onChange={handleChange}
                                                placeholder="Contoh: Jessica Anggraini"
                                                className="w-full bg-[#15151f] border border-neutral-700/80 rounded-xl px-4 py-3 text-white text-xs sm:text-sm placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                                Alamat Email
                                            </label>
                                            <input
                                                type="email"
                                                name="customer_email"
                                                required
                                                value={formData.customer_email}
                                                onChange={handleChange}
                                                placeholder="jessica@domain.com"
                                                className="w-full bg-[#15151f] border border-neutral-700/80 rounded-xl px-4 py-3 text-white text-xs sm:text-sm placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                            Nomor WhatsApp Aktif
                                        </label>
                                        <input
                                            type="tel"
                                            name="customer_phone"
                                            required
                                            value={formData.customer_phone}
                                            onChange={handleChange}
                                            placeholder="081234567890"
                                            className="w-full bg-[#15151f] border border-neutral-700/80 rounded-xl px-4 py-3 text-white text-xs sm:text-sm placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Date Picker */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37]">
                                        <span>2.</span>
                                        <span>Pilih Tanggal Sesi</span>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2">
                                            Tanggal Kedatangan
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="booking_date"
                                                required
                                                value={formData.booking_date}
                                                onChange={handleChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full bg-[#15151f] border border-neutral-700/80 rounded-xl px-4 py-3 text-white text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none transition-all cursor-pointer dark:[color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Time Slot Picker */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37]">
                                            <span>3.</span>
                                            <span>Pilih Slot Waktu</span>
                                        </div>
                                        <span className="text-[10px] text-neutral-400 font-mono">
                                            Maks. 4 Jam Berurutan
                                        </span>
                                    </div>

                                    {!formData.booking_date ? (
                                        <div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-[#14141e] text-xs text-neutral-400">
                                            <Calendar size={16} className="text-[#D4AF37]" />
                                            <span>Silakan pilih tanggal kedatangan di atas untuk menampilkan slot waktu yang tersedia.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">

                                            {/* Kebijakan Batas Waktu 3 Jam */}
                                            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 leading-relaxed">
                                                <Clock size={16} className="shrink-0 mt-0.5 text-amber-400" />
                                                <span>
                                                    <strong className="text-amber-200">Ketentuan Waktu:</strong> Reservasi wajib dilakukan minimal <strong>3 jam sebelum</strong> jam pemotretan dimulai. Jam yang telah terlewat atau berjarak kurang dari 3 jam dari waktu saat ini tidak dapat dipilih.
                                                </span>
                                            </div>
                                            
                                            {/* Schedule Error Notice */}
                                            {scheduleError && (
                                                <div className="flex items-start gap-2 bg-red-950/60 border border-red-800/60 text-red-300 p-3 rounded-xl text-xs">
                                                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                                                    <span>{scheduleError}</span>
                                                </div>
                                            )}

                                            {/* Legend */}
                                            <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-[11px] text-neutral-400">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-sm bg-neutral-800 border border-neutral-600" />
                                                    <span>Tersedia</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37]" />
                                                    <span className="text-[#D4AF37] font-medium">Dipilih</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-sm bg-red-950 border border-red-900" />
                                                    <span className="text-neutral-500">Terisi</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-sm bg-[#101017] border border-neutral-800 opacity-60" />
                                                    <span className="text-neutral-500">Lewat / Min. 3 Jam</span>
                                                </div>
                                            </div>

                                            {/* Grid or Loader */}
                                            {loadingSchedule ? (
                                                <div className="flex items-center justify-center py-10 gap-3">
                                                    <span className="w-5 h-5 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
                                                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                                                        Memeriksa Ketersediaan...
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                                                    {timeSlots.map((time) => {
                                                        const isBooked = isSlotBooked(time);
                                                        const isSelected = selectedSlots.includes(time);
                                                        const timing = getSlotTimingStatus(time);
                                                        const isDisabled = isBooked || timing.isRestricted || loadingSchedule || !!scheduleError;

                                                        return (
                                                            <button
                                                                key={time}
                                                                type="button"
                                                                disabled={isDisabled}
                                                                onClick={() => handleSlotClick(time)}
                                                                title={
                                                                    timing.reason === 'past'
                                                                        ? `Jam ${time} sudah terlewat dari jam saat ini`
                                                                        : timing.reason === 'too_soon'
                                                                        ? `Jam ${time} kurang dari 3 jam dari sekarang (kebijakan min. 3 jam)`
                                                                        : isBooked
                                                                        ? `Jam ${time} sudah terisi oleh pemesan lain`
                                                                        : `Pilih slot jam ${time}`
                                                                }
                                                                className={`p-3 rounded-xl text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                                                                    timing.isRestricted
                                                                        ? 'bg-[#101017]/50 border border-neutral-800/80 text-neutral-600 cursor-not-allowed opacity-50'
                                                                        : isBooked
                                                                        ? 'bg-red-950/40 border border-red-900/50 text-red-500/60 cursor-not-allowed opacity-60'
                                                                        : isSelected
                                                                        ? 'bg-gradient-to-r from-[#ECC876] to-[#D4AF37] text-black font-bold border border-[#D4AF37] scale-95 shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer'
                                                                        : 'bg-[#151520] border border-neutral-700/70 text-neutral-300 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] cursor-pointer'
                                                                }`}
                                                            >
                                                                <span className="font-bold">{time}</span>
                                                                <span className="text-[9px] uppercase tracking-wider font-sans opacity-70">
                                                                    {timing.isRestricted
                                                                        ? timing.label
                                                                        : isBooked
                                                                        ? 'Terisi'
                                                                        : isSelected
                                                                        ? 'Dipilih'
                                                                        : 'Kosong'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                                        <ShieldCheck size={16} className="text-[#D4AF37]" />
                                        <span>Jaminan ketersediaan slot 100% aman</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loadingBooking || selectedSlots.length === 0}
                                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#A58019] text-black font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-102 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {loadingBooking ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                                Memproses Reservasi...
                                            </span>
                                        ) : (
                                            `Konfirmasi Reservasi (${selectedSlots.length} Jam)`
                                        )}
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
