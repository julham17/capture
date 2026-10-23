import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BookingForm from './pages/BookingForm';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
                <Navbar scrollToSection={scrollToSection} />

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/booking/:studioId" element={<BookingForm />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
}

export default App;