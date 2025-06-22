import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, role, password } = await request.json();

    // Validar datos requeridos
    if (!email || !displayName || !role || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El email no es válido' },
        { status: 400 }
      );
    }

    // Por ahora, devolver un UID temporal
    // En una implementación real, aquí se usaría Firebase Admin
    const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      uid: uid,
      message: 'Usuario creado exitosamente (modo temporal)',
    });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 