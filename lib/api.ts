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

export function setCurrentUser(user: { id: number; nombre: string; email: string }) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getCurrentUser(): { id: number; nombre: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function removeCurrentUser() {
  localStorage.removeItem('currentUser');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (res.status === 401) {
    removeToken();
    removeCurrentUser();
    if (path !== '/auth/login') {
      window.location.href = '/login';
    }
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const text = await res.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.message || 'Error en la solicitud');
    } catch {
      throw new Error('Error en la solicitud');
    }
  }

  return res.json();
}

async function requestFormData(path: string, formData: FormData, method = 'POST') {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: formData });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (res.status === 401) {
    removeToken();
    removeCurrentUser();
    window.location.href = '/login';
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const text = await res.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.message || 'Error en la solicitud');
    } catch {
      throw new Error('Error en la solicitud');
    }
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Usuarios
  getUsuarios: () => request('/users'),
  getUsuario: (id: number) => request(`/users/${id}`),
  createUsuario: (data: unknown) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUsuario: (id: number, data: unknown) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUsuario: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),

  // Proveedores
  getProveedores: (search?: string) =>
    request(`/proveedores${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProveedor: (id: number) => request(`/proveedores/${id}`),
  createProveedor: (formData: FormData) => requestFormData('/proveedores', formData, 'POST'),
  updateProveedor: (id: number, formData: FormData) => requestFormData(`/proveedores/${id}`, formData, 'PATCH'),
  deleteProveedor: (id: number) => request(`/proveedores/${id}`, { method: 'DELETE' }),
  getStats: () => request('/proveedores/stats'),

  // Productos del proveedor
  getProductosProveedor: (proveedorId: number) =>
    request(`/proveedores/${proveedorId}/productos`),
  createProducto: (proveedorId: number, formData: FormData) =>
    requestFormData(`/proveedores/${proveedorId}/productos`, formData, 'POST'),
  updateProducto: (proveedorId: number, productoId: number, formData: FormData) =>
    requestFormData(`/proveedores/${proveedorId}/productos/${productoId}`, formData, 'PATCH'),
  deleteProducto: (proveedorId: number, productoId: number) =>
    request(`/proveedores/${proveedorId}/productos/${productoId}`, { method: 'DELETE' }),

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