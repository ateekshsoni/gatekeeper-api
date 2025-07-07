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
    windowMs : 15 * 60 * 1000, // 15 minutes
    max : 100, // limit each IP to 100 requests per windowMs
    message : {error : "Too many requests, please try again later."},
    standardHeaders : true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders : false, // Disable the `X-RateLimit-*` headers
})

app.use(generalLimiter);
app.use(ExpressMongoSanitize());
app.use(hpp());
app.use(compression());

//cors configuration