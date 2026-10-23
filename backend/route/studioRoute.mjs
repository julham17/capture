import express from 'express';
import {
    getSemuaStudio,
    getStudioById,
    tambahStudio,
    updateStudio,
    hapusStudio
} from '../controller/studioController.mjs';

const router = express.Router();

// Route Publik & Admin untuk Studio
router.get('/', getSemuaStudio);            // GET http://localhost:3000/api/studio
router.get('/:id', getStudioById);          // GET http://localhost:3000/api/studio/1
router.post('/', tambahStudio);             // POST http://localhost:3000/api/studio
router.put('/:id', updateStudio);           // PUT http://localhost:3000/api/studio/1
router.delete('/:id', hapusStudio);         // DELETE http://localhost:3000/api/studio/1

export default router;