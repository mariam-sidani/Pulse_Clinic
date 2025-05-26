import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    console.log('TEST DELETE: Request received');
    
    // Get user ID from URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    console.log('TEST DELETE: User ID:', userId);
    console.log('TEST DELETE: Headers:', Object.fromEntries(request.headers.entries()));
    
    return NextResponse.json({
      success: true,
      message: 'Test delete endpoint working',
      userId: userId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('TEST DELETE: Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Test delete failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 