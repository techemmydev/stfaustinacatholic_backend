import express from "express";
import { getPublishedEvents } from "../controllers/Eventcontroller.js";
import { getAllMassSchedulesAdmin } from "../controllers/Massschedulecontroller .js";
import { registerParishioner } from "../controllers/parishController.js";
//adminroutes

import { logoutforAdminandUser } from "../controllers/authController.js";
import { getcookies, postcookies } from "../controllers/CookiesConsnt.js";
import { authenticate } from "../middleware/auth.js";

// import {
//   getAvailableSlots,
//   seedSlots,
// } from "../controllers/timeSlotController.js";
import { bookAppointment } from "../controllers/bookingAppointmentController.js";
import { submitContact } from "../controllers/contactController.js";
import { submitInvitation } from "../controllers/invitationController.js";
import {
  submitTestimonial,
  getTestimonials,
} from "../controllers/testimonialController.js";

import {
  getMasses,
  createThanksgiving,
} from "../controllers/thanksgivingController.js";
import { getAvailableSlots } from "../controllers/timeSlotController.js";

import {
  getAllSermons,
  getAllPhotos,
} from "../controllers/Sermoncontroller.js";

import { getAllPriests } from "../controllers/Priestcontroller.js";

import {
  initializeDonation,
  verifyDonation,
  paystackWebhook,
} from "../controllers/Donationcontroller.js";
const router = express.Router();

// Auth Routes
router.post("/registerParishioner", registerParishioner);
router.post("/testimonials", submitTestimonial);
router.post("/invitations", submitInvitation);
// Get all approved and visible testimonials (for public display)
router.get("/testimonials", getTestimonials);
router.get("/appointments/:date", getAvailableSlots);
router.post("/contact", submitContact);
router.get("/sermons", getAllSermons);
router.get("/gallery", getAllPhotos);
// router.get("/masses", getAllMassesAdmin);
router.get("/masses", getMasses);
router.post("/thanksgiving", createThanksgiving);
router.get("/priests", getAllPriests);
// // Time Slot Routes
// router.get("/appointments/:date", getAvailableSlots);
// router.post("/seed/:date", seedSlots);

// Appointment Route
router.post("/appointment", bookAppointment);

router.post("/logout", authenticate, logoutforAdminandUser);

// Cookie Consent Routes
router.get("/cookies", getcookies);
router.post("/cookies", postcookies);
//Event and mass schedule routes are in admin routes since they are only for admin to manage, not for public to access.
router.get("/events", getPublishedEvents);
router.get("/mass-schedules", getAllMassSchedulesAdmin);

// ── Public ───────────────────────────────────────────────────────
// POST /api/donations/initialize
router.post("/donations/initialize", initializeDonation);

// GET  /api/donations/verify/:reference
router.get("/verify/:reference", verifyDonation);

// POST /api/donations/webhook   ← register this URL in Paystack dashboard
// NOTE: raw body needed for signature check — see server.js note below
router.post("/webhook", paystackWebhook);

export default router;
