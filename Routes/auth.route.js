import express from "express";

// ── Middleware ────────────────────────────────────────────────────────────────
import { authenticate } from "../middleware/auth.js";

// ── Controllers ───────────────────────────────────────────────────────────────
import { logoutforAdminandUser } from "../controllers/authController.js";
import { getcookies, postcookies } from "../controllers/CookiesConsnt.js";
import { registerParishioner } from "../controllers/parishController.js";

import {
  submitTestimonial,
  getTestimonials,
} from "../controllers/testimonialController.js";

import { submitInvitation } from "../controllers/invitationController.js";
import { submitContact } from "../controllers/contactController.js";

import { bookAppointment } from "../controllers/bookingAppointmentController.js";
import { getAvailableSlots } from "../controllers/timeSlotController.js";

import {
  getMasses,
  createThanksgiving,
} from "../controllers/thanksgivingController.js";

import { getPublishedEvents } from "../controllers/Eventcontroller.js";
import { getAllMassSchedulesAdmin } from "../controllers/Massschedulecontroller .js";

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

// ─────────────────────────────────────────────────────────────────────────────
const router = express.Router();
// All routes here are prefixed with /api (see server.js)
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// POST  /api/logout
// ══════════════════════════════════════════════════════════════════════════════
router.post("/logout", authenticate, logoutforAdminandUser);

// ══════════════════════════════════════════════════════════════════════════════
// COOKIE CONSENT
// GET   /api/cookies
// POST  /api/cookies
// ══════════════════════════════════════════════════════════════════════════════
router.get("/cookies", getcookies);
router.post("/cookies", postcookies);

// ══════════════════════════════════════════════════════════════════════════════
// PARISHIONERS
// POST  /api/registerParishioner
// ══════════════════════════════════════════════════════════════════════════════
router.post("/registerParishioner", registerParishioner);

// ══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// POST  /api/testimonials  → submit a new testimonial (public form)
// GET   /api/testimonials  → get all approved & visible testimonials
// ══════════════════════════════════════════════════════════════════════════════
router.post("/testimonials", submitTestimonial);
router.get("/testimonials", getTestimonials);

// ══════════════════════════════════════════════════════════════════════════════
// INVITATIONS
// POST  /api/invitations
// ══════════════════════════════════════════════════════════════════════════════
router.post("/invitations", submitInvitation);

// ══════════════════════════════════════════════════════════════════════════════
// CONTACT
// POST  /api/contact
// ══════════════════════════════════════════════════════════════════════════════
router.post("/contact", submitContact);

// ══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS & TIME SLOTS
// GET   /api/appointments/:date  → available slots for a given date
// POST  /api/appointment         → book an appointment
// ══════════════════════════════════════════════════════════════════════════════
router.get("/appointments/:date", getAvailableSlots);
router.post("/appointment", bookAppointment);

// ══════════════════════════════════════════════════════════════════════════════
// MASS THANKSGIVING
// GET   /api/masses      → get all available masses
// POST  /api/thanksgiving → submit a thanksgiving booking
// ══════════════════════════════════════════════════════════════════════════════
router.get("/masses", getMasses);
router.post("/thanksgiving", createThanksgiving);

// ══════════════════════════════════════════════════════════════════════════════
// EVENTS & MASS SCHEDULES  (read-only, published only)
// GET   /api/events
// GET   /api/mass-schedules
// ══════════════════════════════════════════════════════════════════════════════
router.get("/events", getPublishedEvents);
router.get("/mass-schedules", getAllMassSchedulesAdmin);

// ══════════════════════════════════════════════════════════════════════════════
// SERMONS & GALLERY  (read-only, published only)
// GET   /api/sermons
// GET   /api/gallery
// ══════════════════════════════════════════════════════════════════════════════
router.get("/sermons", getAllSermons);
router.get("/gallery", getAllPhotos);

// ══════════════════════════════════════════════════════════════════════════════
// PRIESTS  (read-only)
// GET   /api/priests
// ══════════════════════════════════════════════════════════════════════════════
router.get("/priests", getAllPriests);

// ══════════════════════════════════════════════════════════════════════════════
// DONATIONS (Paystack)
// NOTE: /donations/initialize and /verify/:reference must come before /webhook
// POST  /api/donations/initialize  → create Paystack payment session
// GET   /api/verify/:reference     → verify payment after Paystack redirect
// POST  /api/webhook               → Paystack webhook (register in dashboard)
//
// ⚠️  The webhook route requires the raw request body for HMAC signature
//     verification. Make sure express.raw() is applied to this route in
//     server.js BEFORE express.json() — e.g.:
//     app.use("/api/webhook", express.raw({ type: "application/json" }))
// ══════════════════════════════════════════════════════════════════════════════
router.post("/donations/initialize", initializeDonation);
router.get("/verify/:reference", verifyDonation);
router.post("/webhook", paystackWebhook);

export default router;
