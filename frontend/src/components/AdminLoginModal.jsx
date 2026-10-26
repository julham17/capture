import { useState } from 'react';
import { ShieldCheck, AlertCircle, Loader2, X, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import API from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const response = await API.post('/admin/login', { username, password });

            // Simpan token sesi admin
            localStorage.setItem('adminToken', 'true');
            localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
            window.dispatchEvent(new Event('storage'));

            setLoading(false);
            if (onLoginSuccess) {
                onLoginSuccess();
            }
            onClose();
        } catch (err) {
            setLoading(false);
            if (err.response && err.response.data && err.response.data.message) {
                setErrorMsg(err.response.data.message);
            } else {
                setErrorMsg('Kredensial tidak valid atau koneksi server terputus.');
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-[#0e0e12]/95 border border-[#D4AF37]/35 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.12)] overflow-hidden">
                
                {/* Decorative Viewfinder Corners */}
                <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/60 pointer-events-none" />
                <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/60 pointer-events-none" />
                <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/60 pointer-events-none" />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/60 pointer-events-none" />

                {/* Top golden gradient hairline */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                {/* Ambient glow inside */}
                <div
                    className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full pointer-events-none opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, #D4AF37 0%, transparent 70%)' }}
                />

                <div className="relative p-7 sm:p-9 space-y-6">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-full text-neutral-500 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
                        title="Tutup"
                    >
                        <X size={16} />
                    </button>

                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/15 to-transparent text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)]">
                            <ShieldCheck size={26} strokeWidth={1.5} />
                        </div>
                        <div>
                            <span className="text-[10px] tracking-[0.35em] uppercase text-[#D4AF37] font-semibold flex items-center justify-center gap-1">
                                <Sparkles size={11} /> Atelier Control Desk
                            </span>
                            <h3 className="font-display text-2xl font-bold text-white tracking-wider mt-1">
                                Autentikasi Pengelola
                            </h3>
                            <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                                Akses terbatas untuk manajemen jadwal reservasi dan inventaris studio.
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Error Notice */}
                    {errorMsg && (
                        <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800/60 text-red-300 p-3.5 rounded-xl text-xs animate-shake">
                            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                            <span className="leading-relaxed">{errorMsg}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
                                Nama Pengguna (Username)
                            </label>
                            <div className="relative">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white text-sm placeholder-neutral-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 focus:outline-none transition-all duration-200"
                                    placeholder="Masukkan username admin"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
                                Kata Sandi (Password)
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white text-sm placeholder-neutral-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 focus:outline-none transition-all duration-200"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl border border-neutral-700 text-neutral-400 text-xs tracking-wider uppercase font-medium hover:border-neutral-500 hover:text-white transition-all duration-200 cursor-pointer"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl text-black text-xs tracking-wider uppercase font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                style={{
                                    background: 'linear-gradient(135deg, #ECC876 0%, #D4AF37 50%, #9B7D23 100%)',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Memverifikasi...</span>
                                    </>
                                ) : (
                                    'Masuk Portal'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
