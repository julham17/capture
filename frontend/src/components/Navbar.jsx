import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, Sparkles, Globe, LogOut, ShieldCheck, ArrowRight } from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar({ scrollToSection }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') === 'true');
    const [adminUser, setAdminUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('adminUser') || '{}');
        } catch {
            return {};
        }
    });

    const navigate = useNavigate();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        const syncAuth = () => {
            setAdminToken(localStorage.getItem('adminToken') === 'true');
            try {
                setAdminUser(JSON.parse(localStorage.getItem('adminUser') || '{}'));
            } catch {
                setAdminUser({});
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('storage', syncAuth);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', syncAuth);
        };
    }, []);

    // Re-check auth whenever route changes
    useEffect(() => {
        setAdminToken(localStorage.getItem('adminToken') === 'true');
        try {
            setAdminUser(JSON.parse(localStorage.getItem('adminUser') || '{}'));
        } catch {
            setAdminUser({});
        }
    }, [location.pathname]);

    const handleNavClick = (sectionId) => {
        setIsMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else if (scrollToSection) {
            scrollToSection(sectionId);
        } else {
            const element = document.getElementById(sectionId);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleAdminLogout = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdminToken(false);
        setShowLogoutModal(false);
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-500 ${
                scrolled
                    ? 'bg-[#08080a]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 shadow-2xl shadow-black/80'
                    : 'bg-[#08080a]/60 backdrop-blur-md border-b border-white/5'
            }`}
        >
            {/* Top golden hairline accent */}
            <div className={`h-[1px] w-full ${isAdminRoute ? 'bg-gradient-to-r from-transparent via-amber-500/70 to-transparent' : 'bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent'}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">

                    {/* ══════════════════════════════════════════════════════
                        LOGO BRAND: Menyesuaikan mode Admin atau User
                    ══════════════════════════════════════════════════════ */}
                    <div
                        className="flex items-center gap-3.5 cursor-pointer group select-none"
                        onClick={() => navigate(isAdminRoute ? '/admin' : '/')}
                    >
                        <div className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                            isAdminRoute
                                ? 'border-amber-500/60 bg-gradient-to-br from-amber-500/20 to-black text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                                : 'border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-black text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                        }`}>
                            <span className="font-display text-lg font-bold tracking-wider">Dz</span>
                            <span className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${isAdminRoute ? 'bg-amber-400' : 'bg-[#D4AF37]'}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.2em] text-white flex items-center gap-1.5">
                                iDZOEL
                                {isAdminRoute ? (
                                    <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold uppercase">
                                        ADMIN
                                    </span>
                                ) : (
                                    <span className="text-[#D4AF37] text-xs font-normal">✦</span>
                                )}
                            </span>
                            <span className="text-[9px] tracking-[0.35em] uppercase text-neutral-400 font-light -mt-0.5">
                                {isAdminRoute ? 'Executive Control Desk' : 'Photo Studio'}
                            </span>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════
                        NAVBAR KONTEN: JIKA TAMPILAN ADMIN
                    ══════════════════════════════════════════════════════ */}
                    {isAdminRoute ? (
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            
                            {/* Tombol Lihat Website Publik */}
                            <button
                                onClick={() => navigate('/')}
                                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-700 hover:border-[#D4AF37] bg-neutral-900/60 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
                                title="Buka website tamu"
                            >
                                <Globe size={13} className="text-[#D4AF37]" />
                                <span>Lihat Website Tamu</span>
                            </button>

                            {/* Badge Pengguna Admin */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-neutral-900/40 text-xs text-neutral-300">
                                <ShieldCheck size={14} className="text-emerald-400" />
                                <span className="font-mono text-[11px] text-[#D4AF37] font-medium">
                                    {adminUser.username || 'Admin'}
                                </span>
                            </div>

                            {/* Dark/Light Toggle 
                            <button
                                onClick={() => setIsDark(!isDark)}
                                aria-label="Toggle theme"
                                className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-[#D4AF37] transition-all cursor-pointer"
                            >
                                {isDark ? <Sun size={17} className="text-[#D4AF37]" /> : <Moon size={17} />}
                            </button>*/}

                            {/* Tombol Keluar / Logout */}
                            {/* <button
                                onClick={handleAdminLogout}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-800/60 bg-red-950/40 text-red-300 hover:bg-red-900/50 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">Keluar</span>
                            </button> */}
                        </div>
                    ) : (
                        /* ══════════════════════════════════════════════════════
                            NAVBAR KONTEN: JIKA TAMPILAN USER
                        ══════════════════════════════════════════════════════ */
                        <>
                            <div className="hidden md:flex items-center space-x-7">
                                <NavLink onClick={() => handleNavClick('experience')}>
                                    Keunggulan
                                </NavLink>
                                
                                <NavLink onClick={() => handleNavClick('katalog')}>
                                    Koleksi Ruangan
                                </NavLink>
                                
                                <NavLink onClick={() => handleNavClick('track')}>
                                    Lacak Reservasi
                                </NavLink>

                                {/* Pintasan Kembali ke Admin jika Sedang Login */}
                                {adminToken && (
                                    <Link
                                        to="/admin"
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-950/30 text-amber-300 text-[11px] font-mono tracking-wider hover:border-amber-400 transition-all"
                                    >
                                        <ShieldCheck size={12} className="text-amber-400" />
                                        <span>Dashboard Admin</span>
                                    </Link>
                                )}

                                <div className="h-4 w-px bg-white/10" />

                                {/* Theme Toggle 
                                <button
                                    onClick={() => setIsDark(!isDark)}
                                    aria-label="Toggle mode"
                                    className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-[#D4AF37] transition-all cursor-pointer"
                                >
                                    {isDark ? <Sun size={17} className="text-[#D4AF37]" /> : <Moon size={17} />}
                                </button>*/}

                                {/* Direct Booking CTA */}
                                <button
                                    onClick={() => handleNavClick('katalog')}
                                    className="relative group overflow-hidden px-5 py-2.5 rounded-full border border-[#D4AF37]/60 text-xs font-semibold tracking-widest uppercase transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative z-10 text-[#D4AF37] group-hover:text-black flex items-center gap-2 transition-colors duration-300">
                                        <Sparkles size={13} />
                                        Reservasi Studio
                                    </span>
                                </button>
                            </div>

                            {/* Mobile Controls */}
                            <div className="flex md:hidden items-center gap-2.5">
                                {/* 
                                <button
                                    onClick={() => setIsDark(!isDark)}
                                    aria-label="Toggle mode"
                                    className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-[#D4AF37]"
                                >
                                    {isDark ? <Sun size={17} className="text-[#D4AF37]" /> : <Moon size={17} />}
                                </button>*/}
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    aria-label="Toggle menu"
                                    className="p-2 rounded-xl border border-[#D4AF37]/30 text-white hover:border-[#D4AF37] bg-white/5"
                                >
                                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>

            {/* Mobile Navigation Drawer (Hanya untuk User) */}
            {!isAdminRoute && (
                <div
                    className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
                        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="border-t border-[#D4AF37]/20 bg-[#0c0c10]/98 backdrop-blur-2xl px-6 py-6 space-y-4">
                        <button
                            onClick={() => handleNavClick('experience')}
                            className="w-full text-left py-2.5 text-sm font-medium tracking-wider uppercase text-neutral-300 hover:text-[#D4AF37] border-b border-white/5 flex items-center justify-between"
                        >
                            <span>Keunggulan & Fasilitas</span>
                            <ArrowRight size={14} className="text-[#D4AF37]" />
                        </button>

                        <button
                            onClick={() => handleNavClick('katalog')}
                            className="w-full text-left py-2.5 text-sm font-medium tracking-wider uppercase text-neutral-300 hover:text-[#D4AF37] border-b border-white/5 flex items-center justify-between"
                        >
                            <span>Koleksi Ruangan Studio</span>
                            <ArrowRight size={14} className="text-[#D4AF37]" />
                        </button>
                        
                        <button
                            onClick={() => handleNavClick('track')}
                            className="w-full text-left py-2.5 text-sm font-medium tracking-wider uppercase text-neutral-300 hover:text-[#D4AF37] border-b border-white/5 flex items-center justify-between"
                        >
                            <span>Lacak Reservasi (Resi)</span>
                            <ArrowRight size={14} className="text-[#D4AF37]" />
                        </button>

                        {adminToken && (
                            <Link
                                to="/admin"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full py-2.5 text-sm font-mono tracking-wider uppercase text-amber-300 border-b border-white/5 flex items-center justify-between"
                            >
                                <span>Masuk Dashboard Admin</span>
                                <ShieldCheck size={16} />
                            </Link>
                        )}

                        <div className="pt-2">
                            <button
                                onClick={() => handleNavClick('katalog')}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} />
                                Reservasi Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Konfirmasi Keluar Admin */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleConfirmLogout}
            />
        </header>
    );
}

function NavLink({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="group relative text-xs font-medium tracking-[0.2em] uppercase text-neutral-300 hover:text-white transition-colors duration-300 cursor-pointer py-1"
        >
            <span>{children}</span>
            <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] transition-all duration-300 group-hover:w-full" />
        </button>
    );
}
