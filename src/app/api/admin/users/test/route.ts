import { NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { User } from '@/lib/models/user';

// Simple test endpoint to check database contents
export async function GET() {
  return withDB(async () => {
    try {
      // Get all users from MongoDB
      const users = await User.find({}).lean();
      
      // Get user count
      const totalUsers = await User.countDocuments({});
      
      // Get role counts
      const roleCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalUsers,
          users: users.map(user => ({
            id: user._id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
          })),
          roleCounts: roleCounts.reduce((acc: any, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      console.error('Error in test endpoint:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: error },
        { status: 500 }
      );
    }
  });
}
