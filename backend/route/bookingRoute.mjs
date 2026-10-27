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
router.post('/', buatBooking);        
router.get('/track/:kode', lacakBooking);

// Route untuk Admin
router.get('/', getSemuaBooking);
router.put('/:id/status', updateStatusPembayaran);
router.get('/studio/:studioId/schedule', getStudioSchedule);

export default router;