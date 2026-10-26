import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BookingForm from './pages/BookingForm';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);

    return null;
}

function App() {
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
                <Navbar scrollToSection={scrollToSection} />

                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/booking/:studioId" element={<BookingForm />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
}

export default App;
