import axios, { AxiosInstance } from 'axios';

function axiosInstance(): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: process.env['NX_MONITOR_BASE_URL'] ?? 'https://beta.ingl.io',
  });
  axiosInstance.interceptors.request.use(
    (request) => {
      return request;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error.response?.data);
    }
  );

  return axiosInstance;
}

export const http = axiosInstance();
