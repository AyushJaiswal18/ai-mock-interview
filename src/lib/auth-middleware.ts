import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { User } from './models/user';
import { withDB } from './db-utils';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedRequest> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return request as AuthenticatedRequest;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return request as AuthenticatedRequest;
  }

  // Verify user exists and is active
  const user = await withDB(async () => {
    return await User.findById(payload.userId).select('_id email role isActive').lean();
  }) as any;

  if (!user || !user.isActive) {
    return request as AuthenticatedRequest;
  }

  (request as AuthenticatedRequest).user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return request as AuthenticatedRequest;
}

export function requireAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authenticatedRequest = await authenticateUser(request);
    
    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(authenticatedRequest);
  };
}

export function requireRole(role: string) {
  return (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) => {
    return requireAuth(async (request: AuthenticatedRequest) => {
      if (request.user?.role !== role) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}

export function requireAdmin(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireRole('admin')(handler);
}
