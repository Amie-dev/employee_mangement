import { Router } from 'express';
import {
  addProjectMember,
  createProject,
  deleteProject,
  getAllProject,
  getProjectById,
  getProjectMember,
  updateProject,
  updateProjectMember,
} from '../controller/project.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
const router = Router();

// 🔐 Apply JWT verification to all routes in this router
router.use(verifyJWT);

// Project routes
router.get('/all-project', getAllProject);
router.post('/create-project', createProject);
router.route('/:projectId').get(getProjectById).patch(updateProject).delete(deleteProject);

// Project member routes
router.route('/m/:projectId').post(addProjectMember).get(getProjectMember)
// router.post('/m/:projectId', addProjectMember); // Add member to project
// router.get('/m/:projectId', getProjectMember); // Get members of project
router.patch('/m/:projectId/:memberId', updateProjectMember); // Update member role

export default router;
