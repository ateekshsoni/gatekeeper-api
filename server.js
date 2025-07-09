import http from "http";
import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { start } from "repl";
import { config } from "./src/config/index.js";

const PORT = process.env.PORT || 3000;
const host = process.env.HOST || "localhost" || "0.0.0.0";

const server = http.createServer(app);

//configure server timout for better performance
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

server.setMaxListeners(20); // Set max listeners to prevent memory leaks

//sever startup with error handling

const startServer = () => {
  try {
    console.log("starting server...");
    console.log(`Server is running on http://${host}:${PORT}`);

    //start the server
    server.listen(PORT, host, () => {
      console.log("server started successfully");
      console.log(`🌍 Server is running at http://${host}:${PORT}`);
      console.log(`🏥 Health check: http://${host}:${PORT}/health`);
      console.log(
        `📊 Memory usage: ${Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        )} MB`
      );
      console.log(`⏱️  Startup time: ${process.uptime().toFixed(2)} seconds`);
    });
    //handle server errors
    server.on("error", (error) => {
      if (error.syscall !== "listen") {
        throw error;
      }
      const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;

      switch (error.code) {
        case "EACCES":
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(`❌ ${bind} is already in use`);
          console.log(
            `💡 Try: npm run kill:port or lsof -ti:${PORT} | xargs kill -9`
          );
          process.exit(1);
          break;
        default:
          console.error(`❌ Server error:`, error);
          throw error;
      }
    });

    server.on("listening", () => {
      const addr = server.address();
      const bind =
        typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`✅ Server is listening on ${bind}`);
    });
  } catch (error) {
    console.error("Error while starting server:", error);
    process.exit(1); // Exit the process if server fails to start
  }
};

//graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n ${signal} received. Shutting down gracefully...`);

  const shutdownTimeout = setTimeout(() => {
    console.error("Forcefully shutting down due to timeout");
    process.exit(1);
  }, 3000); // 30 seconds timeout

  server.close(async () => {
    console.log("http server closed");
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
      }
      clearTimeout(shutdownTimeout);
      console.log("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  });
  server.closeAllConnections?.();
};

//Error handling
//graceful shutdown on process termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown); // Ctrl+C

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  console.error("Stack trace:", err.stack);

  gracefulShutdown("Uncaught Exception");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  console.error("Stack trace:", reason.stack);

  gracefulShutdown("Unhandled Rejection");
});
process.on("warning", (warning) => {
  console.warn("Process Warning:", warning.name);
  console.warn("Message:", warning.message);
  console.warn("Stack trace:", warning.stack);
});

if (config.NODE_ENV !== "test") {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(2) + " MB";
    console.log(`Memory Usage:
      Heap Total: ${formatMB(memUsage.heapTotal)},
      Heap Used: ${formatMB(memUsage.heapUsed)},  
      RSS: ${formatMB(memUsage.rss)},
      External: ${formatMB(memUsage.external)},
      Array Buffers: ${formatMB(memUsage.arrayBuffers)}`);
  }, 60000); // Log memory usage every minute
} else {
  console.log("Running in test mode, server not started");
  server.on("listening", () => {
    console.log("Test server is listening");
  });
}

startServer();
