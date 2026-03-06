import axios from 'axios';

const paymentPlatformApi = axios.create({
  baseURL: import.meta.env.VITE_PAYMENT_PLATFORM_URL || 'http://localhost:8888/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_PAYMENT_MASTER_KEY || 'ufitgo-master-secret',
  },
});

export default paymentPlatformApi;
