import express from 'express';
import {
    buatBooking,
    lacakBooking,
    getSemuaBooking,
    updateStatusPembayaran,
    getStudioSchedule
} from '../controller/bookingController.mjs';

const router = express.Router();

// Route untuk Klien (Public)
router.post('/', buatBooking);              // POST http://localhost:3000/api/booking
router.get('/track/:kode', lacakBooking);   // GET http://localhost:3000/api/booking/track/STO-123456

// Route untuk Admin
router.get('/', getSemuaBooking);           // GET http://localhost:3000/api/booking
router.put('/:id/status', updateStatusPembayaran); // PUT http://localhost:3000/api/booking/1/status
router.get('/studio/:studioId/schedule', getStudioSchedule); // GET http://localhost:3000/api/booking/studio/1/schedule

export default router;