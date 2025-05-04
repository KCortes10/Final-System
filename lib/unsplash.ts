// Configuration for Unsplash API
export const unsplashConfig = {
  // Using demo key since the original key is having auth issues
  accessKey: 'ab3411e4ac868c2646c0ed488dfd919ef612b04c264f3374c97fff98ed253dc9',
  secretKey: 'UfX2vt6nPjeWbGyItRoU2ghhJyXrkpZTrJARS062J9Q',
  authorizationCode: 'y2Urt9ULqsIlextgvtsctW9nC0gugVwb4SlOlfDwL8c',
  apiUrl: 'https://api.unsplash.com'
};

// Interface for image results
export interface UnsplashImage {
  id: string;
  alt_description: string;
  description: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
}

// Search for images using Unsplash API
export async function searchUnsplashImages(query: string, page: number = 1, perPage: number = 24): Promise<{
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}> {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    per_page: perPage.toString()
  });

  try {
    console.log("Fetching from:", `${unsplashConfig.apiUrl}/search/photos?${params}`);
    
    const response = await fetch(
      `${unsplashConfig.apiUrl}/search/photos?${params}`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashConfig.accessKey}`
        },
        cache: 'force-cache'
      }
    );

    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      
      // Return empty results instead of throwing an error
      return { results: [], total: 0, total_pages: 0 };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching images:', error);
    // Return empty results on error
    return { results: [], total: 0, total_pages: 0 };
  }
}

// Get random images from Unsplash
export async function getRandomUnsplashImages(count: number = 24): Promise<UnsplashImage[]> {
  const params = new URLSearchParams({
    count: count.toString()
  });

  try {
    const response = await fetch(
      `${unsplashConfig.apiUrl}/photos/random?${params}`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashConfig.accessKey}`
        },
        cache: 'force-cache'
      }
    );

    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      // Return empty array instead of throwing an error
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching random images:', error);
    // Return empty array on error
    return [];
  }
} 