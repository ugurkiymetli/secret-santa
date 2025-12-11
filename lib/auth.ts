import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'supersecretkeychangeinprod'
);

export async function signToken(payload: any) {
  const alg = 'HS256';
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Validate payload structure
    if (payload && typeof payload.userId !== 'string') {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
