import {
  enhancedConfig,
  parseArray,
  parseBoolean,
  parseInteger,
  sanitizeConfigForLogging,
  validateConfiguration,
} from "./enhanced.js";

const config = enhancedConfig;

config.MONGO_URI =
  enhancedConfig.MONGODB_URI || "mongodb://localhost:27017/gatekeeper-api";

export {
  config,
  sanitizeConfigForLogging,
  validateConfiguration,
  parseArray,
  parseBoolean,
  parseInteger,
  enhancedConfig,
};