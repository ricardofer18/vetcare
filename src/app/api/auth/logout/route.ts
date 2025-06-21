import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Crear la respuesta
    const response = NextResponse.json({ success: true });
    
    // Eliminar la cookie de sesión
    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
} 