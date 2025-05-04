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
    
    // Find the image by ID
    const image = mockUploads.find(img => img.id === id);
    
    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(image);
  } catch (error) {
    console.error(`Error fetching metadata for image ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch image metadata' },
      { status: 500 }
    );
  }
} 