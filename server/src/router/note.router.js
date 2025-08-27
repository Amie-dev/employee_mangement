import {Router} from "express";
import { requireRole } from "../middleware/auth.middleware.js";
import { AvailableUserRole } from "../utils/constent.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controller/note.controller.js";

const router=Router();


router.route("/note/:projectId")
.get(requireRole(AvailableUserRole),getNotes)
.post(requireRole(AvailableUserRole),createNote)

router.route("/:projectId/note/:noteId")
.get(requireRole(AvailableUserRole),getNoteById)
.patch(requireRole(AvailableUserRole),updateNote)
.delete(requireRole(AvailableUserRole),deleteNote)
export default router