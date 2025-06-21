import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    // Crear la respuesta con la cookie
    const response = NextResponse.json({ success: true });
    
    // Establecer la cookie de sesión
    response.cookies.set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error al establecer la sesión:', error);
    return NextResponse.json(
      { error: 'Error al establecer la sesión' },
      { status: 500 }
    );
  }
} 