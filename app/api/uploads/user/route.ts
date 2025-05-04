import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Get the auth token from the request headers
    const authHeader = request.headers.get('Authorization') || '';
    
    // Get the userId from the header or query parameter
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/uploads?user_id=${userId}`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      // Return the error from the backend
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch user uploads' },
        { status: response.status }
      );
    }
    
    // Return the user uploads
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 