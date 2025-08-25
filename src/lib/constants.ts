// App Configuration
export const APP_CONFIG = {
  name: "HireNext",
  description: "Master your interview skills with AI-powered practice sessions. Get real-time feedback and improve your confidence.",
  version: "1.0.0",
  author: "HireNext Team",
  currency: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee"
  }
};

// Navigation Configuration
export const NAV_CONFIG = {
  home: {
    path: "/",
    label: "Home",
  },
  signIn: {
    path: "/sign-in",
    label: "Sign In",
  },
  signUp: {
    path: "/sign-up",
    label: "Sign Up",
  },
  dashboard: {
    path: "/dashboard",
    label: "Dashboard",
  },
  // Admin routes
  admin: {
    dashboard: {
      path: "/admin/dashboard",
      label: "Admin Dashboard",
    },
    recruiters: {
      path: "/admin/recruiters",
      label: "Manage Recruiters",
    },
    analytics: {
      path: "/admin/analytics",
      label: "Analytics",
    },
    settings: {
      path: "/admin/settings",
      label: "Settings",
    },
  },
  // Recruiter routes
  recruiter: {
    dashboard: {
      path: "/recruiter/dashboard",
      label: "Recruiter Dashboard",
    },
    candidates: {
      path: "/recruiter/candidates",
      label: "Manage Candidates",
    },
    interviews: {
      path: "/recruiter/interviews",
      label: "Interviews",
    },
  },
  // Candidate routes
  candidate: {
    dashboard: {
      path: "/candidate/dashboard",
      label: "My Dashboard",
    },
    practice: {
      path: "/candidate/practice",
      label: "Practice Interviews",
    },
    profile: {
      path: "/candidate/profile",
      label: "Profile",
    },
  },
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/dashboard",
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
} as const;

// UI Configuration
export const UI_CONFIG = {
  colors: {
    primary: "indigo",
    secondary: "gray",
    accent: "blue",
  },
  gradients: {
    background: "bg-gradient-to-br from-blue-50 to-indigo-100",
    card: "bg-white shadow-lg rounded-lg",
  },
  spacing: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-12",
  },
} as const;

// User Roles Configuration
export const ROLES = {
  ADMIN: "admin",
  RECRUITER: "recruiter", 
  CANDIDATE: "candidate",
} as const;

// Feature Flags
export const FEATURES = {
  enableMockInterviews: true,
  enableRealTimeFeedback: true,
  enableProgressTracking: true,
  enableSocialFeatures: false,
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 10000,
  retries: 3,
} as const;

// Database Configuration
export const DB_CONFIG = {
  name: "hirenext",
  collections: {
    users: "users",
    interviews: "interviews",
    candidates: "candidates",
    recruiters: "recruiters",
    analytics: "analytics",
  },
  indexes: {
    users: ["email", "role"],
    interviews: ["candidateId", "recruiterId", "status", "scheduledAt"],
    candidates: ["userId", "skills", "experience"],
    recruiters: ["userId", "assignedCandidates"],
  },
} as const;

// Pricing Configuration
export const PRICING_CONFIG = {
  free: {
    price: 0,
    currency: "INR",
    symbol: "₹",
    period: "forever",
    features: [
      "5 practice interviews per month",
      "Basic feedback",
      "Standard question bank",
      "Email support"
    ]
  },
  pro: {
    price: 2499,
    currency: "INR",
    symbol: "₹",
    period: "per month",
    features: [
      "Unlimited practice interviews",
      "Advanced AI feedback",
      "Premium question bank",
      "Performance analytics",
      "Priority support",
      "Custom interview scenarios"
    ]
  },
  enterprise: {
    price: "Custom",
    currency: "INR",
    symbol: "₹",
    period: "Contact us",
    features: [
      "Everything in Pro",
      "Team management",
      "Custom branding",
      "API access",
      "Dedicated support",
      "SLA guarantees"
    ]
  }
} as const;

// SEO Configuration
export const SEO_CONFIG = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  keywords: ["interview", "practice", "AI", "mock interview", "career", "job preparation"],
  ogImage: "/og-image.png",
  twitterHandle: "@aimockinterview",
};

// AI Configuration
export const AI_CONFIG = {
  MODEL: 'gpt-4o-mini',
  TEMPERATURE: {
    LOW: 0.3,    // For analysis and evaluation
    MEDIUM: 0.4, // For planning
    HIGH: 0.7,   // For creative generation
  },
  MAX_TOKENS: {
    SHORT: 500,   // For simple responses
    MEDIUM: 800,  // For analysis
    LONG: 1000,   // For detailed analysis
    EXTENDED: 1500, // For comprehensive responses
  },
} as const;

// Interview Configuration
export const INTERVIEW_CONFIG = {
  DEFAULT_DURATION: 45, // minutes
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 20,
  TIME_PER_QUESTION: 4, // minutes
  QUESTION_DISTRIBUTION: {
    TECHNICAL: 30,
    BEHAVIORAL: 40,
    SITUATIONAL: 20,
    SKILLS: 10,
  },
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  CANDIDATE: 'candidate',
} as const;

// Interview Types
export const INTERVIEW_TYPES = {
  AI_DRIVEN: 'ai-driven',
  MANUAL: 'manual',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  INTERVIEWS: '/api/interviews',
  USERS: '/api/admin/users',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
} as const;

// Database Collections
export const COLLECTIONS = {
  USERS: 'users',
  INTERVIEWS: 'interviews',
  QUESTIONS: 'questions',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  AI_SERVICE_ERROR: 'AI service error',
  DATABASE_ERROR: 'Database error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  INTERVIEW_CREATED: 'Interview created successfully',
  INTERVIEW_STARTED: 'Interview started successfully',
  INTERVIEW_ENDED: 'Interview ended successfully',
  RESPONSE_SUBMITTED: 'Response submitted successfully',
} as const;
