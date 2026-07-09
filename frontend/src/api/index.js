import axios from 'axios';

const API_BASE = 'https://kosherstay2.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getImageUrl = (url) => url ? `${API_BASE}${url}` : null;

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

// ─── Properties ──────────────────────────────────────────────────────────
export const propertiesAPI = {
  list: (params) => api.get('/api/properties/', { params }),
  get: (id) => api.get(`/api/properties/${id}`),
  create: (data) => api.post('/api/properties/', data),
  update: (id, data) => api.put(`/api/properties/${id}`, data),
  delete: (id) => api.delete(`/api/properties/${id}`),
  uploadImages: (id, formData) =>
    api.post(`/api/properties/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (propertyId, imageId) =>
    api.delete(`/api/properties/${propertyId}/images/${imageId}`),
  getBlockedDates: (id) => api.get(`/api/properties/${id}/blocked-dates`),
  blockDates: (id, data) => api.post(`/api/properties/${id}/blocked-dates`, data),
  unblockDates: (id, data) => api.delete(`/api/properties/${id}/blocked-dates`, { data }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post('/api/bookings/', data),
  myBookings: () => api.get('/api/bookings/my'),
  cancel: (id) => api.delete(`/api/bookings/${id}/cancel`),
  adminAll: () => api.get('/api/bookings/admin/all'),
  propertyBookings: (propertyId) => api.get(`/api/bookings/property/${propertyId}`),
  updateStatus: (id, status) => api.patch(`/api/bookings/${id}/status`, { status }),
};

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminAPI = {
  myProperties: () => api.get('/api/admin/my-properties'),
  stats: () => api.get('/api/admin/stats'),
  updateServices: (propertyId, services) =>
    api.put(`/api/admin/properties/${propertyId}/services`, services),
  updateDaysPlans: (propertyId, plans) =>
    api.put(`/api/admin/properties/${propertyId}/days-plans`, plans),
};

// ─── Super Admin ──────────────────────────────────────────────────────────
export const superAdminAPI = {
  stats: () => api.get('/api/super-admin/stats'),
  hotelAdmins: () => api.get('/api/super-admin/hotel-admins'),
  approve: (id) => api.patch(`/api/super-admin/hotel-admins/${id}/approve`),
  block: (id) => api.patch(`/api/super-admin/hotel-admins/${id}/block`),
  customers: () => api.get('/api/super-admin/customers'),
  allProperties: () => api.get('/api/super-admin/properties'),
  toggleProperty: (id) => api.patch(`/api/super-admin/properties/${id}/toggle`),
};

export default api;
