import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import type { ApiResponse } from './types/common.types';

/* ─── Auth header accessors (reads from localStorage session) ─── */
const STORAGE_KEY = 'fm_auth_user';

const getAuthHeaders = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      return {
        'X-User-Id':    user.userId ?? '',
        'X-User-Email': user.email ?? '',
        'X-User-Role':  user.role ?? '',
      };
    }
  } catch { /* ignore */ }
  return {
    'X-User-Id':    '',
    'X-User-Email': '',
    'X-User-Role':  '',
  };
};

/* ─── Custom axios config extension ─────────────────────────────── */
declare module 'axios' {
  interface AxiosRequestConfig {
    /** When true, suppresses the global error toast for this request. */
    skipToast?: boolean;
  }
}

/* ─── Axios instance ─────────────────────────────────────────────────── */
export const apiClient = axios.create({
  baseURL: (() => {
    const configured = import.meta.env.VITE_API_BASE_URL?.trim();

    if (!configured) {
      return 'https://enablr-gch2agdgfme6fedr.centralus-01.azurewebsites.net';
    }

    if (configured.startsWith('http://') || configured.startsWith('https://')) {
      return configured;
    }

    return `https://${configured}`;
  })(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

/* ─── Request interceptor — attach auth headers ──────────────────────── */
apiClient.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  config.headers['X-User-Id']    = headers['X-User-Id'];
  config.headers['X-User-Email'] = headers['X-User-Email'];
  config.headers['X-User-Role']  = headers['X-User-Role'];
  return config;
});

/* ─── Response interceptor — unwrap envelope / handle errors ─────────── */
apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiResponse<unknown>;
    if (envelope && typeof envelope === 'object' && 'success' in envelope) {
      if (envelope.success === true) {
        response.data = envelope.data;
      } else {
        // API returned HTTP 2xx but logical failure — treat as error
        const detail: ToastEventDetail = {
          type:    'error',
          message: envelope.message ?? 'An unexpected error occurred.',
        };
        const config = response.config as InternalAxiosRequestConfig & { skipToast?: boolean };
        if (!config?.skipToast) {
          window.dispatchEvent(new CustomEvent('fm:toast', { detail }));
        }
        return Promise.reject(envelope);
      }
    }
    return response;
  },
  (error: AxiosError<ApiResponse<never>>) => {
    const config   = error.config as InternalAxiosRequestConfig & { skipToast?: boolean };
    const status   = error.response?.status;
    const envelope = error.response?.data;
    const message  = envelope?.message ?? 'An unexpected error occurred.';
    const traceId  = envelope?.traceId;

    // Only show global toast if not suppressed, and not a 404/401
    if (!config?.skipToast && status !== 404 && status !== 401) {
      const detail: ToastEventDetail = {
        type:    'error',
        message: status === 500
          ? `Server error${traceId ? ` (trace: ${traceId})` : ''}. Please try again.`
          : message,
      };
      window.dispatchEvent(new CustomEvent('fm:toast', { detail }));
    }

    if (status === 401) {
      console.warn('Unauthenticated — redirect to login');
    }

    return Promise.reject(envelope ?? error);
  },
);

export interface ToastEventDetail {
  type: 'success' | 'error' | 'info';
  message: string;
}
