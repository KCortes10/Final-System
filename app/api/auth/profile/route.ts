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
    
    // Mock user profile
    return NextResponse.json({
      id: 'user_123',
      username: 'demouser',
      email: 'demo@example.com',
      purchasedImages: [],
      downloadedImages: [],
      uploadedImages: []
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
        id: 'user_123'
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