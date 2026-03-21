import express from "express";
import { dbConnect } from "./db/dbConnect.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./Routes/auth.route.js";
import adminRoutes from "./Routes/adminRoutes.js";

// ── Load environment variables ────────────────────────────────
dotenv.config();

// ── Server setup ──────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// ── 1. CORS — must come FIRST before every other middleware ───
// If CORS runs after helmet or body-parser, preflight OPTIONS
// requests get rejected before the CORS headers are ever added.
const allowedOrigins = [
  // "http://localhost:5173",                // Vite dev — uncomment when developing locally
  "https://stfaustina-parish.vercel.app", // Live frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // REQUIRED: allows cookies (adminToken) to be sent cross-origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── 2. Security headers (helmet) ──────────────────────────────
// Configured to allow Paystack inline popup resources.
// crossOriginEmbedderPolicy disabled so Paystack iframe loads correctly.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://js.paystack.co",
          "https://checkout.paystack.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://paystack.com",
          "https://checkout.paystack.com",
        ],
        frameSrc: ["'self'", "https://checkout.paystack.com"],
        imgSrc: ["'self'", "data:", "https://paystack.com"],
        connectSrc: ["'self'", "https://api.paystack.co"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // required for Paystack iframe
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allows Paystack CSS/JS
  }),
);

// ── 3. Body parser ────────────────────────────────────────────
// Webhook needs raw body for Paystack HMAC signature verification
// Must be registered BEFORE express.json()
app.use("/api/auth/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// ── 4. Cookie parser ──────────────────────────────────────────
// Parses cookies from incoming requests (needed for adminToken cookie auth)
app.use(cookieParser());

// ── 5. Request logging ────────────────────────────────────────
// "combined" gives full Apache-style logs in production,
// "dev" gives concise colorized output in development
app.use(morgan(isProduction ? "combined" : "dev"));

// ── 6. Rate limiting (tiered) ─────────────────────────────────
//
// Professional approach — two separate limiters:
//
//  authLimiter    → login endpoint only (strict: 20 req / 15 min)
//                   prevents brute-force password attacks
//
//  generalLimiter → all other routes (generous: 500 req / 15 min)
//                   supports admin dashboard firing 8+ Redux slices
//                   simultaneously on every page load
//
// Both limiters are skipped entirely in development so local
// testing never hits rate limit errors.

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per window per IP
  message: {
    success: false,
    message: "Too many login attempts, please try again in 15 minutes.",
  },
  standardHeaders: true, // RFC-standard RateLimit-* headers
  legacyHeaders: false, // no X-RateLimit-* headers
  skip: () => !isProduction,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window per IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction,
});

// ── 7. API Routes ─────────────────────────────────────────────

// Strict limiter on login only — must be registered before the general route
app.use("/api/admin/login", authLimiter);

// General limiter applied inline with route registration
app.use("/api/auth", generalLimiter, authRoutes);
app.use("/api/admin", generalLimiter, adminRoutes);

// ── 8. 404 Handler ────────────────────────────────────────────
// Catches any request that doesn't match a registered route
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ── 9. Global error handler ───────────────────────────────────
// Catches errors thrown by routes and middleware via next(err)
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle CORS violations specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation — origin not allowed",
    });
  }

  // Generic error response
  // In production we hide the raw error message for security
  const statusCode = err.statusCode || 500;
  const message = isProduction
    ? "Something went wrong!"
    : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && { stack: err.stack }),
  });
});

// ── 10. Start server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server is running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  dbConnect();
});
