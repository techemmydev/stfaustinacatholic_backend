import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
  getCurrentAdmin,
  changePassword,
} from "../controllers/adminController.js";
import {
  authenticateAdmin,
  requireAdminOrAbove,
  requireSuperAdmin,
} from "../middleware/adminAuth.js";
import {
  getParishioners,
  // registerParishioner,
  updateParishioner,
  deleteParishioner,
  deleteAllParishioners,
} from "../controllers/parishController.js";
import {
  getAllTestimonialsAdmin,
  approveTestimonial,
  rejectTestimonial,
  toggleTestimonialVisibility,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import {
  getAllInvitationsAdmin,
  acceptInvitation,
  rejectInvitation,
  deleteInvitation,
} from "../controllers/invitationController.js";
import {
  getAllEventsAdmin,
  createEvent,
  updateEvent,
  toggleEventPublish,
  deleteEvent,
} from "../controllers/Eventcontroller.js";
import {
  getAllMassSchedulesAdmin,
  createMassSchedule,
  updateMassSchedule,
  toggleMassSchedulePublish,
  deleteMassSchedule,
} from "../controllers/Massschedulecontroller .js";
import {
  getAllAppointmentsAdmin,
  approveAppointment,
  rejectAppointment,
  deleteAppointment,
} from "../controllers/bookingAppointmentController.js";

import {
  getAllSlotsForDate,
  createSlot,
  createBulkSlots,
  updateSlot,
  deleteSlot,
} from "../controllers/timeSlotController.js";

import {
  createMass,
  createBulkMasses,
  updateMass,
  toggleMassStatus,
  deleteMass,
} from "../controllers/Masscontroller.js";

import {
  getAllContacts,
  markAsRead,
  markAsResponded,
  deleteContactById,
} from "../controllers/contactController.js";

import {
  getAllThanksgivingsAdmin,
  approveThanksgiving,
  rejectThanksgiving,
  deleteThanksgiving,
} from "../controllers/thanksgivingController.js";

import {
  getAllSermonsAdmin,
  createSermon,
  updateSermon,
  toggleSermonPublished,
  deleteSermon,
  getAllPhotosAdmin,
  createPhoto,
  updatePhoto,
  togglePhotoPublished,
  deletePhoto,
} from "../controllers/Sermoncontroller.js";

import {
  getAllPriestsAdmin,
  createPriest,
  updatePriest,
  togglePriestActive,
  deletePriest,
} from "../controllers/Priestcontroller.js";

import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from "../controllers/Adminsettingscontroller.js";
import { verifyAdmin } from "../middleware/Verifyadmin.js";

import {
  getAllDonationsAdmin,
  getDonationStats,
  deleteDonation,
} from "../controllers/Donationcontroller.js";

const router = express.Router();

router.get("/getParishioners", getParishioners);
// router.post("/", registerParishioner); //
router.patch("/:id", updateParishioner);
router.delete("/:id", deleteParishioner);
router.delete("/", deleteAllParishioners);

// Public routes
router.post("/login", loginAdmin);

// Protected routes (require authentication)
router.post("/logout", authenticateAdmin, logoutAdmin);
router.get("/me", authenticateAdmin, getCurrentAdmin);

// Admin management (require Admin or Super Admin)
router.put("/change-password", authenticateAdmin, changePassword);
router.get("/users", authenticateAdmin, requireAdminOrAbove, getAllAdmins);
router.post("/users", authenticateAdmin, requireSuperAdmin, createAdmin);
router.put("/users/:id", authenticateAdmin, requireAdminOrAbove, updateAdmin);
router.patch(
  "/users/:id/toggle-status",
  authenticateAdmin,
  requireSuperAdmin,
  toggleAdminStatus,
);
router.delete("/users/:id", authenticateAdmin, requireSuperAdmin, deleteAdmin);

// ============ PUBLIC ROUTES ============
// These routes are accessible to everyone

// Submit a new testimonial (from public form)

// ============ ADMIN ROUTES ============
// These routes require admin authentication

// Get all testimonials (all statuses)
router.get("/testimonials", getAllTestimonialsAdmin);

// Approve a testimonial
router.patch(
  "/testimonials/:id/approve",
  authenticateAdmin,
  approveTestimonial,
);

// Reject a testimonial
router.patch("/testimonials/:id/reject", authenticateAdmin, rejectTestimonial);

// Toggle testimonial visibility
router.patch(
  "/testimonials/:id/toggle-visibility",
  authenticateAdmin,
  toggleTestimonialVisibility,
);

// Delete a testimonial
router.delete("/testimonials/:id", authenticateAdmin, deleteTestimonial);

// Get all invitations (admin - includes all statuses)
// POST /api/invitations

// Admin routes (add to your adminRoutes.js)
// GET /api/admin/invitations
router.get("/invitations", getAllInvitationsAdmin);

// PATCH /api/admin/invitations/:id/accept
router.patch("/invitations/:id/accept", acceptInvitation);

// PATCH /api/admin/invitations/:id/reject
router.patch("/invitations/:id/reject", rejectInvitation);

// DELETE /api/admin/invitations/:id
router.delete("/invitations/:id", deleteInvitation);

// ============ EVENT ADMIN ROUTES ============
// GET /api/admin/events
router.get("/events", getAllEventsAdmin);

// POST /api/admin/events
router.post("/events", createEvent);

// PUT /api/admin/events/:id
router.put("/events/:id", updateEvent);

// PATCH /api/admin/events/:id/toggle-publish
router.patch("/events/:id/toggle-publish", toggleEventPublish);

// DELETE /api/admin/events/:id
router.delete("/events/:id", deleteEvent);

// ============ MASS SCHEDULE ADMIN ROUTES ============
// GET /api/admin/mass-schedules
router.get("/mass-schedules", getAllMassSchedulesAdmin);

// POST /api/admin/mass-schedules
router.post("/mass-schedules", createMassSchedule);

// PUT /api/admin/mass-schedules/:id
router.put("/mass-schedules/:id", updateMassSchedule);

// PATCH /api/admin/mass-schedules/:id/toggle-publish
router.patch("/mass-schedules/:id/toggle-publish", toggleMassSchedulePublish);

// DELETE /api/admin/mass-schedules/:id
router.delete("/mass-schedules/:id", deleteMassSchedule);

// apoingtment booking
// GET  /api/admin/appointments         → all appointments
router.get("/appointments", authenticateAdmin, getAllAppointmentsAdmin);

// PATCH /api/admin/appointments/:id/approve
router.patch(
  "/appointments/:id/approve",
  authenticateAdmin,
  approveAppointment,
);

// PATCH /api/admin/appointments/:id/reject
router.patch("/appointments/:id/reject", authenticateAdmin, rejectAppointment);

// DELETE /api/admin/appointments/:id
router.delete("/appointments/:id", authenticateAdmin, deleteAppointment);

// GET  /api/admin/time-slots?date=YYYY-MM-DD  → get all slots for a date
router.get("/time-slots", authenticateAdmin, getAllSlotsForDate);

// POST /api/admin/time-slots                  → create a single slot
router.post("/time-slots", authenticateAdmin, createSlot);

// POST /api/admin/time-slots/bulk             → create many slots at once
router.post("/time-slots/bulk", authenticateAdmin, createBulkSlots);

// PATCH /api/admin/time-slots/:id             → update capacity or availability
router.patch("/time-slots/:id", authenticateAdmin, updateSlot);

// DELETE /api/admin/time-slots/:id            → delete a slot (if no bookings)
router.delete("/time-slots/:id", authenticateAdmin, deleteSlot);

// GET /api/admin/thanksgivings
router.get("/thanksgivings", getAllThanksgivingsAdmin);
// router.post("/thanksgivings", submitThanksgiving);

// PATCH /api/admin/thanksgivings/:id/approve
router.patch("/thanksgivings/:id/approve", approveThanksgiving);

// PATCH /api/admin/thanksgivings/:id/reject
router.patch("/thanksgivings/:id/reject", rejectThanksgiving);

// DELETE /api/admin/thanksgivings/:id
router.delete("/thanksgivings/:id", deleteThanksgiving);

// Admin-protected
router.get("/contact", authenticateAdmin, getAllContacts);
router.patch("/contact/:id/read", authenticateAdmin, markAsRead);
router.patch("/contact/:id/responded", authenticateAdmin, markAsResponded);
router.delete("/contact/:id", authenticateAdmin, deleteContactById);

// GET /api/admin/masses
// router.get("/masses", getAllMassesAdmin);

// POST /api/admin/masses
router.post("/masses", createMass);

// POST /api/admin/masses/bulk
router.post("/masses/bulk", createBulkMasses);

// PATCH /api/admin/masses/:id
router.patch("/masses/:id", updateMass);

// PATCH /api/admin/masses/:id/toggle-status
router.patch("/masses/:id/toggle-status", toggleMassStatus);

// DELETE /api/admin/masses/:id
router.delete("/masses/:id", deleteMass);

// ── Admin: Sermons ───────────────────────────────────────
router.get("/sermons", authenticateAdmin, getAllSermonsAdmin);
router.post("/sermons", authenticateAdmin, createSermon);
router.put("/sermons/:id", authenticateAdmin, updateSermon);
router.patch("/sermons/:id/toggle", authenticateAdmin, toggleSermonPublished);
router.delete("/sermons/:id", authenticateAdmin, deleteSermon);

// ── Admin: Gallery ───────────────────────────────────────
router.get("/gallery", authenticateAdmin, getAllPhotosAdmin);
router.post("/gallery", authenticateAdmin, createPhoto);
router.put("/gallery/:id", authenticateAdmin, updatePhoto);
router.patch("/gallery/:id/toggle", authenticateAdmin, togglePhotoPublished);
router.delete("/gallery/:id", authenticateAdmin, deletePhoto);
// ── Admin (protected) ────────────────────────────────────

router.post("/createpriest", authenticateAdmin, createPriest);
router.get("/fetchpriests", authenticateAdmin, getAllPriestsAdmin);
router.put("/updatepriest/:id", authenticateAdmin, updatePriest);
router.patch("/togglepriest/:id", authenticateAdmin, togglePriestActive);
router.delete("/deletepriest/:id", authenticateAdmin, deletePriest);

router.get("/profile", authenticateAdmin, verifyAdmin, getAdminProfile);
router.put("/profile", authenticateAdmin, updateAdminProfile);
router.put("/password", authenticateAdmin, updateAdminPassword);

// ── Admin (protected) ────────────────────────────────────────────
// GET  /api/admin/donations
router.get("/donations/initialize", authenticateAdmin, getAllDonationsAdmin);

// GET  /api/admin/donations/stats
router.get("/donations/stats", authenticateAdmin, getDonationStats);

// DELETE /api/admin/donations/:id
router.delete("/donations/:id", authenticateAdmin, deleteDonation);

export default router;
