import { serialize } from 'cookie';

export function setTokenCookie(token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    
    return `token=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
}

export function clearTokenCookie() {
    return `token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
}
