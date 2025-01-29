import api from '../api';

const ordersApi = {
  getTotalSpend: () => api.get('/api/orders/total-spend')
};

export default ordersApi; 