import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In a real app, you would extract the token and get the user from database
    // Check for auth token
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Extract user info from token or localStorage
    // For demo, we'll use query parameters to simulate retrieving user data
    const url = new URL(request.url);
    
    // Get email from token or use demo value
    const email = url.searchParams.get('email') || 'demo@example.com';
    // Generate username from email (like in login)
    const username = email.split('@')[0];
    
    // If token contains user_id, use it
    const userId = url.searchParams.get('userId') || 'user_123';
    
    // Get image metadata, if available
    const imageMetadata = url.searchParams.get('imageMetadata');
    let purchasedMetadata = {};
    if (imageMetadata) {
      try {
        purchasedMetadata = JSON.parse(imageMetadata);
      } catch (error) {
        console.error('Error parsing image metadata:', error);
      }
    }
    
    return NextResponse.json({
      id: userId,
      username: username,
      email: email,
      purchasedImages: [],
      downloadedImages: [],
      uploadedImages: [],
      purchasedMetadata: purchasedMetadata || {}
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In a real app, you would update the user profile in database
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...body,
        id: body.id || 'user_123'
      }
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 