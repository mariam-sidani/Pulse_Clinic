import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAgentStatus } from '@/lib/langgraph/index';

/**
 * GET handler for status endpoint
 */
export async function GET(request) {
  // Extract session ID from query parameter
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }
  
  // Get authorization header
  const authHeader = request.headers.get('authorization');
  
  // Verify authentication if token provided
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  }
  
  // Retrieve status data for the session
  const statusData = getAgentStatus(sessionId);
  
  if (!statusData) {
    return NextResponse.json(
      { status: null }
    );
  }
  
  // Return status without the timestamp
  const { timestamp, ...status } = statusData;
  return NextResponse.json({ status });
} 