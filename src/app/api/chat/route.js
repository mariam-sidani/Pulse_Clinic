import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/langgraph';
import { verifyToken } from '@/lib/jwt';
import { Client } from 'langsmith';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';

// Initialize LangSmith client
const client = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  projectName: process.env.LANGCHAIN_PROJECT || "clinic-agent-app",
});

/**
 * Handles POST requests to the /api/chat endpoint
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - The response
 */
export async function POST(request) {
  // Create a unique trace ID for this request
  const traceId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Extract the message and role from the request body
    const { message, role: requestRole } = body;
    
    console.log('Request body:', body);
    
    if (!message) {
      return NextResponse.json(
        { response: 'Please provide a message to respond to.' },
        { status: 400 }
      );
    }
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    // Default user with role 0 (general user)
    let user = { role: 0, sessionId: traceId };
    
    // If a role was explicitly provided in the request body, use it
    if (requestRole !== undefined) {
      console.log('Using role from request body:', requestRole);
      user.role = Number(requestRole);
    }
    
    // If the authorization header exists, verify the token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Verify the token and extract the user information
        const decoded = await verifyToken(token);
        if (decoded) {
          // Only override the role from the token if we didn't get it from the request body
          if (requestRole === undefined) {
            user.role = decoded.role;
          }
          
          user = {
            ...user,
            id: decoded.id,
            email: decoded.email,
            sessionId: traceId
          };
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Continue with the role we already have
      }
    }
    
    console.log('Final user data for chat processing:', user);
    
    // Process the message through the simplified implementation
    let response;
    let agentStatus = null;
    try {
      // Process the message with tracing
      const result = await processMessage(message, user);
      
      // Check if the result is a string or an object with response and status
      if (typeof result === 'object' && result.response) {
        response = result.response;
        agentStatus = result.agentStatus || null;
      } else {
        response = result;
      }
    } catch (error) {
      console.error('Error from processMessage:', error);
      response = 'I apologize, but I encountered an error processing your request. Please try again later.';
    }
    
    // Ensure we have a valid response
    if (!response || typeof response !== 'string' || response.trim() === '') {
      console.error('Empty response from chat processor, using fallback');
      response = 'I apologize, but I was unable to generate a response. Please try again.';
    }
    
    // Return the response with agent status if available
    return NextResponse.json({ 
      response,
      agentStatus,
      trace_id: traceId
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { 
        response: 'An error occurred while processing your request. Please try again later.',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
}

/**
 * Handles OPTIONS requests to the /api/chat endpoint (for CORS)
 * @returns {NextResponse} - The response
 */
export async function OPTIONS() {
  return NextResponse.json({}, 
    { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
} 