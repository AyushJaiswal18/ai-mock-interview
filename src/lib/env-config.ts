import { config } from 'dotenv';
import { resolve } from 'path';

// Configure environment variables once at startup
let isConfigured = false;

export function configureEnv() {
  if (!isConfigured) {
    config({ path: resolve(process.cwd(), '.env.local') });
    isConfigured = true;
  }
}

// Auto-configure on import in server environment
if (typeof window === 'undefined') {
  configureEnv();
}
