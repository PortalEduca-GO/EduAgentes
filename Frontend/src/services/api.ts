import axios from 'axios';

/**
 * Normaliza URLs declaradas via variável de ambiente para que funcionem tanto no navegador
 * quanto durante a renderização no servidor (SSR/SSG) do Next.js.
 */
const normalizeUrl = (value: string, { browserOrigin }: { browserOrigin?: string } = {}): string => {
  if (!value) {
    return value;
  }

  // Se já é absoluta, só devolve.
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Se for relativa (ex.: "/api"), usa a origem atual quando disponível.
  if (value.startsWith('/') && browserOrigin) {
    return `${browserOrigin}${value}`;
  }

  return value;
};

const resolveBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const envUrl = process.env.NEXT_PUBLIC_API_URL;

    if (envUrl) {
      return normalizeUrl(envUrl, { browserOrigin: origin });
    }

    return `${origin}/api`;
  }

  return process.env.BACKEND_API_INTERNAL_URL
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  timeout: 190000, // 190 segundos de timeout para IA local
});

api.interceptors.request.use((config) => {
  const baseURL = resolveBaseURL();
  config.baseURL = baseURL;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
  if (token) {
    if (!config.headers) (config as any).headers = {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  // Remover barra final da URL para evitar redirects 307
  if (config.url && config.url.endsWith('/')) {
    config.url = config.url.slice(0, -1);
  }

  return config;
}, (error) => Promise.reject(error));

// Interceptador para lidar com respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o token é inválido, remove do localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redireciona para login se não estiver já na página de login
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    // Log para ajudar no debug de erros 422
    if (error.response?.status === 422) {
      try {
        console.error('API validation error (422):', error.response.data);
      } catch (e) {
        console.error('API validation error (422) - could not parse response body');
      }
    }
    return Promise.reject(error);
  }
);

// Função utilitária para construir URLs de imagens do backend
export const getImageUrl = (imageUrl: string | null | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  
  // Se já é uma URL completa, retorna como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  const baseURL = resolveBaseURL();
  const origin = baseURL.replace(/\/+api\/?$/, '');
  return `${origin}${imageUrl}`;
};

export default api;
