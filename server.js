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
  "http://localhost:5173", // Vite dev frontend
  // "https://yourdomain.com", // add your live frontend URL here when deploying
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
// Adds various HTTP headers to protect against common attacks.
// Comes after CORS so it doesn't interfere with preflight responses.
app.use(helmet());

// ── 3. Body parser ────────────────────────────────────────────

app.use("/api/donations/webhook", express.raw({ type: "application/json" }));
// Parses incoming JSON request bodies (req.body)
app.use(express.json());

// ── 4. Cookie parser ──────────────────────────────────────────
// Parses cookies from incoming requests (needed for adminToken cookie auth)
app.use(cookieParser());

// ── 5. Request logging ────────────────────────────────────────
// "combined" gives full Apache-style logs in production,
// "dev" gives concise colorized output in development
app.use(morgan(isProduction ? "combined" : "dev"));

// ── 6. Rate limiting ──────────────────────────────────────────
// Prevents brute-force and abuse by limiting requests per IP.
// In development we skip it entirely so rapid dashboard fetches
// (8+ slices firing at once) don't trigger 429 Too Many Requests.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // max 100 requests per window in production
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // sends RateLimit-* headers (RFC standard)
  legacyHeaders: false, // disables X-RateLimit-* headers (old style)
  skip: () => !isProduction, // ← skip rate limiting completely in development
});

app.use(limiter);

// ── 7. API Routes ─────────────────────────────────────────────

// Public auth routes (login, register, etc.)
app.use("/api/auth", authRoutes);

// Admin routes (protected by verifyAdmin middleware inside each route file)
app.use("/api/admin", adminRoutes);

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
    ...(!isProduction && { stack: err.stack }), // only expose stack trace in dev
  });
});

// ── 10. Start server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server is running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  dbConnect();
});
