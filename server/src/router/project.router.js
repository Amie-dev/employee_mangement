import { Router } from 'express';
import { createProject, deleteProject, getAllProject, updateProject } from '../controller/project.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
const router = Router();

// 🔐 Apply JWT verification to all routes in this router
router.use(verifyJWT)



router.get("/all-project",getAllProject)
router.route('/create-project')
        .post(createProject);
router.route("/:projectId")
.patch(updateProject)
.delete(deleteProject)
export default router;
