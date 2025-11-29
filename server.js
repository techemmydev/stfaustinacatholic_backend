import express from "express";
import { dbConnect } from "./db/dbConnect.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./Routes/auth.route.js";
// import { generateToken } from "./utils/generateToken.js";
// Load environment variables
dotenv.config();

// server setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:5173", // local dev frontend
  "https://eventurehall.com", // live frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(cors({ origin: "https://eventurehall.com", credentials: true }));

app.use(cookieParser()); // allows us to parse incoming cookies from the client

// Routes
app.use("/api", authRoutes);

// app.all("*", (req, res) => {
//   res.send("Welcome to Event Hall Services.");
// });

// Default Route
app.all("*", (req, res) => {
  res.status(404).send("Route not found.");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
  dbConnect();
});
