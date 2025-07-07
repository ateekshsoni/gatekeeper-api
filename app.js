//importing necessary modules
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import compression from "compression";

//importing database connection
import { connectDB } from "./src/database/connection.js";

//initializing express app
dotenv.config();
const app = express();

//trust proxy settings for prduction environment
app.set("trust proxy", 1); // trust first proxy

//connecting to the database
connectDB();

//security middlewares
//helmet for setting various HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        stypleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

//general protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(generalLimiter);
app.use(ExpressMongoSanitize());
app.use(hpp());
app.use(compression());

//cors configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || [
      "http://localhost:3000",
      "https://localhost:5173",
    ],
    credentials: true, // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

//request parsers middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

//requiest logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

//routes here

//routes endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Authentication API",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

//health check endpoint
app.get("health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

//404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: ["/api/auth", "/health"],
    timestamp: new Date().toISOString(),
  });
});

app.use((error, req, res, next) => {
  console.error("Error:", error);

  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

//exporting the app
export default app;
