import express from "express";

// ── Middleware ────────────────────────────────────────────────────────────────
import {
  authenticateAdmin,
  requireAdminOrAbove,
  requireSuperAdmin,
  requireWorkingHours,
} from "../middleware/adminAuth.js";
import { verifyAdmin } from "../middleware/Verifyadmin.js";

// ── Controllers ───────────────────────────────────────────────────────────────
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
  toggleEmergencyAccess,
} from "../controllers/adminController.js";

import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from "../controllers/Adminsettingscontroller.js";

import {
  getParishioners,
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
  getAllMassesAdmin,
} from "../controllers/Masscontroller.js";

import {
  getAllContacts,
  markAsRead,
  markAsResponded,
  deleteContactById,
  submitContact,
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
  getAllDonationsAdmin,
  getDonationStats,
  deleteDonation,
} from "../controllers/Donationcontroller.js";

// ─────────────────────────────────────────────────────────────────────────────
const router = express.Router();
// All routes here are prefixed with /api/admin (see server.js)
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC — login only (no auth or working hours check)
// POST   /api/admin/login
// ══════════════════════════════════════════════════════════════════════════════
router.post("/login", loginAdmin);

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL MIDDLEWARE — applied to every route below this line
//
// authenticateAdmin   → verifies JWT from cookie (desktop) or Bearer token (mobile)
// requireWorkingHours → enforces Mon–Fri 7:30am–4:00pm WAT
//                       Super Admin always bypasses
//                       Admins with active emergency access also bypass
// ══════════════════════════════════════════════════════════════════════════════
router.use(authenticateAdmin, requireWorkingHours);

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// POST   /api/admin/logout
// GET    /api/admin/me
// PUT    /api/admin/change-password
// ══════════════════════════════════════════════════════════════════════════════
router.post("/logout", logoutAdmin);
router.get("/me", getCurrentAdmin);
router.put("/change-password", changePassword);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN PROFILE & SETTINGS
// GET    /api/admin/profile
// PUT    /api/admin/profile
// PUT    /api/admin/password
// ══════════════════════════════════════════════════════════════════════════════
router.get("/profile", verifyAdmin, getAdminProfile);
router.put("/profile", updateAdminProfile);
router.put("/password", updateAdminPassword);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN USER MANAGEMENT  (Super Admin only for create/delete/toggle)
// GET    /api/admin/users
// POST   /api/admin/users
// PUT    /api/admin/users/:id
// PATCH  /api/admin/users/:id/toggle-status
// PATCH  /api/admin/users/:id/emergency-access  ← Super Admin only
// DELETE /api/admin/users/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/users", requireAdminOrAbove, getAllAdmins);
router.post("/users", requireSuperAdmin, createAdmin);
router.put("/users/:id", requireAdminOrAbove, updateAdmin);
router.patch("/users/:id/toggle-status", requireSuperAdmin, toggleAdminStatus);
router.patch(
  "/users/:id/emergency-access",
  requireSuperAdmin,
  toggleEmergencyAccess,
);
router.delete("/users/:id", requireSuperAdmin, deleteAdmin);

// ══════════════════════════════════════════════════════════════════════════════
// PARISHIONERS
// GET    /api/admin/getParishioners
// PATCH  /api/admin/parishioners/:id
// DELETE /api/admin/parishioners/:id
// DELETE /api/admin/parishioners
// ══════════════════════════════════════════════════════════════════════════════
router.get("/getParishioners", getParishioners);
router.patch("/parishioners/:id", updateParishioner);
router.delete("/parishioners/:id", deleteParishioner);
router.delete("/parishioners", deleteAllParishioners);

// ══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// GET    /api/admin/appointments
// PATCH  /api/admin/appointments/:id/approve
// PATCH  /api/admin/appointments/:id/reject
// DELETE /api/admin/appointments/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/appointments", getAllAppointmentsAdmin);
router.patch("/appointments/:id/approve", approveAppointment);
router.patch("/appointments/:id/reject", rejectAppointment);
router.delete("/appointments/:id", deleteAppointment);

// ══════════════════════════════════════════════════════════════════════════════
// TIME SLOTS
// GET    /api/admin/time-slots?date=YYYY-MM-DD
// POST   /api/admin/time-slots
// POST   /api/admin/time-slots/bulk
// PATCH  /api/admin/time-slots/:id
// DELETE /api/admin/time-slots/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/time-slots", getAllSlotsForDate);
router.post("/time-slots", createSlot);
router.post("/time-slots/bulk", createBulkSlots); // must be before /:id
router.patch("/time-slots/:id", updateSlot);
router.delete("/time-slots/:id", deleteSlot);

// ══════════════════════════════════════════════════════════════════════════════
// MASS THANKSGIVING (BOOKINGS)
// GET    /api/admin/thanksgivings
// PATCH  /api/admin/thanksgivings/:id/approve
// PATCH  /api/admin/thanksgivings/:id/reject
// DELETE /api/admin/thanksgivings/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/thanksgivings", getAllThanksgivingsAdmin);
router.patch("/thanksgivings/:id/approve", approveThanksgiving);
router.patch("/thanksgivings/:id/reject", rejectThanksgiving);
router.delete("/thanksgivings/:id", deleteThanksgiving);

// ══════════════════════════════════════════════════════════════════════════════
// MASS SCHEDULE
// GET    /api/admin/mass-schedules
// POST   /api/admin/mass-schedules
// PUT    /api/admin/mass-schedules/:id
// PATCH  /api/admin/mass-schedules/:id/toggle-publish
// DELETE /api/admin/mass-schedules/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/mass-schedules", getAllMassSchedulesAdmin);
router.post("/mass-schedules", createMassSchedule);
router.put("/mass-schedules/:id", updateMassSchedule);
router.patch("/mass-schedules/:id/toggle-publish", toggleMassSchedulePublish);
router.delete("/mass-schedules/:id", deleteMassSchedule);

// ══════════════════════════════════════════════════════════════════════════════
// MASSES
// POST   /api/admin/masses
// POST   /api/admin/masses/bulk
// PATCH  /api/admin/masses/:id
// PATCH  /api/admin/masses/:id/toggle-status
// DELETE /api/admin/masses/:id
// ══════════════════════════════════════════════════════════════════════════════
router.post("/masses", createMass);
router.get("/masses", getAllMassesAdmin);
router.post("/masses/bulk", createBulkMasses); // must be before /:id
router.patch("/masses/:id", updateMass);
router.patch("/masses/:id/toggle-status", toggleMassStatus);
router.delete("/masses/:id", deleteMass);

// ══════════════════════════════════════════════════════════════════════════════
// EVENTS
// GET    /api/admin/events
// POST   /api/admin/events
// PUT    /api/admin/events/:id
// PATCH  /api/admin/events/:id/toggle-publish
// DELETE /api/admin/events/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/events", getAllEventsAdmin);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.patch("/events/:id/toggle-publish", toggleEventPublish);
router.delete("/events/:id", deleteEvent);

// ══════════════════════════════════════════════════════════════════════════════
// SERMONS
// GET    /api/admin/sermons
// POST   /api/admin/sermons
// PUT    /api/admin/sermons/:id
// PATCH  /api/admin/sermons/:id/toggle
// DELETE /api/admin/sermons/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/sermons", getAllSermonsAdmin);
router.post("/sermons", createSermon);
router.put("/sermons/:id", updateSermon);
router.patch("/sermons/:id/toggle", toggleSermonPublished);
router.delete("/sermons/:id", deleteSermon);

// ══════════════════════════════════════════════════════════════════════════════
// GALLERY
// GET    /api/admin/gallery
// POST   /api/admin/gallery
// PUT    /api/admin/gallery/:id
// PATCH  /api/admin/gallery/:id/toggle
// DELETE /api/admin/gallery/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/gallery", getAllPhotosAdmin);
router.post("/gallery", createPhoto);
router.put("/gallery/:id", updatePhoto);
router.patch("/gallery/:id/toggle", togglePhotoPublished);
router.delete("/gallery/:id", deletePhoto);

// ══════════════════════════════════════════════════════════════════════════════
// PRIESTS
// GET    /api/admin/fetchpriests
// POST   /api/admin/createpriest
// PUT    /api/admin/updatepriest/:id
// PATCH  /api/admin/togglepriest/:id
// DELETE /api/admin/deletepriest/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/fetchpriests", getAllPriestsAdmin);
router.post("/createpriest", createPriest);
router.put("/updatepriest/:id", updatePriest);
router.patch("/togglepriest/:id", togglePriestActive);
router.delete("/deletepriest/:id", deletePriest);

// ══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// GET    /api/admin/testimonials
// PATCH  /api/admin/testimonials/:id/approve
// PATCH  /api/admin/testimonials/:id/reject
// PATCH  /api/admin/testimonials/:id/toggle-visibility
// DELETE /api/admin/testimonials/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/testimonials", getAllTestimonialsAdmin);
router.patch("/testimonials/:id/approve", approveTestimonial);
router.patch("/testimonials/:id/reject", rejectTestimonial);
router.patch(
  "/testimonials/:id/toggle-visibility",
  toggleTestimonialVisibility,
);
router.delete("/testimonials/:id", deleteTestimonial);

// ══════════════════════════════════════════════════════════════════════════════
// INVITATIONS
// GET    /api/admin/invitations
// PATCH  /api/admin/invitations/:id/accept
// PATCH  /api/admin/invitations/:id/reject
// DELETE /api/admin/invitations/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/invitations", getAllInvitationsAdmin);
router.patch("/invitations/:id/accept", acceptInvitation);
router.patch("/invitations/:id/reject", rejectInvitation);
router.delete("/invitations/:id", deleteInvitation);

// ══════════════════════════════════════════════════════════════════════════════
// CONTACTS
// POST   /api/admin/contact
// GET    /api/admin/contact
// PATCH  /api/admin/contact/:id/read
// PATCH  /api/admin/contact/:id/responded
// DELETE /api/admin/contact/:id
// ══════════════════════════════════════════════════════════════════════════════
router.post("/contact", submitContact);
router.get("/contact", getAllContacts);
router.patch("/contact/:id/read", markAsRead);
router.patch("/contact/:id/responded", markAsResponded);
router.delete("/contact/:id", deleteContactById);

// ══════════════════════════════════════════════════════════════════════════════
// DONATIONS
// NOTE: /donations/initialize and /donations/stats must come before /donations/:id
//       otherwise Express matches "initialize" and "stats" as :id params.
// GET    /api/admin/donations/initialize  → fetch all donations
// GET    /api/admin/donations/stats       → aggregated stats
// DELETE /api/admin/donations/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/donations/initialize", getAllDonationsAdmin);
router.get("/donations/stats", getDonationStats);
router.delete("/donations/:id", deleteDonation);

export default router;
