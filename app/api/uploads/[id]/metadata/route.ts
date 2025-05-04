import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Get the auth token from the request headers
    const authHeader = request.headers.get('Authorization') || '';
    
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/uploads/${id}/metadata`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      // Return the error from the backend
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch image metadata' },
        { status: response.status }
      );
    }
    
    // Return the image metadata
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 