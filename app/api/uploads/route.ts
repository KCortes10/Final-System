import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const category = url.searchParams.get('category');
    const query = url.searchParams.get('q');
    
    // Filter images based on query parameters
    let filteredImages = [...mockUploads];
    
    if (userId) {
      filteredImages = filteredImages.filter(img => img.userId === userId);
    }
    
    if (category) {
      filteredImages = filteredImages.filter(img => img.category === category);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredImages = filteredImages.filter(img => 
        img.title.toLowerCase().includes(lowerQuery) || 
        img.description.toLowerCase().includes(lowerQuery) ||
        (img.filename && img.filename.toLowerCase().includes(lowerQuery))
      );
    }
    
    return NextResponse.json(filteredImages);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // In a real app, you would handle file upload here
    // Mock successful upload response
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || 'Untitled';
    const description = formData.get('description')?.toString() || '';
    const price = formData.get('price')?.toString() || '10.00';
    const category = formData.get('category')?.toString() || 'other';
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create a mock image upload
    const newImageId = 'upload_' + Date.now();
    const newImage = {
      id: newImageId,
      title,
      description,
      url: '/images/placeholder.jpg',
      thumbnail: '/images/placeholder_thumb.jpg',
      isUserUpload: true,
      userId: 'user_123', // In a real app, extract from token
      price,
      category,
      filename: 'placeholder.jpg'
    };
    
    // In a real app, you would save this to a database
    
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      image: newImage
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 