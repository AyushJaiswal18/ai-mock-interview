import { connect } from 'mongoose';
import { User } from '../lib/models/user';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hirenext';

async function cleanupClerkUsers() {
  try {
    // Connect to MongoDB
    await connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find users with clerkId field
    const clerkUsers = await User.find({ clerkId: { $exists: true } });
    console.log(`Found ${clerkUsers.length} users with clerkId field`);

    if (clerkUsers.length > 0) {
      console.log('\n🗑️  Removing Clerk users...');
      
      // Delete users with clerkId
      const result = await User.deleteMany({ clerkId: { $exists: true } });
      
      console.log(`✅ Deleted ${result.deletedCount} Clerk users`);
    } else {
      console.log('✅ No Clerk users found to clean up');
    }

    // Count remaining users
    const remainingUsers = await User.countDocuments();
    console.log(`📊 Total users remaining: ${remainingUsers}`);

  } catch (error) {
    console.error('❌ Error cleaning up Clerk users:', error);
  } finally {
    process.exit(0);
  }
}

cleanupClerkUsers();
