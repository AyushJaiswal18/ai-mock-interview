import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/db-utils';
import { Interview } from '@/lib/models/interview';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

// Start interview session
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    try {
      const user = request.user;
      const interviewId = request.url.split('/interviews/')[1].split('/start')[0];

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

      // Check if interview can be started
      if (interview.status !== 'scheduled') {
        return NextResponse.json(
          { error: 'Interview cannot be started. Current status: ' + interview.status },
          { status: 400 }
        );
      }

      // Check if scheduled time has passed
      const now = new Date();
      if (interview.scheduledAt > now) {
        return NextResponse.json(
          { error: 'Interview cannot be started before scheduled time' },
          { status: 400 }
        );
      }

      // Start the interview
      interview.status = 'in-progress';
      interview.startedAt = now;
      await interview.save();

      // Populate user data
      await interview.populate('candidateId', 'firstName lastName email');
      if (interview.recruiterId) {
        await interview.populate('recruiterId', 'firstName lastName email');
      }

      return NextResponse.json({
        success: true,
        data: interview,
        message: 'Interview started successfully',
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
});
