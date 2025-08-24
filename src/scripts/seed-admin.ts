import bcrypt from 'bcryptjs';
import { connect } from 'mongoose';
import { User } from '../lib/models/user';
import { ROLES } from '../lib/constants';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hirenext';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hirenext.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@hirenext.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: ROLES.ADMIN,
      isActive: true,
      metadata: {
        profileComplete: true,
        onboardingStep: 1,
      }
    });

    console.log('✅ Admin user created successfully');
    console.log('Email: admin@hirenext.com');
    console.log('Password: admin123');
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
