import express from 'express';
import { loginAdmin } from '../controller/adminController.mjs';

const router = express.Router();

router.post('/login', loginAdmin);

export default router;