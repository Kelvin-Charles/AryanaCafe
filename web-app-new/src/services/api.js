import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const apiMethods = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    me: () => api.get('/auth/me')
  },
  menu: {
    getAll: () => api.get('/menu'),
    getById: (id) => api.get(`/menu/${id}`),
    create: (menuItemData) => api.post('/menu', menuItemData),
    update: (id, menuItemData) => api.put(`/menu/${id}`, menuItemData),
    delete: (id) => api.delete(`/menu/${id}`),
    getByCategory: (category) => api.get(`/menu/category/${category}`),
    search: (query) => api.get(`/menu/search`, { params: { q: query } }),
    getReviews: (menuItemId) => api.get(`/menu/${menuItemId}/reviews`),
    addReview: (menuItemId, reviewData) => api.post(`/menu/${menuItemId}/reviews`, reviewData)
  },
  orders: {
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (orderData) => api.post('/orders', orderData),
    update: (id, orderData) => api.put(`/orders/${id}`, orderData),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    delete: (id) => api.delete(`/orders/${id}`),
    getMyOrders: () => api.get('/orders/my-orders'),
    getActiveOrders: () => api.get('/orders/active'),
    getPendingOrders: () => api.get('/orders/pending'),
    getCompletedOrders: () => api.get('/orders/completed'),
    assignWaiter: (orderId, waiterId) => api.post(`/orders/${orderId}/assign`, { waiterId }),
    addNote: (orderId, note) => api.post(`/orders/${orderId}/notes`, { note })
  },
  reservations: {
    getAll: () => api.get('/reservations'),
    getMyReservations: () => api.get('/reservations/my-reservations'),
    create: (data) => api.post('/reservations', data),
    cancel: (id) => api.patch(`/reservations/${id}/cancel`),
    delete: (id) => api.delete(`/reservations/${id}`),
    checkAvailability: (date, time) => api.get('/reservations/check-availability', { params: { date, time } })
  },
  users: {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
    updateProfile: (userData) => api.put('/users/profile', userData),
    updatePassword: (passwords) => api.put('/users/password', passwords),
    getStaff: () => api.get('/users/staff'),
    getWaiters: () => api.get('/users/waiters'),
    getChefs: () => api.get('/users/chefs')
  },
  reports: {
    get: (type, dateRange) => api.get(`/reports/${type}`, { params: { dateRange } }),
    getSalesReport: (startDate, endDate) => 
      api.get('/reports/sales', { params: { startDate, endDate } }),
    getStaffPerformance: (startDate, endDate) => 
      api.get('/reports/staff-performance', { params: { startDate, endDate } }),
    getPopularItems: (startDate, endDate) => 
      api.get('/reports/popular-items', { params: { startDate, endDate } }),
    getRevenueByCategory: (startDate, endDate) => 
      api.get('/reports/revenue-by-category', { params: { startDate, endDate } })
  },
  shifts: {
    getAll: () => api.get('/shifts'),
    create: (shiftData) => api.post('/shifts', shiftData),
    update: (id, shiftData) => api.put(`/shifts/${id}`, shiftData),
    delete: (id) => api.delete(`/shifts/${id}`),
    getMyShifts: () => api.get('/shifts/my-shifts'),
    assignStaff: (shiftId, staffId) => api.post(`/shifts/${shiftId}/assign`, { staffId }),
    removeStaff: (shiftId, staffId) => api.delete(`/shifts/${shiftId}/staff/${staffId}`)
  },
  tables: {
    getAll: () => api.get('/tables'),
    update: (id, tableData) => api.put(`/tables/${id}`, tableData),
    getStatus: () => api.get('/tables/status'),
    assign: (tableId, waiterId) => api.post(`/tables/${tableId}/assign`, { waiterId }),
    release: (tableId) => api.post(`/tables/${tableId}/release`)
  },
  cart: {
    get: () => api.get('/cart'),
    add: (menuItemId, quantity) => api.post('/cart/items', { menuItemId, quantity }),
    update: (menuItemId, quantity) => api.put('/cart/items', { menuItemId, quantity }),
    remove: (menuItemId) => api.delete(`/cart/items/${menuItemId}`),
    clear: () => api.delete('/cart')
  }
};

export default apiMethods; 