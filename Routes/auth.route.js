import express from "express";

import { userAndAdminParishregistration } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";
import {
  updateMyProfile,
  changePassword,
} from "../controllers/userController.js";

import { logoutforAdminandUser } from "../controllers/authController.js";
import { getcookies, postcookies } from "../controllers/CookiesConsnt.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Auth Routes
router.post("/register", userAndAdminParishregistration);
router.post("/login", login, isAdmin);
router.post("/logout", authenticate, logoutforAdminandUser);

router.put("/me", updateMyProfile);
router.put("/me/password", changePassword);

// Cookie Consent Routes
router.get("/cookies", getcookies);
router.post("/cookies", postcookies);

export default router;
