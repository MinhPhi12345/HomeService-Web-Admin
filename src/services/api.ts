import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://api.homeservice.id.vn/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('adminUser');
        sessionStorage.setItem('auth_message', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        window.dispatchEvent(
          new CustomEvent('app:toast', {
            detail: {
              type: 'error',
              message: 'Bạn không có quyền thực hiện thao tác này.',
            },
          }),
        );
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
