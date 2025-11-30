import express from "express";

import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  updateMemberRole,
  getParishStats,
  exportMembers,
} from "../controllers/adminController.js";

import {
  register,
  login,
  logout,
  adminRegister,
  adminLogin,
} from "../controllers/authController.js";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,
} from "../controllers/userController.js";

import { getcookies, postcookies } from "../controllers/CookiesConsnt.js";
const router = express.Router();
// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);

router.post("/logout", logout);

// Admin Routes
router.get("/admin/members", getAllMembers);
router.get("/admin/members/:id", getMemberById);
router.post("/admin/members", createMember);
router.put("/admin/members/:id", updateMember);
router.delete("/admin/members/:id", deleteMember);
router.put("/admin/members/:id/role", updateMemberRole);
router.get("/admin/stats", getParishStats);
router.get("/admin/export", exportMembers);

// Hall Routes
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.put("/me/password", changePassword);
router.delete("/me", deleteMyAccount);

// Cookie Consent Routes
router.get("/cookies", getcookies);
router.post("/cookies", postcookies);

export default router;
// In the above code, we have defined three routes:
