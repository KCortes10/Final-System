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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`GET /api/uploads/${id}/thumbnail - Accessing image thumbnail`);
    
    // Find the image by ID
    const image = mockUploads.find(img => img.id === id);
    
    if (!image) {
      console.error(`Image not found for thumbnail: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }
    
    // In a real application, you would serve the actual thumbnail file
    // For mock purposes, redirect to a placeholder thumbnail
    return NextResponse.redirect(new URL('/images/placeholder_thumb.jpg', request.url));
  } catch (error) {
    console.error(`Error accessing thumbnail for image ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to access image thumbnail' },
      { status: 500 }
    );
  }
} 