import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key'
);
const TOKEN_NAME = 'wearcraft-token';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
}
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
export async function setAuthCookie(token: string): Promise<void> {
  (await cookies()).set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  });
}
export async function getAuthCookie(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_NAME)?.value;
}
export async function removeAuthCookie(): Promise<void> {
  (await cookies()).delete(TOKEN_NAME);
}
export async function getCurrentUser(
  request?: NextRequest
): Promise<JWTPayload | null> {
  try {
    let token: string | undefined;

    if (request) {
      token = request.cookies.get(TOKEN_NAME)?.value;
    } else {
      token = await getAuthCookie();
    }

    if (!token) return null;

    return await verifyToken(token);
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}
export async function requireAuth(
  request: NextRequest
): Promise<JWTPayload> {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}