import { Router } from 'express';
import { businessController } from '../controllers/businessController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.post('/', (req, res, next) => businessController.create(req, res, next));
router.get('/', (req, res, next) => businessController.list(req, res, next));
router.get('/:id', (req, res, next) => businessController.getSummary(req, res, next));
router.delete('/:id', requireRole([Role.OWNER, Role.ADMIN]), (req, res, next) => businessController.delete(req, res, next));

router.get('/:id/section/:section', (req, res, next) => businessController.getSection(req, res, next));
router.put('/:id/section/:section', requireRole([Role.OWNER, Role.ADMIN, Role.MANAGER]), (req, res, next) => businessController.updateSection(req, res, next));

router.get('/:id/audit-history', (req, res, next) => businessController.getAuditHistory(req, res, next));

export default router;
