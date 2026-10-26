import { LogOut, X, AlertTriangle } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-md bg-[#0e0e14] border border-[#D4AF37]/35 rounded-3xl p-7 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.12)] text-center space-y-6 overflow-hidden">
                
                {/* Viewfinder Decorative Accents */}
                <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
                <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />
                <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/50 pointer-events-none" />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/50 pointer-events-none" />

                {/* Top Crimson/Gold Hairline */}
                <div className="h-[2px] -mx-8 -mt-8 mb-6 bg-gradient-to-r from-transparent via-red-500/80 to-transparent" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-neutral-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Tutup"
                >
                    <X size={16} />
                </button>

                {/* Warning Icon Badge */}
                <div className="w-16 h-16 rounded-2xl border border-red-700/60 bg-gradient-to-br from-red-950/60 to-black flex items-center justify-center text-red-400 mx-auto shadow-[0_0_25px_rgba(239,68,68,0.25)]">
                    <LogOut size={28} strokeWidth={1.75} />
                </div>

                {/* Title & Description */}
                <div>
                    <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-red-400 font-semibold block mb-1">
                        Sesi Pengelola Atelier
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white tracking-wider">
                        Keluar dari Sesi Admin?
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                        Anda akan dialihkan kembali ke website utama. Untuk mengakses dashboard pengelola kembali, Anda harus memasukkan username dan password.
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <LogOut size={14} />
                        <span>Ya, Keluar</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
