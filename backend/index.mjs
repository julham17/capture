import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import studioRoute from './route/studioRoute.mjs';
import bookingRoute from './route/bookingRoute.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Daftarkan Endpoint API
app.use('/api/studio', studioRoute);
app.use('/api/booking', bookingRoute);

app.get('/', (req, res) => {
    res.json({ message: 'API Studio Booking Berjalan!' });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});