import { Router } from 'express';
import { submit } from '../controller/insightController.js';
// **********Member***************
const router = Router();
router.get('/inputurl', submit);

export default router;