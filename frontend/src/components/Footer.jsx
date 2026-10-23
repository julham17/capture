import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleAdminLogin = (e) => {
        e.preventDefault();
        // Login sederhana untuk demo Tugas Akhir
        if (username === 'admin' && password === 'admin123') {
            setShowLoginModal(false);
            navigate('/admin');
        } else {
            alert('Username atau Password Admin salah!');
        }
    };

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    © {new Date().getFullYear()} StudioFoto Manager. All rights reserved.
                </p>
                <div className="flex justify-center items-center gap-4 text-xs mt-3">
                    <span>Sistem Pemesanan Studio Foto Tugas Akhir</span>
                    <span>•</span>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                        🔐 Akses Admin
                    </button>
                </div>
            </div>

            {/* Modal Login Admin */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Admin</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Masuk untuk mengelola data booking dan studio.</p>

                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Masukkan username"
                                    className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLoginModal(false)}
                                    className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium shadow-md cursor-pointer"
                                >
                                    Masuk
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </footer>
    );
}