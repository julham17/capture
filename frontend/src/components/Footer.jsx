import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import API from '../services/api';

export default function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate(); // 2. Inisialisasi navigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const response = await API.post('/admin/login', { username, password });

            // Simpan info session login di localStorage
            localStorage.setItem('adminToken', 'true');
            localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

            setLoading(false);
            setIsModalOpen(false);

            // 3. Langsung arahkan ke halaman admin dashboard!
            navigate('/admin');
        } catch (err) {
            setLoading(false);
            if (err.response && err.response.data && err.response.data.message) {
                setErrorMsg(err.response.data.message);
            } else {
                setErrorMsg('Terjadi kesalahan jaringan atau server.');
            }
        }
    };

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    © {new Date().getFullYear()} Capture Studio. All rights reserved.
                </p>
                <div className="flex justify-center items-center gap-4 text-xs mt-3">
                    <span>Capture Studio</span>
                    <span>•</span>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                        🔐 Akses Admin
                    </button>
                </div>
            </div>

            {/* Modal Login Admin */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 text-left">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Login Admin</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Masuk untuk mengelola data booking dan studio.</p>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 p-3.5 rounded-2xl text-xs font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="Masukkan username"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-2xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition shadow-md cursor-pointer disabled:bg-gray-400"
                                >
                                    {loading ? 'Memproses...' : 'Masuk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </footer>
    );
}