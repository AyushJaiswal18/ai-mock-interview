# Constants and Configuration

This directory contains centralized configuration files for the AI Mock Interview application.

## Files

### `constants.ts`
Centralized constants for the application including:
- **APP_CONFIG**: App name, description, version, and author
- **NAV_CONFIG**: Navigation paths and labels
- **AUTH_CONFIG**: Authentication-related URLs
- **UI_CONFIG**: UI styling and layout constants
- **FEATURES**: Feature flags for enabling/disabling functionality
- **API_CONFIG**: API configuration settings
- **SEO_CONFIG**: SEO metadata and social media settings

### `env.ts`
Environment variables configuration with:
- Type-safe environment variable access
- Validation functions
- Default values for optional variables
- Feature flags

## Usage Examples

### Using App Configuration
```typescript
import { APP_CONFIG } from "@/lib/constants";

// Use app name
<h1>{APP_CONFIG.name}</h1>

// Use app description
<p>{APP_CONFIG.description}</p>
```

### Using Navigation Configuration
```typescript
import { NAV_CONFIG } from "@/lib/constants";

// Use navigation paths
<Link href={NAV_CONFIG.dashboard.path}>
  {NAV_CONFIG.dashboard.label}
</Link>
```

### Using UI Configuration
```typescript
import { UI_CONFIG } from "@/lib/constants";

// Use consistent styling
<div className={UI_CONFIG.gradients.background}>
  <div className={UI_CONFIG.gradients.card}>
    Content
  </div>
</div>
```

### Using Environment Variables
```typescript
import { env } from "@/lib/env";

// Access environment variables safely
const apiUrl = env.API_URL;
const isProduction = env.IS_PRODUCTION;
```

## Benefits

1. **Centralized Management**: All configuration in one place
2. **Type Safety**: TypeScript ensures correct usage
3. **Consistency**: Same values used across the application
4. **Easy Updates**: Change once, updates everywhere
5. **Maintainability**: Clear structure and documentation

## Adding New Constants

1. Add to the appropriate configuration object in `constants.ts`
2. Use `as const` for immutable objects
3. Update this README if needed
4. Import and use in your components

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Optional environment variables:
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (default: "/sign-in")
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (default: "/sign-up")
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (default: "/dashboard")
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (default: "/dashboard")
