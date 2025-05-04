import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // In a real app, you'd verify credentials against a database
    // This is a simple mock authentication for demo purposes
    if (email && password) {
      // Generate a simple mock token
      const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      const userId = 'user_' + Math.random().toString(36).substring(2);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        token,
        user: { 
          id: userId, 
          email,
          username: email.split('@')[0]
        } 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
} 