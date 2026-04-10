const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error en la solicitud');
  }

  return res.json();
}

async function requestFormData(path: string, formData: FormData, method = 'POST') {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: formData });

  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error en la solicitud');
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Proveedores
  getProveedores: (search?: string) =>
    request(`/proveedores${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProveedor: (id: number) => request(`/proveedores/${id}`),
  createProveedor: (formData: FormData) => requestFormData('/proveedores', formData, 'POST'),
  updateProveedor: (id: number, formData: FormData) => requestFormData(`/proveedores/${id}`, formData, 'PATCH'),
  deleteProveedor: (id: number) => request(`/proveedores/${id}`, { method: 'DELETE' }),
  getStats: () => request('/proveedores/stats'),

  // Pedidos
  getPedidos: (search?: string) =>
    request(`/pedidos${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getPedido: (id: number) => request(`/pedidos/${id}`),
  createPedido: (data: unknown) =>
    request('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
  updatePedido: (id: number, data: unknown) =>
    request(`/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getReporte: (desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    return request(`/pedidos/reporte${params.toString() ? `?${params}` : ''}`);
  },

  // Consultas
  getConsultas: (search?: string) =>
    request(`/proveedores${search ? `?search=${encodeURIComponent(search)}` : ''}`),
};