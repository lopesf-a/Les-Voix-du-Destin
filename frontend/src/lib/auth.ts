import type { User } from './types';

export const tokenKey = 'les_voix_du_destin_token';
export const userKey = 'les_voix_du_destin_user';

export function getToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(tokenKey);
}

export function saveAuth(token: string, user: User) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  if (typeof localStorage === 'undefined') return null;
  const value = localStorage.getItem(userKey);
  return value ? JSON.parse(value) as User : null;
}

export function logout() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  window.location.href = '/login';
}
