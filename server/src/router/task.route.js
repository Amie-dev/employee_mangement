import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../controller/task.controller.js';
import { requireRole, verifyJWT } from '../middleware/auth.middleware.js';
import { AvailableUserRole, userRoleEnum } from '../utils/constent.js';

const router = Router();
router.use(verifyJWT);
router
  .route('/p/:projectId')
  .get(requireRole(AvailableUserRole), getTasks)
  .post(requireRole([userRoleEnum.PROJECT_ADMIN, userRoleEnum.ADMIN]), createTask);

router
  .route('/:taskId/p/:projectId')
  .get(requireRole(AvailableUserRole), getTaskById)
  .patch(requireRole([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]), updateTask)
  .delete(requireRole([userRoleEnum.ADMIN, userRoleEnum.PROJECT_ADMIN]), deleteTask);

router.route('/:taskId/s/p/:projectId').patch(requireRole(AvailableUserRole), updateTaskStatus);
export default router;
