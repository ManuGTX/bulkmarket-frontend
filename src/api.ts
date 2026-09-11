export type Role = 'BUYER' | 'SELLER';
export type Business = { id: string; legalName: string; tradeName: string; taxId: string; phone: string; address: string };
export type Session = { accessToken: string; user: { id: string; email: string; role: Role }; business: Business };
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(Array.isArray(body.message) ? body.message[0] : body.message ?? 'Ocurrió un error inesperado.'); }
  return response.status === 204 ? undefined as T : response.json();
}
export const api = {
  login: (payload: { email: string; password: string }) => request<Session>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: Omit<Session, 'accessToken' | 'user' | 'business'> & { email: string; password: string; role: Role; business: Omit<Business, 'id'> }) => request<Session>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusiness: (payload: Omit<Business, 'id'>, token: string) => request<Business>('/businesses/me', { method: 'PATCH', body: JSON.stringify(payload) }, token),
};
