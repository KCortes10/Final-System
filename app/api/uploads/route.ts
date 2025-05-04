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
    
    console.log('GET /api/uploads - Query params:', { userId, category, query });
    
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
    
    console.log(`Returning ${filteredImages.length} images`);
    
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
  console.log('POST /api/uploads - Received upload request');
  
  try {
    // In a real app, you would handle file upload here
    // Get authorization header
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.error('Unauthorized upload attempt - missing or invalid token');
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please log in to upload images' },
        { status: 401 }
      );
    }
    
    // Log headers for debugging
    console.log('Request headers:', Object.fromEntries([...request.headers.entries()]));
    
    try {
      // Extract form data
      const formData = await request.formData();
      console.log('FormData fields:', [...formData.keys()]);
      
      const title = formData.get('title')?.toString() || 'Untitled';
      const description = formData.get('description')?.toString() || '';
      const price = formData.get('price')?.toString() || '10.00';
      const category = formData.get('category')?.toString() || 'other';
      const file = formData.get('file');
      
      console.log('Upload data:', { title, description, category, price, hasFile: !!file });
      
      if (!file) {
        return NextResponse.json(
          { success: false, message: 'No file provided' },
          { status: 400 }
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
      console.log('Successfully created new image:', newImageId);
      
      return NextResponse.json({
        success: true,
        message: 'Image uploaded successfully',
        image: newImage
      });
    } catch (formError) {
      console.error('Error processing form data:', formError);
      return NextResponse.json(
        { success: false, message: `Error processing upload data: ${formError instanceof Error ? formError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 