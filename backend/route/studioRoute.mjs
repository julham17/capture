import express from 'express';
import {
    upload,
    getSemuaStudio,
    getStudioById,
    tambahStudio,
    updateStudio,
    hapusStudio,
    getStudios
} from '../controller/studioController.mjs';

const router = express.Router();

// Route Publik & Admin untuk Studio dengan Middleware Upload Multer
router.get('/', getSemuaStudio);
router.get('/studios', getStudios);
router.get('/:id', getStudioById);
router.post('/', upload.single('image'), tambahStudio);
router.put('/:id', upload.single('image'), updateStudio);
router.delete('/:id', hapusStudio);

export default router;