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
