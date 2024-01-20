import { Router } from 'express';
import { submit } from '../controller/insightController.js';
// **********Member***************
const router = Router();
router.get('/audit', submit);

export default router;