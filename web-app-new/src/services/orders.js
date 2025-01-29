import api from './api';

const ordersApi = {
  getTotalSpend: () => api.get('/orders/total-spend')
};

export default ordersApi; 