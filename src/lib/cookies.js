import { serialize } from 'cookie';

export function setTokenCookie(token) {
  return serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
}

export function clearTokenCookie() {
  return serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 0,
  });
}
