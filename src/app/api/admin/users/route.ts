import { NextRequest, NextResponse } from 'next/server';
import { ROLES } from '@/lib/constants';
import { UserRole, isValidRole } from '@/lib/auth';
import { withDB } from '@/lib/db-utils';
import { User } from '@/lib/models/user';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth-middleware';

// Get users with filtering and pagination
export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {

      const { searchParams } = new URL(request.url);
      
      // Pagination
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;

      // Sorting
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      // Build filter query
      const filter: any = {};

      // Search filter
      const search = searchParams.get('search');
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Role filter
      const roles = searchParams.get('roles');
      if (roles) {
        const roleArray = roles.split(',').filter(role => isValidRole(role));
        if (roleArray.length > 0) {
          filter.role = { $in: roleArray };
        }
      }

      // Status filter
      const status = searchParams.get('status');
      if (status) {
        const statusArray = status.split(',');
        if (statusArray.includes('active') && statusArray.includes('inactive')) {
          // Show all
        } else if (statusArray.includes('active')) {
          filter.isActive = true;
        } else if (statusArray.includes('inactive')) {
          filter.isActive = false;
        }
      }

      // Date range filter
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Last login filter
      const lastLoginFrom = searchParams.get('lastLoginFrom');
      const lastLoginTo = searchParams.get('lastLoginTo');
      if (lastLoginFrom || lastLoginTo) {
        filter.lastLoginAt = {};
        if (lastLoginFrom) filter.lastLoginAt.$gte = new Date(lastLoginFrom);
        if (lastLoginTo) filter.lastLoginAt.$lte = new Date(lastLoginTo);
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const [users, total] = await Promise.all([
        User.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(filter)
      ]);

      console.log('Found users:', users.length);
      console.log('Total users:', total);
      console.log('Filter:', filter);

      // Get role counts for filter display
      const roleCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      const roleCountMap = roleCounts.reduce((acc: any, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
          filters: {
            roleCounts: roleCountMap,
            totalActive: await User.countDocuments({ isActive: true }),
            totalInactive: await User.countDocuments({ isActive: false }),
          }
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
