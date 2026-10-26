import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Users, Sparkles, ArrowRight, Camera, SunMedium, Shield, Zap, SlidersHorizontal } from 'lucide-react';
import API from '../services/api';
import TrackBookingSection from '../components/TrackBooking';

export default function Home() {
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);

    // State Filter & Pencarian
    const [searchTerm, setSearchTerm] = useState('');
    const [minCapacity, setMinCapacity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const navigate = useNavigate();

    // Fetch data studio dari API
    useEffect(() => {
        const fetchStudios = async () => {
            try {
                setLoading(true);
                const response = await API.get('/studio');
                setStudios(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching studios:', err);
                setLoading(false);
            }
        };

        fetchStudios();
    }, []);

    // Filter langsung di frontend
    const filteredStudios = studios.filter((studio) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            studio.name.toLowerCase().includes(term) ||
            (studio.description && studio.description.toLowerCase().includes(term));

        const matchesCapacity = minCapacity
            ? studio.capacity >= Number(minCapacity)
            : true;

        const matchesCategory =
            selectedCategory === 'all'
                ? true
                : studio.name.toLowerCase().includes(selectedCategory) ||
                  (studio.description && studio.description.toLowerCase().includes(selectedCategory));

        return matchesSearch && matchesCapacity && matchesCategory;
    });

    return (
        <div className="bg-[#08080a] min-h-screen text-neutral-100 selection:bg-[#D4AF37] selection:text-black">

            {/* ═══════════════════════════════════════════════════════════
                HERO SECTION — Haute Editorial Photography Atelier
            ══════════════════════════════════════════════════════════════ */}
            <section
                id="hero"
                className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden"
            >
                {/* Background image with cinematic overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform transition-transform duration-10000 hover:scale-100"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop')`,
                    }}
                />
                
                {/* Multi-layered cinematic gradient vignettes */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/75 to-[#08080a]/80" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-[#08080a]" />

                {/* Viewfinder metadata overlay badge */}
                <div className="relative z-10 mb-8 inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#D4AF37]/35 bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] animate-fadeIn">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span>ISO 100 · 85MM F/1.4 · 5600K · iDZOEL STUDIO</span>
                </div>

                {/* Main Headline */}
                <div className="relative z-10 max-w-4xl mx-auto space-y-4">
                    <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.12em] text-white uppercase leading-[1.1]">
                        Ruang Cahaya &
                        <span className="block mt-2 font-serif-luxury font-normal italic tracking-normal gold-gradient-text text-5xl sm:text-7xl md:text-8xl">
                            Eksplorasi Seni Visual
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-neutral-300 font-light text-sm sm:text-base tracking-wide leading-relaxed pt-2">
                        Reservasi ruang studio fotografi komersial, portrait, dan editorial dengan peralatan pencahayaan standar industri secara praktis tanpa jeda antrean.
                    </p>
                </div>

                {/* Hero Action CTAs */}
                <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
                    <a
                        href="#katalog"
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#A58019] text-black font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Pilih Ruangan Studio</span>
                        <ArrowRight size={14} />
                    </a>

                    <a
                        href="#track"
                        className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#D4AF37]/50 text-neutral-200 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-black/40 backdrop-blur-sm text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#D4AF37]/5"
                    >
                        Lacak Reservasi Saya
                    </a>
                </div>

                {/* Floating Stats Strip */}
                <div className="relative z-10 mt-16 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-6 py-5 rounded-2xl border border-white/10 bg-[#0e0e14]/70 backdrop-blur-xl">
                    <div className="text-center border-r border-white/5 last:border-0">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-[#D4AF37]">3.5K+</span>
                        <span className="block text-[10px] tracking-widest uppercase text-neutral-400 mt-0.5">Sesi Pemotretan</span>
                    </div>
                    <div className="text-center md:border-r border-white/5">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-white">100%</span>
                        <span className="block text-[10px] tracking-widest uppercase text-neutral-400 mt-0.5">Jadwal Real-Time</span>
                    </div>
                    <div className="text-center border-r border-white/5 last:border-0">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-[#D4AF37]">4.9 / 5</span>
                        <span className="block text-[10px] tracking-widest uppercase text-neutral-400 mt-0.5">Rating Fotografer</span>
                    </div>
                    <div className="text-center">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-white">Pro</span>
                        <span className="block text-[10px] tracking-widest uppercase text-neutral-400 mt-0.5">Lighting Kit Siap</span>
                    </div>
                </div>

                {/* Scroll Prompt */}
                <div className="relative z-10 mt-10 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="text-[9px] tracking-[0.3em] uppercase text-neutral-400 font-mono">Eksplorasi</span>
                    <ChevronDown size={18} className="text-[#D4AF37] animate-bounce" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                EXPERIENCE & PILLARS SECTION
            ══════════════════════════════════════════════════════════════ */}
            <section id="experience" className="py-24 border-y border-white/5 bg-[#0a0a0f] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Section Header */}
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-[#D4AF37] mb-3">
                            <Sparkles size={13} />
                            Standar Kualitas Haute Atelier
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-wider mb-4">
                            Didesain Khusus Bagi Seniman & Kreator
                        </h2>
                        <p className="text-neutral-400 text-sm font-light leading-relaxed">
                            Kami menghadirkan lingkungan kerja fotografi yang presisi, nyaman, dan bebas distraksi demi hasil visual terbaik Anda.
                        </p>
                    </div>

                    {/* 3 Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl border border-neutral-800 bg-[#101017]/80 hover:border-[#D4AF37]/50 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform">
                                <SunMedium size={24} />
                            </div>
                            <h3 className="font-display text-lg font-bold text-white mb-2 tracking-wide">
                                Pencahayaan Presisi
                            </h3>
                            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                                Dilengkapi continuous light, strobe lighting profesional, softbox, beauty dish, dan reflektor premium siap pakai.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-neutral-800 bg-[#101017]/80 hover:border-[#D4AF37]/50 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform">
                                <Shield size={24} />
                            </div>
                            <h3 className="font-display text-lg font-bold text-white mb-2 tracking-wide">
                                Privasi Total Sesi
                            </h3>
                            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                                Ruangan kedap suara dengan sistem kontrol akses privat, ruang ganti eksklusif, dan makeup vanity mirror berlampu CRI tinggi.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-neutral-800 bg-[#101017]/80 hover:border-[#D4AF37]/50 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <h3 className="font-display text-lg font-bold text-white mb-2 tracking-wide">
                                Konfirmasi Cepat & Pasti
                            </h3>
                            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                                Pemilihan jam sewa ala bioskop anti tumpang-tindih (anti double-booking) dengan resi otomatis dan verifikasi instan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                KATALOG STUDIO SECTION
            ══════════════════════════════════════════════════════════════ */}
            <section id="katalog" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-[#D4AF37] mb-2">
                            <span>✦</span>
                            <span>Koleksi Ruang Kreasi</span>
                        </div>
                        <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-wider">
                            Pilihan Studio Tematik
                        </h2>
                    </div>
                    <p className="text-neutral-400 text-xs sm:text-sm max-w-md font-light leading-relaxed">
                        Pilih atmosfer yang sesuai dengan konsep visual portofolio, lookbook busana, prewedding, atau fotografi produk Anda.
                    </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-[#111118]/90 border border-[#D4AF37]/25 rounded-2xl p-5 mb-12 shadow-xl backdrop-blur-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        {/* Search Input */}
                        <div className="md:col-span-6 relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Cari nama studio atau fasilitas (cth: Minimalist, Luxury)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-[#171722] border border-neutral-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none transition-all"
                            />
                        </div>

                        {/* Capacity Select */}
                        <div className="md:col-span-3 relative">
                            <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <select
                                value={minCapacity}
                                onChange={(e) => setMinCapacity(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-[#171722] border border-neutral-700/80 rounded-xl text-white text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none transition-all cursor-pointer appearance-none"
                            >
                                <option value="">Semua Kapasitas</option>
                                <option value="4">Min. 4 Orang</option>
                                <option value="6">Min. 6 Orang</option>
                                <option value="8">Min. 8 Orang</option>
                                <option value="12">Min. 12+ Orang</option>
                            </select>
                        </div>

                        {/* Reset / Count Indicator */}
                        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 text-xs text-neutral-400">
                            <span className="font-mono">
                                Menampilkan: <strong className="text-[#D4AF37]">{filteredStudios.length}</strong> Studio
                            </span>
                            {(searchTerm || minCapacity) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setMinCapacity('');
                                    }}
                                    className="text-xs text-[#D4AF37] hover:underline cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Studios Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28 gap-4">
                        <div className="relative w-12 h-12">
                            <span className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
                            <span className="absolute inset-2 rounded-full bg-[#D4AF37]/10 animate-pulse" />
                        </div>
                        <span className="font-mono text-xs tracking-[0.25em] uppercase text-neutral-400">
                            Memuat Koleksi Atelier...
                        </span>
                    </div>
                ) : filteredStudios.length === 0 ? (
                    <div className="text-center py-24 bg-[#111118]/60 border border-neutral-800 rounded-2xl p-8">
                        <Camera size={36} className="text-neutral-600 mx-auto mb-3" />
                        <h4 className="font-display text-lg text-white mb-1">Tidak Ditemukan Studio</h4>
                        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                            Tidak ada studio yang sesuai kriteria pencarian Anda. Coba ubah kata kunci atau kapasitas.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredStudios.map((studio) => (
                            <div
                                key={studio.id}
                                className="group relative bg-[#0f0f15] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-[#D4AF37]/60 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.12)] hover:-translate-y-1.5"
                            >
                                {/* Studio Photo Showcase */}
                                <div className="relative h-72 w-full overflow-hidden bg-neutral-900">
                                    <img
                                        src={`/studio/${studio.image_url}`}
                                        alt={studio.name}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop';
                                        }}
                                    />

                                    {/* Gradient Shadow Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f15] via-transparent to-black/30" />

                                    {/* Corner Viewfinder Marks */}
                                    <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/60 pointer-events-none group-hover:border-[#D4AF37] transition-colors" />
                                    <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/60 pointer-events-none group-hover:border-[#D4AF37] transition-colors" />

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        {studio.status === 'active' ? (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40">
                                                Tersedia
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/40">
                                                Maintenance
                                            </span>
                                        )}
                                    </div>

                                    {/* Capacity pill floating on image */}
                                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-neutral-300">
                                        <Users size={12} className="text-[#D4AF37]" />
                                        <span>Kapasitas {studio.capacity} Orang</span>
                                    </div>
                                </div>

                                {/* Studio Description & Details */}
                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="font-display text-xl font-bold text-white tracking-wide group-hover:text-[#D4AF37] transition-colors">
                                            {studio.name}
                                        </h3>
                                        <p className="text-neutral-400 text-xs sm:text-sm line-clamp-2 mt-2 leading-relaxed font-light">
                                            {studio.description || 'Studio fotografi berkonsep eksklusif dengan pencahayaan sinematik.'}
                                        </p>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] tracking-widest uppercase text-neutral-400 block">
                                                Tarif Sewa
                                            </span>
                                            <span className="font-display text-lg sm:text-xl font-bold text-[#D4AF37] tracking-wider">
                                                Rp {Number(studio.price_per_hour).toLocaleString('id-ID')}
                                                <span className="text-xs text-neutral-400 font-sans font-normal ml-1">/jam</span>
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/booking/${studio.id}`)}
                                            className="px-5 py-2.5 rounded-full bg-transparent border border-[#D4AF37] text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300 text-xs font-semibold tracking-widest uppercase cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                                        >
                                            <span>Reservasi</span>
                                            <ArrowRight size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════════
                TRACK BOOKING (STATUS RESERVASI) SECTION
            ══════════════════════════════════════════════════════════════ */}
            <section id="track" className="py-24 bg-[#07070a] border-t border-white/5 relative">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <TrackBookingSection />
                </div>
            </section>

        </div>
    );
}
