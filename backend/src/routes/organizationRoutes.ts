import { Router } from 'express';
import { organizationController } from '../controllers/organizationController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => organizationController.getDetails(req, res, next));
router.put('/', requireRole([Role.OWNER, Role.ADMIN]), (req, res, next) => organizationController.updateDetails(req, res, next));
router.get('/audit-logs', requireRole([Role.OWNER, Role.ADMIN]), (req, res, next) => organizationController.getAuditLogs(req, res, next));

export default router;
