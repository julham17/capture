import { useState } from 'react';
import { Search, AlertCircle, Clock, User, Building2, CalendarDays, Copy, Check, MessageCircle, Sparkles, ArrowLeft, RotateCcw, FileDown } from 'lucide-react';
import API from '../services/api';
import { generateReceiptPDF } from '../utils/generateReceiptPDF';
import ReceiptModal from './ReceiptModal';

export default function TrackBooking() {
    const [bookingCode, setBookingCode] = useState('');
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

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
                setError('Kode reservasi tidak ditemukan dalam sistem. Mohon periksa kembali ejaan kode resi Anda.');
            } else {
                setError('Terjadi kendala saat menghubungi server. Silakan coba kembali beberapa saat lagi.');
            }
        }
    };

    // Tombol Kembali / Reset Lacak
    const handleReset = () => {
        setBookingData(null);
        setError(null);
        setBookingCode('');
    };

    const handleCopy = () => {
        if (!bookingData?.booking_code) return;
        navigator.clipboard.writeText(bookingData.booking_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'confirmed':
                return {
                    label: 'Terkonfirmasi & Siap',
                    badgeCls: 'bg-emerald-950/70 text-emerald-400 border-emerald-600/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
                    dotCls: 'bg-emerald-400 animate-pulse',
                    step: 2,
                    desc: 'Jadwal studio telah diproteksi khusus untuk Anda.',
                };
            case 'completed':
                return {
                    label: 'Sesi Telah Selesai',
                    badgeCls: 'bg-sky-950/70 text-sky-400 border-sky-600/60',
                    dotCls: 'bg-sky-400',
                    step: 3,
                    desc: 'Terima kasih telah berkarya bersama atelier Capture.',
                };
            case 'canceled':
                return {
                    label: 'Dibatalkan',
                    badgeCls: 'bg-red-950/70 text-red-400 border-red-600/60',
                    dotCls: 'bg-red-400',
                    step: 0,
                    desc: 'Reservasi ini telah dibatalkan atau kedaluwarsa.',
                };
            default:
                return {
                    label: 'Menunggu Verifikasi',
                    badgeCls: 'bg-amber-950/70 text-amber-300 border-amber-600/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                    dotCls: 'bg-amber-400 animate-ping',
                    step: 1,
                    desc: 'Silakan konfirmasi bukti transfer via WhatsApp concierge.',
                };
        }
    };

    const handleWhatsAppConfirm = () => {
        if (!bookingData) return;
        const adminPhone = '6289673309449';
        const message =
            `Halo Admin Capture Atelier, saya ingin menanyakan status pembayaran reservasi saya:\n\n` +
            `*Kode Resi:* ${bookingData.booking_code}\n` +
            `*Nama Pemesan:* ${bookingData.customer_name}\n` +
            `*Studio:* ${bookingData.studio_name}\n` +
            `*Jadwal:* ${bookingData.booking_date?.split('T')[0]} (${bookingData.start_time} - ${bookingData.end_time} WIB)\n` +
            `*Total:* Rp ${Number(bookingData.total_price).toLocaleString('id-ID')}\n\n` +
            `Mohon bantuannya untuk memverifikasi. Terima kasih!`;
        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="relative bg-[#0d0d12]/90 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.08)] backdrop-blur-xl overflow-hidden">
            
            {/* Viewfinder Decorative Accents */}
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
            <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />
            <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />

            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-black/60 text-[#D4AF37] mb-5 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                    <Search size={22} strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wider mb-2">
                    Lacak Status Reservasi
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm tracking-wide leading-relaxed font-light">
                    Ketik kode unik resi reservasi (contoh: <span className="text-[#D4AF37] font-mono font-medium">STO-123456</span>) untuk memeriksa status jadwal pemotretan Anda secara seketika.
                </p>
            </div>

            {/* Input Form — Tampil jika belum ada data pesanan yang dipilih */}
            {!bookingData && (
                <form onSubmit={handleTrack} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            required
                            placeholder="MASUKKAN KODE RESI"
                            value={bookingCode}
                            onChange={(e) => setBookingCode(e.target.value)}
                            className="w-full bg-[#15151c] border border-neutral-700/80 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 text-white uppercase tracking-[0.25em] font-mono rounded-xl py-4 px-5 text-sm placeholder-neutral-500 focus:outline-none transition-all duration-200"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="py-4 px-8 rounded-xl bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#9B7D23] text-black font-bold text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2 justify-center">
                                <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                Melacak...
                            </span>
                        ) : (
                            'Periksa Resi'
                        )}
                    </button>
                </form>
            )}

            {/* Error Notification dengan Tombol Kembali / Coba Lagi */}
            {error && (
                <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-red-950/50 border border-red-800/60 text-red-300 px-5 py-4 rounded-xl text-xs sm:text-sm mb-8 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                        <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                        <span className="leading-relaxed">{error}</span>
                    </div>
                    <button
                        onClick={handleReset}
                        className="shrink-0 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white underline cursor-pointer"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Reservation Result Ticket */}
            {bookingData && (
                <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#14141c] to-[#0f0f15] border border-[#D4AF37]/35 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fadeIn">
                    
                    {/* Top Gold Foil Strip */}
                    <div className="h-[2px] -mx-8 -mt-8 mb-6 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                    {/* Tombol Kembali di Bagian Atas Tiket */}
                    <div className="mb-6 flex items-center justify-between pb-4 border-b border-white/5">
                        <button
                            onClick={handleReset}
                            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F3E5AB] transition-colors cursor-pointer group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Kembali ke Pencarian Resi</span>
                        </button>

                        <button
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="Lacak resi lain"
                        >
                            <RotateCcw size={12} />
                            <span>Cari Resi Lain</span>
                        </button>
                    </div>

                    {/* Booking Header & Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
                        <div>
                            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 block mb-1">
                                Kode Reservasi Resmi
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-[#D4AF37]">
                                    {bookingData.booking_code}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 rounded-lg border border-neutral-700 hover:border-[#D4AF37] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                    title="Salin Kode"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            {(() => {
                                const conf = getStatusConfig(bookingData.payment_status);
                                return (
                                    <div className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase ${conf.badgeCls}`}>
                                        <span className={`w-2 h-2 rounded-full ${conf.dotCls}`} />
                                        <span>{conf.label}</span>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Status Progress Bar */}
                    <div className="py-6 border-b border-white/10">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-neutral-400 mb-2">
                            <span className={bookingData.payment_status ? 'text-[#D4AF37] font-semibold' : ''}>1. Diajukan</span>
                            <span className={['confirmed', 'completed'].includes(bookingData.payment_status) ? 'text-[#D4AF37] font-semibold' : ''}>2. Terverifikasi</span>
                            <span className={bookingData.payment_status === 'completed' ? 'text-[#D4AF37] font-semibold' : ''}>3. Selesai</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#ECC876] to-[#D4AF37] transition-all duration-700 rounded-full"
                                style={{
                                    width:
                                        bookingData.payment_status === 'completed'
                                            ? '100%'
                                            : bookingData.payment_status === 'confirmed'
                                            ? '66%'
                                            : bookingData.payment_status === 'canceled'
                                            ? '0%'
                                            : '33%',
                                }}
                            />
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-white/10 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <User size={15} />
                            </div>
                            <div>
                                <span className="text-[10px] tracking-widest uppercase text-neutral-400 block mb-0.5">
                                    Nama Tamu
                                </span>
                                <span className="text-white font-medium">
                                    {bookingData.customer_name}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <Building2 size={15} />
                            </div>
                            <div>
                                <span className="text-[10px] tracking-widest uppercase text-neutral-400 block mb-0.5">
                                    Ruangan Studio
                                </span>
                                <span className="text-white font-medium">
                                    {bookingData.studio_name}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <CalendarDays size={15} />
                            </div>
                            <div>
                                <span className="text-[10px] tracking-widest uppercase text-neutral-400 block mb-0.5">
                                    Tanggal Pelaksanaan
                                </span>
                                <span className="text-white font-medium">
                                    {bookingData.booking_date?.split('T')[0]}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <Clock size={15} />
                            </div>
                            <div>
                                <span className="text-[10px] tracking-widest uppercase text-neutral-400 block mb-0.5">
                                    Durasi Sesi
                                </span>
                                <span className="text-white font-medium">
                                    {bookingData.start_time} – {bookingData.end_time} WIB
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Total & Action Buttons */}
                    <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <span className="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1">
                                Total Biaya Sewa
                            </span>
                            <span className="font-display text-2xl font-bold text-[#D4AF37] tracking-wide">
                                Rp {Number(bookingData.total_price).toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Tombol Buka Pop-up Pratayang & Cetak Resi */}
                            <button
                                type="button"
                                onClick={() => setShowReceiptModal(true)}
                                className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#ECC876] to-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] text-black text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5"
                                title="Buka pratayang resi dan unduh PDF"
                            >
                                <FileDown size={15} />
                                <span>Cek & Cetak Resi</span>
                            </button>

                            {/* Tombol Konfirmasi WA */}
                            <button
                                type="button"
                                onClick={handleWhatsAppConfirm}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-emerald-600/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition-all duration-200 text-xs font-semibold tracking-wider uppercase cursor-pointer"
                            >
                                <MessageCircle size={15} />
                                <span>Konfirmasi (WA)</span>
                            </button>

                            {/* Tombol Kembali / Reset */}
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3.5 py-3 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                <ArrowLeft size={13} />
                                <span>Kembali</span>
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* Pop-up Modal Pratayang Resi dengan Tombol Unduh PDF */}
            <ReceiptModal
                isOpen={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                bookingData={bookingData}
            />

        </div>
    );
}
