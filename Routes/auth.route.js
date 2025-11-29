import express from "express";
import { BookForAnEvent } from "../controllers/bookEvent.js";
import { getAllHalls } from "../controllers/hallController.js";
import { postHall } from "../controllers/hallController.js";
import { submitContactForm } from "../controllers/submitContactForm.js";
import { Subscribers } from "../controllers/SubsscribersController.js";
import {
  getAllFeedbacks,
  postFeedback,
} from "../controllers/FeedbacController.js";
import { getcookies, postcookies } from "../controllers/CookiesConsnt.js";
const router = express.Router();
router.post("/bookings", BookForAnEvent); // GET /api/booking
router.get("/gethalls", getAllHalls); // GET /api/gethalls
router.post("/posthall", postHall); // POST /api/posthall
router.post("/contact", submitContactForm);
router.post("/subscribe", Subscribers);
router.get("/feedbacks", getAllFeedbacks);
router.post("/feedback", postFeedback);
router.get("/cookies", getcookies);
router.post("/cookies", postcookies);

export default router;
// In the above code, we have defined three routes:
