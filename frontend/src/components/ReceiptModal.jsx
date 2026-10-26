import { useState } from 'react';
import { X, FileDown, Copy, Check, MessageCircle, CalendarDays, Clock, User, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { generateReceiptPDF } from '../utils/generateReceiptPDF';

export default function ReceiptModal({ isOpen, onClose, bookingData }) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !bookingData) return null;

    const handleCopy = () => {
        if (!bookingData?.booking_code) return;
        navigator.clipboard.writeText(bookingData.booking_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        generateReceiptPDF(bookingData);
    };

    const handleWhatsAppConfirm = () => {
        const adminPhone = '6289673309449';
        const message =
            `Halo Admin Capture Atelier, saya ingin menanyakan status pembayaran reservasi saya:\n\n` +
            `*Kode Resi:* ${bookingData.booking_code}\n` +
            `*Nama Pemesan:* ${bookingData.customer_name}\n` +
            `*Studio:* ${bookingData.studio_name}\n` +
            `*Jadwal:* ${bookingData.booking_date?.split('T')[0]} (${bookingData.start_time} - ${bookingData.end_time} WIB)\n` +
            `*Total Biaya:* Rp ${Number(bookingData.total_price).toLocaleString('id-ID')}\n\n` +
            `Mohon bantuannya untuk verifikasi. Terima kasih!`;
        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-950/80 border border-emerald-600/60 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Terkonfirmasi (Confirmed)
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-sky-950/80 border border-sky-600/60 text-sky-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        Selesai (Completed)
                    </span>
                );
            case 'canceled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-red-950/80 border border-red-600/60 text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Dibatalkan (Canceled)
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-950/80 border border-amber-600/60 text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Menunggu Verifikasi
                    </span>
                );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-xl bg-gradient-to-b from-[#13131c] to-[#0c0c12] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.15)] space-y-6 my-8 overflow-hidden">
                
                {/* Viewfinder Decorative Accents */}
                <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
                <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />
                <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />

                {/* Top Gold Flare */}
                <div className="h-[2px] -mx-8 -mt-8 mb-6 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-neutral-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Tutup"
                >
                    <X size={17} />
                </button>

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 pr-8">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase text-[#D4AF37] mb-1">
                            <Sparkles size={11} />
                            <span>Pratayang Resi Resmi</span>
                        </div>
                        <h3 className="font-display text-2xl font-bold text-white tracking-wider">
                            Voucher Reservasi Atelier
                        </h3>
                    </div>
                </div>

                {/* Resi Box */}
                <div className="bg-[#181824] border border-[#D4AF37]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-0.5">
                            Nomor Resi Pemesanan
                        </span>
                        <span className="font-mono text-2xl font-bold text-[#D4AF37] tracking-wider">
                            {bookingData.booking_code}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {getStatusBadge(bookingData.payment_status)}

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-2 rounded-xl border border-neutral-700 hover:border-[#D4AF37] bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
                            title="Salin Kode Resi"
                        >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                {/* Detailed Information Grid */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3.5 text-xs sm:text-sm">
                    <div className="flex items-start justify-between py-1 border-b border-white/5">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <User size={14} className="text-[#D4AF37]" />
                            <span>Nama Tamu</span>
                        </div>
                        <span className="text-white font-medium text-right">{bookingData.customer_name}</span>
                    </div>

                    <div className="flex items-start justify-between py-1 border-b border-white/5">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Building2 size={14} className="text-[#D4AF37]" />
                            <span>Ruangan Studio</span>
                        </div>
                        <span className="text-white font-medium text-right">{bookingData.studio_name}</span>
                    </div>

                    <div className="flex items-start justify-between py-1 border-b border-white/5">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <CalendarDays size={14} className="text-[#D4AF37]" />
                            <span>Tanggal Pelaksanaan</span>
                        </div>
                        <span className="text-white font-medium text-right font-mono">
                            {bookingData.booking_date?.split('T')[0]}
                        </span>
                    </div>

                    <div className="flex items-start justify-between py-1 border-b border-white/5">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Clock size={14} className="text-[#D4AF37]" />
                            <span>Waktu & Durasi Sesi</span>
                        </div>
                        <span className="text-white font-medium text-right font-mono">
                            {bookingData.start_time} – {bookingData.end_time} WIB
                        </span>
                    </div>

                    {/* Total */}
                    <div className="pt-2 flex items-center justify-between">
                        <span className="text-neutral-300 font-semibold uppercase tracking-wider text-xs">
                            Total Biaya Sewa
                        </span>
                        <span className="font-display text-2xl font-bold text-[#D4AF37]">
                            Rp {Number(bookingData.total_price).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* Terms Brief */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <ShieldCheck size={14} className="text-[#D4AF37] shrink-0" />
                    <span>Harap hadir 15 menit sebelum waktu sesi untuk persiapan alat & koordinasi staf.</span>
                </div>

                {/* Action Buttons: DOWNLOAD AS PDF & WhatsApp & Close */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#A58019] text-black font-bold text-xs tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer flex items-center justify-center gap-2"
                    >
                        <FileDown size={16} />
                        <span>Download sebagai PDF</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleWhatsAppConfirm}
                        className="py-3 px-4 rounded-xl border border-emerald-600/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="Hubungi WhatsApp Admin"
                    >
                        <MessageCircle size={15} />
                        <span>Konfirmasi WA</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="py-3 px-4 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
}
