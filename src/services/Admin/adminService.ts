import api from '../api';

// ── Stats ──────────────────────────────────────────────────────────────────
export const getAdminStats = () =>
  api.get('/admin/stats').then(r => r.data);

export const getRecentActivity = () =>
  api.get('/admin/recent-activity').then(r => r.data);

// ── Categories ─────────────────────────────────────────────────────────────
export const getCategories = () =>
  api.get('/admin/categories').then(r => r.data);

export const createCategory = (data: { nom: string; description?: string }) =>
  api.post('/admin/categories', data).then(r => r.data);

export const updateCategory = (id: number, data: { nom?: string; description?: string; isActive?: boolean }) =>
  api.put(`/admin/categories/${id}`, data).then(r => r.data);

export const deleteCategory = (id: number) =>
  api.delete(`/admin/categories/${id}`).then(r => r.data);

// ── Users ──────────────────────────────────────────────────────────────────
export const getAllUsers = () =>
  api.get('/utilisateur').then(r => r.data);

export const toggleBlockUser = (id: number) =>
  api.put(`/utilisateur/${id}/toggle-block`).then(r => r.data);

export const deleteUser = (id: number) =>
  api.delete(`/utilisateur/${id}`).then(r => r.data);
