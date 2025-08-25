# Environment Variables Setup

Add this to your `.env.local` file:

```bash
# Existing variables
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
DEEPGRAM_API_KEY=your_deepgram_key
MONGODB_URI=your_mongodb_connection_string

# Add this JWT secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Example strong JWT secret (you can use this or generate your own):
# JWT_SECRET=jwt-secret-super-secure-key-for-ai-interview-system-2024-production-ready
```

The JWT_SECRET should be a long, random string for security. You can generate one using:

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 64

# Option 3: Use a simple secure string
JWT_SECRET=ai-interview-jwt-secret-2024-super-secure-random-string-for-production
```
