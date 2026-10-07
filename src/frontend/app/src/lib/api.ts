import axios from "axios";

type ApiProblemDetails = {
  title?: string;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
};

export function obterMensagemErroApi(
  error: unknown,
  fallback = "Erro ao processar a requisição.",
) {
  if (axios.isAxiosError<ApiProblemDetails>(error)) {
    const data = error.response?.data;
    if (data?.detail?.trim()) {
      return data.detail;
    }

    const erros = data?.errors
      ? Object.values(data.errors).flat().filter(Boolean)
      : [];

    if (erros.length > 0) {
      return erros.join(" ");
    }

    if (data?.title?.trim()) {
      return data.title;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

clienteApi.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth-storage");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-storage");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (axios.isAxiosError(error)) {
      error.message = obterMensagemErroApi(error, error.message);
    }

    return Promise.reject(error);
  },
);
