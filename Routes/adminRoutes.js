import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  getAllMembers,
  getMemberById,
  createAdmin,
  updateMember,
  deleteMember,
} from "../controllers/adminController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();
//Admin Routes

router.post("/create-admin", createAdmin);

router.get("/admin/members", getAllMembers, authenticate, isAdmin);
router.get("/admin/members/:id", getMemberById, authenticate, isAdmin);

router.put("/admin/members/:id", updateMember, authenticate, isAdmin);
router.delete("/admin/members/:id", deleteMember, authenticate, isAdmin);

export default router;
