import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL:  'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to initialize token from localStorage
const initializeToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// List of public endpoints that don't require authentication
const publicEndpoints = [
  '/auth/login',
  '/auth/register',
  '/menu',
  '/tables',
  '/reservations/check-availability'
];

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if the endpoint is public
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (isPublicEndpoint || config.headers['x-public-route']) {
      // Don't add auth header for public routes
      delete config.headers['Authorization'];
    } else {
      // Add auth header for protected routes
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (response.config.url.includes('/auth/login') && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response;
  },
  (error) => {
    const isPublicEndpoint = publicEndpoints.some(endpoint => error.config.url.includes(endpoint));
    const isPublicRoute = error.config?.headers?.['x-public-route'];
    
    if (error.response?.status === 401 && !isPublicEndpoint && !isPublicRoute) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on login page and not a public route
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const makeRequest = async (url, method = 'get', data = null, options = {}) => {
  const config = {
    url,
    method,
    data,
    headers: {},
    params: options.params
  };

  if (options.public) {
    config.headers['x-public-route'] = true;
  }

  try {
    const response = await api(config);
    return response;
  } catch (error) {
    console.error('API Error:', { 
      url, 
      status: error.response?.status, 
      error: error.response?.data,
      isPublic: options.public,
      handleUnauthorized: options.handleUnauthorized
    });

    // If this is a route that should handle unauthorized errors gracefully
    if (options.handleUnauthorized && error.response?.status === 401) {
      return { data: [] };
    }

    throw error;
  }
};

const apiMethods = {
  auth: {
    login: (data) => makeRequest('/auth/login', 'post', data, { public: true }),
    register: (data) => makeRequest('/auth/register', 'post', data, { public: true }),
    registerStaff: (userData) => makeRequest('/auth/register-staff', 'post', userData),
    me: () => makeRequest('/auth/me')
  },
  addresses: {
    getAll: () => makeRequest('/addresses', 'get'),
    create: (addressData) => makeRequest('/addresses', 'post', addressData),
    update: (id, addressData) => makeRequest(`/addresses/${id}`, 'put', addressData),
    delete: (id) => makeRequest(`/addresses/${id}`, 'delete')
  },
  menu: {
    getAll: () => makeRequest('/menu', 'get', null, { public: true }),
    getById: (id) => makeRequest(`/menu/${id}`, 'get', null, { public: true }),
    create: (menuItemData) => makeRequest('/menu', 'post', menuItemData),
    update: (id, menuItemData) => makeRequest(`/menu/${id}`, 'put', menuItemData),
    delete: (id) => makeRequest(`/menu/${id}`, 'delete'),
    getByCategory: (category) => makeRequest(`/menu/category/${category}`, 'get', null, { public: true }),
    search: (query) => makeRequest(`/menu/search`, 'get', null, { public: true, params: { q: query } }),
    getReviews: (menuItemId) => makeRequest(`/menu/${menuItemId}/reviews`, 'get', null, { public: true }),
    addReview: (menuItemId, reviewData) => makeRequest(`/menu/${menuItemId}/reviews`, 'post', reviewData)
  },
  orders: {
    getAll: () => makeRequest('/orders', 'get'),
    getById: (id) => makeRequest(`/orders/${id}`, 'get'),
    create: (orderData) => makeRequest('/orders', 'post', orderData),
    update: (id, orderData) => makeRequest(`/orders/${id}`, 'put', orderData),
    updateStatus: (id, status) => makeRequest(`/orders/${id}/status`, 'patch', { status }),
    delete: (id) => makeRequest(`/orders/${id}`, 'delete'),
    getMyOrders: () => makeRequest('/orders/my-orders', 'get'),
    getActiveOrders: () => makeRequest('/orders/active', 'get'),
    getPendingOrders: () => makeRequest('/orders/pending', 'get'),
    getCompletedOrders: () => makeRequest('/orders/completed', 'get'),
    getTotalSpend: () => makeRequest('/orders/total-spend', 'get')
  },
  reservations: {
    getAll: (options = {}) => makeRequest('/reservations', 'get', null, options),
    getMyReservations: () => makeRequest('/reservations/my-reservations', 'get', null, {
      handleUnauthorized: true
    }),
    create: (data) => makeRequest('/reservations', 'post', data),
    update: (id, data) => makeRequest(`/reservations/${id}`, 'put', data),
    cancel: (id) => makeRequest(`/reservations/${id}/cancel`, 'patch'),
    delete: (id) => makeRequest(`/reservations/${id}`, 'delete'),
    checkAvailability: (date, time, guests) => makeRequest('/reservations/check-availability', 'get', null, { 
      public: true,
      params: { date, time, guests }
    })
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
    getAll: (options = {}) => makeRequest('/tables', 'get', null, { ...options, public: true }),
    create: (data) => makeRequest('/tables', 'post', data),
    update: (id, data) => makeRequest(`/tables/${id}`, 'put', data),
    delete: (id) => makeRequest(`/tables/${id}`, 'delete'),
    getStatus: () => makeRequest('/tables/status', 'get', null, { public: true })
  },
  cart: {
    get: () => api.get('/cart'),
    add: (menuItemId, quantity) => api.post('/cart/items', { menuItemId, quantity }),
    update: (menuItemId, quantity) => api.put('/cart/items', { menuItemId, quantity }),
    remove: (menuItemId) => api.delete(`/cart/items/${menuItemId}`),
    clear: () => api.delete('/cart')
  }
};

// Export both the API instance and methods
export { api, initializeToken };
export default apiMethods; 