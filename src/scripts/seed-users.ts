import bcrypt from 'bcryptjs';
import { connect } from 'mongoose';
import { User } from '../lib/models/user';
import { ROLES } from '../lib/constants';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hirenext';

const users = [
  {
    email: 'admin@hirenext.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: ROLES.ADMIN,
  },
  {
    email: 'recruiter@hirenext.com',
    password: 'recruiter123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: ROLES.RECRUITER,
  },
  {
    email: 'candidate@hirenext.com',
    password: 'candidate123',
    firstName: 'John',
    lastName: 'Doe',
    role: ROLES.CANDIDATE,
  },
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔐 Creating demo users...\n');

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await User.create({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: true,
        metadata: {
          profileComplete: true,
          onboardingStep: 1,
        }
      });

      console.log(`✅ Created ${userData.role} user:`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
      console.log(`   User ID: ${user._id}\n`);
    }

    console.log('🎉 All demo users created successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:');
    console.log('   Email: admin@hirenext.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👔 Recruiter:');
    console.log('   Email: recruiter@hirenext.com');
    console.log('   Password: recruiter123');
    console.log('');
    console.log('👤 Candidate:');
    console.log('   Email: candidate@hirenext.com');
    console.log('   Password: candidate123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    process.exit(0);
  }
}

seedUsers();
