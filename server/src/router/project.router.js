import { Router } from 'express';
import {
  addProjectMember,
  createProject,
  deleteProject,
  deleteProjectMember,
  getAllProject,
  getProjectById,
  getProjectMember,
  updateProject,
  updateProjectMember,
} from '../controller/project.controller.js';
import {  requireRole, verifyJWT } from '../middleware/auth.middleware.js';
import { userRoleEnum } from '../utils/constent.js';
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
// router.route('/m/:projectId/:memberId').patch(requireProjectAdmin, updateProjectMember).delete(requireProjectAdmin,deleteProjectMember); 

// role-based access control (RBAC)
// router.route('/m/:projectId/:memberId').patch(requireRole([userRoleEnum.PROJECT_ADMIN,userRoleEnum.ADMIN]), updateProjectMember).delete(requireRole([userRoleEnum.ADMIN,userRoleEnum.PROJECT_ADMIN]),deleteProjectMember); 
router.route('/m/:projectId/:memberId').patch( updateProjectMember).delete(deleteProjectMember); 

export default router;
