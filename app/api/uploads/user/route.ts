import { NextRequest, NextResponse } from 'next/server';

// Mock database of uploaded images
const mockUploads = [
  {
    id: 'upload_1',
    title: 'Beach Sunset',
    description: 'A beautiful sunset at the beach',
    url: '/images/sunset.jpg',
    thumbnail: '/images/sunset_thumb.jpg',
    isUserUpload: true,
    userId: 'user_123',
    price: '15.00',
    category: 'nature',
    filename: 'sunset.jpg'
  },
  {
    id: 'upload_2',
    title: 'Mountain View',
    description: 'Scenic mountain landscape',
    url: '/images/mountain.jpg',
    thumbnail: '/images/mountain_thumb.jpg',
    isUserUpload: true,
    userId: 'user_123',
    price: '20.00',
    category: 'landscape',
    filename: 'mountain.jpg'
  }
];

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/uploads/user - Fetching user uploads');
    
    // Get the auth token from the request headers
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.error('Unauthorized attempt to access user uploads');
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please log in to view your uploads' },
        { status: 401 }
      );
    }
    
    // Extract token to get user ID (in a real app, decode JWT)
    // For mock, assume token gives us user_123
    const userId = 'user_123';
    
    console.log(`Fetching uploads for user: ${userId}`);
    
    // Filter images by user ID
    const userUploads = mockUploads.filter(img => img.userId === userId);
    
    console.log(`Found ${userUploads.length} uploads for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      uploads: userUploads
    });
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user uploads' },
      { status: 500 }
    );
  }
} 