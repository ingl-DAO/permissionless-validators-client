import axios, { AxiosInstance } from 'axios';

export enum ProgramUsage {
  Marketplace = 'Marketplace',
  PermissionlessValidator = 'PermissionlessValidator',
}

export enum VersionStatus {
  Deprecated = 'Deprecated',
  Unsafe = 'Unsafe',
  Safe = 'Safe',
}

export interface ProgramVersion {
  program_data_hash: string;
  version: number;
  status: VersionStatus;
  released_on: Date;
}

export async function verifyVersion(
  usage: ProgramUsage,
  program_id: string,
  bpfType: 'Buffer' | 'Program'
) {
  const { data: programVersion } = await http.get<ProgramVersion | null>(
    `/program-versions/verify`,
    { params: { program_id, usage, bpfType } }
  );
  return programVersion;
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
