import {
  enhancedConfig,
  parseArray,
  parseBoolean,
  parseInteger,
  sanitizeConfigForLogging,
  validateConfiguration,
} from "./enhanced";

const config = enhancedConfig;

config.MONGODB_URI =
  enhancedConfig.MONGODB_URI || "mongodb://localhost:27017/gatekeeper-api";

export {
  config,
  sanitizeConfigForLogging,
  validateConfiguration,
  parseArray,
  parseBoolean,
  parseInteger,
  default as enhancedConfig,
  config as config,
} from "./enhanced";
