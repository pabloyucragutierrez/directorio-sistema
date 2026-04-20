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

export function setRole(role: 'admin' | 'proveedor') {
  localStorage.setItem('role', role);
}

export function getRole(): 'admin' | 'proveedor' | null {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem('role');
  return role === 'admin' || role === 'proveedor' ? role : null;
}

export function removeRole() {
  localStorage.removeItem('role');
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

export function setProveedorToken(token: string) {
  localStorage.setItem('proveedorToken', token);
}

export function getProveedorToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('proveedorToken');
}

export function removeProveedorToken() {
  localStorage.removeItem('proveedorToken');
}

export function setCurrentProveedor(proveedor: { id: number; razonSocial: string; usuarioAcceso: string }) {
  localStorage.setItem('currentProveedor', JSON.stringify(proveedor));
}

export function getCurrentProveedor(): { id: number; razonSocial: string; usuarioAcceso: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('currentProveedor');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function removeCurrentProveedor() {
  localStorage.removeItem('currentProveedor');
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
    removeRole();
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
      const msg = Array.isArray(error?.message) ? error.message.join(', ') : error?.message;
      throw new Error(msg || 'Error en la solicitud');
    } catch {
      // A veces el backend puede responder texto plano/HTML; mostramos el contenido si existe.
      const fallback = text?.trim();
      // Si el backend devolvió un JSON como texto (y por alguna razón el parse falló),
      // extraemos solo el campo "message" para no mostrar todo el objeto.
      const match = fallback?.match(/"message"\s*:\s*"((?:\\.|[^"\\])*)"/);
      if (match?.[1]) {
        try {
          throw new Error(JSON.parse(`"${match[1]}"`));
        } catch {
          throw new Error(match[1]);
        }
      }
      throw new Error(fallback || 'Error en la solicitud');
    }
  }

  if (res.status === 204) return null;
  return res.json();
}

async function requestProveedor(path: string, options: RequestInit = {}) {
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
    removeRole();
    removeCurrentUser();
    removeCurrentProveedor();
    window.location.href = '/login';
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const text = await res.text();
    try {
      const error = JSON.parse(text);
      const msg = Array.isArray(error?.message) ? error.message.join(', ') : error?.message;
      throw new Error(msg || 'Error en la solicitud');
    } catch {
      const fallback = text?.trim();
      const match = fallback?.match(/"message"\s*:\s*"((?:\\.|[^"\\])*)"/);
      if (match?.[1]) {
        try {
          throw new Error(JSON.parse(`"${match[1]}"`));
        } catch {
          throw new Error(match[1]);
        }
      }
      throw new Error(fallback || 'Error en la solicitud');
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
    removeRole();
    removeCurrentUser();
    window.location.href = '/login';
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const text = await res.text();
    try {
      const error = JSON.parse(text);
      const msg = Array.isArray(error?.message) ? error.message.join(', ') : error?.message;
      throw new Error(msg || 'Error en la solicitud');
    } catch {
      const fallback = text?.trim();
      const match = fallback?.match(/"message"\s*:\s*"((?:\\.|[^"\\])*)"/);
      if (match?.[1]) {
        try {
          throw new Error(JSON.parse(`"${match[1]}"`));
        } catch {
          throw new Error(match[1]);
        }
      }
      throw new Error(fallback || 'Error en la solicitud');
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
  getProveedoresPaged: (params?: { search?: string; cursor?: number | null; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.cursor != null) qs.set('cursor', String(params.cursor));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    return request(`/proveedores/paged${qs.toString() ? `?${qs.toString()}` : ''}`);
  },
  getConsultasPaged: (params?: { search?: string; cursor?: number | null; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.cursor != null) qs.set('cursor', String(params.cursor));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    return request(`/proveedores/consultas-paged${qs.toString() ? `?${qs.toString()}` : ''}`);
  },
  getProveedor: (id: number) => request(`/proveedores/${id}`),
  createProveedor: (formData: FormData) => requestFormData('/proveedores', formData, 'POST'),
  updateProveedor: (id: number, formData: FormData) => requestFormData(`/proveedores/${id}`, formData, 'PATCH'),
  deleteProveedor: (id: number) => request(`/proveedores/${id}`, { method: 'DELETE' }),
  deletePedidosProveedor: (id: number) => request(`/proveedores/${id}/pedidos`, { method: 'DELETE' }),
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
  getPedidosPaged: (params?: { search?: string; cursor?: number | null; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.cursor != null) qs.set('cursor', String(params.cursor));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    return request(`/pedidos/paged${qs.toString() ? `?${qs.toString()}` : ''}`);
  },
  getPedido: (id: number) => request(`/pedidos/${id}`),
  createPedido: (data: unknown) =>
    request('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
  updatePedido: (id: number, data: unknown) =>
    request(`/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePedido: (id: number) => request(`/pedidos/${id}`, { method: 'DELETE' }),
  getReporte: (desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    return request(`/pedidos/reporte${params.toString() ? `?${params}` : ''}`);
  },

  // Consultas
  getConsultas: (search?: string) =>
    request(`/proveedores${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // Portal proveedor
  proveedorMisPedidos: () => requestProveedor('/pedidos/mis-pedidos'),
  proveedorResponder: (id: number, accion: 'ACEPTADO' | 'RECHAZADO') =>
    requestProveedor(`/pedidos/${id}/responder`, { method: 'POST', body: JSON.stringify({ accion }) }),
};
