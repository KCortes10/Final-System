import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle OPTIONS method for CORS preflight requests
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
    console.log('Handling CORS preflight request for:', request.nextUrl.pathname);
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
      },
    });
  }
  
  return NextResponse.next();
}

// Configure matcher for API routes only
export const config = {
  matcher: '/api/:path*',
}; 