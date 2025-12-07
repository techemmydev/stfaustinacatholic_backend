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

// Load environment variables
dotenv.config();

// server setup
const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Security Middleware
app.use(helmet()); // Adds security headers

// Rate Limiting (prevents abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body Parser & Logging
app.use(express.json());
app.use(morgan(isProduction ? "combined" : "dev"));

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // local dev frontend
  "https://eventurehall.com", // live frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

// Health Check Route (useful for monitoring)
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
// });

// API Routes
app.use("/api/auth", authRoutes);
// API ROUTES ADMIN CONTROLLER
app.use("/api/admin", adminRoutes);

// 404 Handler
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = isProduction
    ? "Something went wrong!"
    : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && { stack: err.stack }), // Only show stack in development
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  dbConnect();
});
