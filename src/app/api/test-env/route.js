import { NextResponse } from 'next/server';

/**
 * Handles GET requests to test environment variables
 * @returns {Promise<NextResponse>} - The response
 */
export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const keyStart = hasOpenAIKey ? `${process.env.OPENAI_API_KEY.substring(0, 3)}...` : 'not set';
  
  // Don't log the full API key for security reasons
  console.log('Environment variables check:');
  console.log('OPENAI_API_KEY exists:', hasOpenAIKey);
  console.log('OPENAI_API_KEY starts with:', keyStart);
  
  return NextResponse.json({
    message: 'Environment variables check',
    variables: {
      OPENAI_API_KEY: {
        exists: hasOpenAIKey,
        starts_with: keyStart
      },
      NODE_ENV: process.env.NODE_ENV
    }
  });
} 