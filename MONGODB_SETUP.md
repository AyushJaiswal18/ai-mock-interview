# MongoDB Setup Guide

## Overview
This project uses MongoDB as the primary database with Mongoose ODM for data modeling and connection management.

## Setup Options

### Option 1: Local MongoDB (Development)

#### Install MongoDB Community Edition

**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify installation
mongosh
```

**Ubuntu/Debian:**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod
```

#### Environment Variables
Add to your `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/hirenext
```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Shared" cluster (free tier)
   - Select cloud provider and region
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string

6. **Environment Variables**
   Add to your `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirenext?retryWrites=true&w=majority
   ```

## Testing the Connection

### Health Check API
Visit: `http://localhost:3000/api/db/health`

Expected response:
```json
{
  "success": true,
  "database": {
    "status": "healthy",
    "connected": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Manual Testing
```bash
# Test connection in development
npm run dev

# Check console for connection messages:
# ✅ Connected to MongoDB
# ✅ Mongoose connected to MongoDB
```

## Database Structure

### Collections (to be implemented)
- `users` - User profiles and role information
- `interviews` - Interview sessions and results
- `candidates` - Candidate-specific data
- `recruiters` - Recruiter-specific data
- `analytics` - System analytics and metrics

### Indexes (to be implemented)
- Users: `clerkUserId`, `email`, `role`
- Interviews: `candidateId`, `recruiterId`, `status`, `scheduledAt`
- Candidates: `userId`, `skills`, `experience`
- Recruiters: `userId`, `assignedCandidates`

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MongoDB service is running
   - Check if port 27017 is available
   - Verify firewall settings

2. **Authentication Failed**
   - Check username/password in connection string
   - Verify database user permissions
   - Ensure IP is whitelisted (for Atlas)

3. **Network Timeout**
   - Check internet connection (for Atlas)
   - Verify connection string format
   - Check MongoDB service status

### Debug Commands

```bash
# Check MongoDB status (macOS)
brew services list | grep mongodb

# Check MongoDB status (Ubuntu)
sudo systemctl status mongod

# Connect to MongoDB shell
mongosh

# List databases
show dbs

# Use database
use hirenext

# List collections
show collections
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use strong passwords for database users
   - Rotate credentials regularly

2. **Network Security**
   - Use VPN for production connections
   - Whitelist specific IP addresses
   - Enable SSL/TLS encryption

3. **Database Security**
   - Create read-only users for analytics
   - Implement proper access controls
   - Regular security audits

## Performance Optimization

1. **Connection Pooling**
   - Configured with maxPoolSize: 10
   - Automatic connection management
   - Connection reuse for better performance

2. **Indexing**
   - Create indexes on frequently queried fields
   - Monitor query performance
   - Use compound indexes for complex queries

3. **Monitoring**
   - Monitor connection pool usage
   - Track query performance
   - Set up alerts for connection issues
