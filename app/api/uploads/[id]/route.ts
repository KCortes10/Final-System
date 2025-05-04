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
    console.log(`GET /api/uploads/${id} - Accessing image directly`);
    
    // Find the image by ID
    const image = mockUploads.find(img => img.id === id);
    
    if (!image) {
      console.error(`Image not found: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }
    
    // In a real application, you would serve the actual image file
    // For mock purposes, redirect to a placeholder
    return NextResponse.redirect(new URL('/images/placeholder.jpg', request.url));
  } catch (error) {
    console.error(`Error accessing image ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to access image' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`PUT /api/uploads/${id} - Updating image metadata`);
    
    // Find the image by ID
    const imageIndex = mockUploads.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      console.error(`Image not found for update: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Check authorization
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.error(`Unauthorized update attempt for image: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get updated data
    const data = await request.json();
    
    // Update image (in a real app, this would update the database)
    const updatedImage = {
      ...mockUploads[imageIndex],
      ...data
    };
    
    console.log(`Successfully updated image: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Image updated successfully',
      image: updatedImage
    });
  } catch (error) {
    console.error(`Error updating image ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to update image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`DELETE /api/uploads/${id} - Deleting image`);
    
    // Find the image by ID
    const imageIndex = mockUploads.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      console.error(`Image not found for deletion: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Check authorization
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.error(`Unauthorized deletion attempt for image: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In a real app, you would delete from the database and storage
    console.log(`Successfully deleted image: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting image ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 