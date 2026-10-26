import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import AdminLoginModal from './AdminLoginModal';

export default function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('adminToken') === 'true';
    });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');
            setIsAuthenticated(token === 'true');
        };

        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setIsLoginModalOpen(false);
    };

    // Jika belum login, tampilkan layar pengaman akses khusus
    if (!isAuthenticated) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#08080a]">
                <div className="relative max-w-md w-full bg-[#0e0e14] border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] text-center space-y-6 overflow-hidden">
                    
                    {/* Viewfinder Decorative Accents */}
                    <span className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37]/50" />
                    <span className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37]/50" />
                    <span className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37]/50" />
                    <span className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37]/50" />

                    {/* Top hairline */}
                    <div className="h-[2px] -mx-10 -mt-10 mb-6 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                    <div className="w-16 h-16 rounded-2xl border border-red-800/60 bg-red-950/30 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-950/50">
                        <ShieldAlert size={32} strokeWidth={1.5} />
                    </div>

                    <div>
                        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#D4AF37] flex items-center justify-center gap-1">
                            <Sparkles size={11} />
                            Area Terproteksi
                        </span>
                        <h2 className="font-display text-2xl font-bold text-white tracking-wider mt-1">
                            Akses Pengelola Diperlukan
                        </h2>
                        <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                            Halaman Dashboard Admin hanya dapat diakses oleh pengelola studio yang terautentikasi. Silakan login terlebih dahulu untuk melanjutkan.
                        </p>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#A58019] text-black font-bold text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Lock size={14} />
                            <span>Login Akun Admin</span>
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 px-6 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ArrowLeft size={14} />
                            <span>Kembali ke Beranda Tamu</span>
                        </button>
                    </div>
                </div>

                <AdminLoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            </div>
        );
    }

    return children;
}
