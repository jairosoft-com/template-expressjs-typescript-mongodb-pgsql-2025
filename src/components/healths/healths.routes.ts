import { Router } from 'express';
import * as controller from './healths.controller';

const router = Router();

// Health check endpoints
router.get('/', controller.getHealth);
router.get('/ready', controller.getReadiness);
router.get('/live', controller.getLiveness);

export default router;
