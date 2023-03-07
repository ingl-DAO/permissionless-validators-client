import axios, { AxiosInstance } from 'axios';

export enum ProgramUsage {
  Maketplace = 'Maketplace',
  Permissionless = 'Permissionless',
}
//This is only use for beta environnement
export async function signIn(usage: ProgramUsage, accessCode: string) {
  const {
    data: { access_token },
  } = await http.post<{ access_token: string }>(`/auth/sign-in`, {
    usage,
    accessCode,
  });
  return access_token;
}

export async function verifyToken(token: string) {
  const { data: access } = await http.get(`/auth/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return access;
}

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
