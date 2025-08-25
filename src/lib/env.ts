// Environment Variables Configuration
export const env = {
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/hirenext",
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "your-jwt-secret-key",
  
  // AI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "",
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || "",
  
  // App Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true",
} as const;

// Validation function to ensure required environment variables are present
export function validateEnv() {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "OPENAI_API_KEY",
    "ELEVENLABS_API_KEY",
    "DEEPGRAM_API_KEY",
  ];

  for (const var_name of required) {
    if (!process.env[var_name]) {
      throw new Error(`Missing required environment variable: ${var_name}`);
    }
  }
}

// Export a function to get environment variables with type safety
export function getEnvVar(key: keyof typeof env): string | boolean {
  const value = env[key];
  if (value === undefined || value === null) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}