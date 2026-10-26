import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Lock, Clock, Sparkles } from 'lucide-react';
import AdminLoginModal from './AdminLoginModal';

export default function Footer() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        navigate('/admin');
    };

    return (
        <>
            <footer className="relative bg-[#060608] border-t border-[#D4AF37]/25 overflow-hidden">
                {/* Ambient Golden Halo at bottom */}
                <div
                    className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-64 rounded-full pointer-events-none opacity-10 blur-[100px]"
                    style={{ background: 'radial-gradient(ellipse, #D4AF37 0%, transparent 70%)' }}
                />

                {/* Top Subtle Border Glow */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/5">

                        {/* Col 1: Brand & Philosophy (5 cols) */}
                        <div className="md:col-span-5 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center text-[#D4AF37]">
                                    <span className="font-display font-bold text-base">Dz</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display text-2xl font-bold tracking-[0.2em] text-white">
                                        iDZOEL
                                    </span>
                                    <span className="text-[9px] tracking-[0.3em] uppercase text-[#D4AF37]">
                                        Photo Studio
                                    </span>
                                </div>
                            </div>

                            <p className="font-serif-luxury text-lg text-neutral-300 italic leading-relaxed max-w-md">
                                “Setiap detik memiliki kisah, dan setiap cahaya membentuk memori yang abadi. Ruang seni kami didesain khusus untuk karya visual berkualitas tinggi.”
                            </p>

                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <Clock size={14} className="text-[#D4AF37]" />
                                <span>Buka Setiap Hari: 08:00 – 23:00 WIB</span>
                            </div>
                        </div>

                        {/* Col 2: Navigation Links (3 cols) */}
                        <div className="md:col-span-3 space-y-4">
                            {/* <h4 className="font-display text-xs font-bold tracking-[0.25em] uppercase text-[#D4AF37] flex items-center gap-2">
                                <Sparkles size={12} />
                                Navigasi
                            </h4>
                            <ul className="space-y-3 text-xs tracking-wider uppercase text-neutral-400">
                                <li>
                                    <a href="#katalog" className="hover:text-white transition-colors duration-200 block py-0.5">
                                        Koleksi Ruangan Studio
                                    </a>
                                </li>
                                <li>
                                    <a href="#experience" className="hover:text-white transition-colors duration-200 block py-0.5">
                                        Fasilitas & Keunggulan
                                    </a>
                                </li>
                                <li>
                                    <a href="#track" className="hover:text-white transition-colors duration-200 block py-0.5">
                                        Lacak Status Reservasi (Resi)
                                    </a>
                                </li>
                                <li>
                                    <span className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200 cursor-pointer block py-0.5">
                                        Panduan Tata Tertib Studio
                                    </span>
                                </li>
                            </ul> */}
                        </div>

                        {/* Col 3: Direct Concierge & Social (4 cols) */}
                        <div className="md:col-span-4 space-y-4">
                            <h4 className="font-display text-xs font-bold tracking-[0.25em] uppercase text-[#D4AF37]">
                                Kontak & Layanan
                            </h4>
                            <div className="space-y-3 text-xs text-neutral-300">
                                <div className="flex items-start gap-3">
                                    <MapPin size={15} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">
                                        Jl. Gatot Subroto No.170, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={15} className="text-[#D4AF37] shrink-0" />
                                    <a
                                        href="https://wa.me/6289673309449"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-[#D4AF37] transition-colors"
                                    >
                                        +62 896-7330-9449 (WhatsApp)
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={15} className="text-[#D4AF37] shrink-0" />
                                    <span className="text-neutral-400">Idzoel@capturestudio.art</span>
                                </div>
                            </div>

                            {/* Social Icons */}
                            <div className="pt-2 flex items-center gap-3">
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-200"
                                    title="Instagram"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                                <a
                                    href="https://wa.me/6289673309449"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-200"
                                    title="WhatsApp"
                                >
                                    <Phone size={14} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Strip */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
                        <p className="tracking-wider">
                            © {new Date().getFullYear()} iDzoel STUDIO.
                        </p>

                        <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-800 text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-200 cursor-pointer text-[11px] tracking-widest uppercase group"
                        >
                            <Lock size={12} className="text-[#D4AF37]/60 group-hover:text-[#D4AF37]" />
                            <span>Portal Pengelola (Admin)</span>
                        </button>
                    </div>
                </div>
            </footer>

            {/* Admin Login Modal Instance */}
            <AdminLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    );
}
