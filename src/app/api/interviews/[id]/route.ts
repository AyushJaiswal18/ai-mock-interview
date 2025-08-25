import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

// Get specific interview
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/').pop();

      if (!interviewId) {
        return NextResponse.json(
          { error: 'Interview ID is required' },
          { status: 400 }
        );
      }

      const interview = await Interview.findById(interviewId)
        .populate('candidateId', 'firstName lastName email')
        .populate('recruiterId', 'firstName lastName email')
        .lean();

      if (!interview) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }

      // Check access permissions
      const candidateIdStr = interview.candidateId._id ? interview.candidateId._id.toString() : interview.candidateId.toString();
      const recruiterIdStr = interview.recruiterId && interview.recruiterId._id ? interview.recruiterId._id.toString() : interview.recruiterId?.toString();
      
      if (user.role === 'candidate' && candidateIdStr !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      if (user.role === 'recruiter' && recruiterIdStr && recruiterIdStr !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: interview,
      });
    } catch (error) {
      console.error('Error fetching interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});

// Update interview
export const PUT = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/').pop();
      const body = await request.json();

      if (!interviewId) {
        return NextResponse.json(
          { error: 'Interview ID is required' },
          { status: 400 }
        );
      }

      const interview = await Interview.findById(interviewId);

      if (!interview) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }

      // Check access permissions
      if (user.role === 'candidate' && interview.candidateId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      if (user.role === 'recruiter' && interview.recruiterId && interview.recruiterId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Update allowed fields
      const allowedUpdates = ['title', 'scheduledAt', 'duration', 'config'];
      const updates: any = {};

      allowedUpdates.forEach(field => {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      });

      // Update interview
      Object.assign(interview, updates);
      await interview.save();

      // Populate user data
      await interview.populate('candidateId', 'firstName lastName email');
      if (interview.recruiterId) {
        await interview.populate('recruiterId', 'firstName lastName email');
      }

      return NextResponse.json({
        success: true,
        data: interview,
        message: 'Interview updated successfully',
      });
    } catch (error) {
      console.error('Error updating interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});

// Delete interview
export const DELETE = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/').pop();

      if (!interviewId) {
        return NextResponse.json(
          { error: 'Interview ID is required' },
          { status: 400 }
        );
      }

      const interview = await Interview.findById(interviewId);

      if (!interview) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }

      // Check access permissions
      if (user.role === 'candidate' && interview.candidateId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      if (user.role === 'recruiter' && interview.recruiterId && interview.recruiterId.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Only allow deletion if interview hasn't started
      if (interview.status !== 'scheduled') {
        return NextResponse.json(
          { error: 'Cannot delete interview that has already started' },
          { status: 400 }
        );
      }

      await Interview.findByIdAndDelete(interviewId);

      return NextResponse.json({
        success: true,
        message: 'Interview deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
