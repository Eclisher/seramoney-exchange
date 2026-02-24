import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("seramoney-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string | undefined = error.config?.url;

    const isAuthEndpoint =
      requestUrl?.includes("/auth/login") ||
      requestUrl?.includes("/auth/register");
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("seramoney-token");
      localStorage.removeItem("seramoney-user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export const getMyTransactions = async () => {
  const response = await api.get(`/me/transactions`);
  return response.data;
};

export const getClientTransactions = async (clientId: string) => {
  const response = await api.get(`/admin/clients/${clientId}/transactions`);
  return response.data;
};
export const updateTransactionStatus = async (transactionId: string, status: string, notes?: string) => {
  const response = await api.put(`/admin/transactions/${transactionId}/status`, { status, notes });
  return response.data;
};

export default api;
