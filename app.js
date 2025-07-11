//importing necessary modules
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";

//importing database connection
import { connectDB } from "./src/database/connection.js";
import { config } from "./src/config/index.js";

//importing routes
import authRoutes from "./src/routes/auth.routes.js";

//initializing express app
const app = express();

//trust proxy settings for production environment
app.set("trust proxy", 1);

//connecting to the database
connectDB();

//request logging in production
if (config.isProduction) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

//security middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);

//general protection
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
  max: config.RATE_LIMIT_MAX_REQUESTS || 100,
  message: { 
    success: false,
    error: "Too many requests, please try again later." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use(hpp());
app.use(compression());

//cors configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = config.CLIENT_URL ? 
        config.CLIENT_URL.split(',') : 
        ["http://localhost:3000", "http://localhost:5173"];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "X-HTTP-Method-Override",
      "Accept",
      "Cache-Control"
    ],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 86400, // 24 hours
  })
);

//request parsers middlewares
app.use(express.json({ 
  limit: "10mb",
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: "Invalid JSON"
      });
      return;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);

//root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to GateKeeper Authentication API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      health: "/health"
    }
  });
});

//health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    environment: config.NODE_ENV
  });
});

//404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: "/api/auth",
      health: "/health",
      docs: "/api/docs"
    },
    timestamp: new Date().toISOString(),
  });
});

//global error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);

  // Don't leak sensitive information in production
  const isDevelopment = config.NODE_ENV === "DEVELOPMENT";
  
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || "Internal Server Error";

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = "Validation Error";
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { 
      stack: error.stack,
      details: error
    }),
  });
});

//exporting the app
export default app;
