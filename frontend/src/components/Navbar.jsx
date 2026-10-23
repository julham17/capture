import React, { useState, useEffect } from 'react';

export default function Navbar({ scrollToSection }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo */}
                    <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('hero')}>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                            Capture<span className="text-gray-900 dark:text-white"></span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => scrollToSection('katalog')}
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition cursor-pointer"
                        >
                            Katalog Studio
                        </button>
                        <button
                            onClick={() => scrollToSection('track')}
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition cursor-pointer"
                        >
                            🔍 Lacak Booking
                        </button>

                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer text-sm font-semibold flex items-center gap-2"
                        >
                            {isDark ? '☀️ Terang' : '🌙 Gelap'}
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm">
                            {isDark ? '☀️' : '🌙'}
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-2">
                    <button onClick={() => { scrollToSection('katalog'); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700 dark:text-gray-200 font-medium">
                        Katalog Studio
                    </button>
                    <button onClick={() => scrollToSection('track')} className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition cursor-pointer">
                        🔍 Lacak Booking
                    </button>
                </div>
            )}
        </nav>
    );
}