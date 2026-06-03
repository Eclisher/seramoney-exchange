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
const response = await api.patch(
  `/admin/transactions/${transactionId}/status`,
  { status, notes },
);  return response.data;
};
export const getCryptos = async () => {
  const response = await api.get("/cryptos");
  return response.data;
};

export const createCrypto = async (data: any) => {
  const response = await api.post("/cryptos", data);
  return response.data;
};

export const updateCrypto = async (id: string, data: any) => {
  const response = await api.put(`/cryptos/${id}`, data);
  return response.data;
};

export const deleteCrypto = async (id: string) => {
  const response = await api.delete(`/cryptos/${id}`);
  return response.data;
};

export const getWallets = async () => {
  const response = await api.get("/wallets");
  return response.data;
};

export const createWallet = async (data: any) => {
  const response = await api.post("/wallets", data);
  return response.data;
};

export const updateWallet = async (id: string, data: any) => {
  const response = await api.put(`/wallets/${id}`, data);
  return response.data;
};

export const deleteWallet = async (id: string) => {
  const response = await api.delete(`/wallets/${id}`);
  return response.data;
};

type WalletAddressPayload = {
  crypto_id: string;
  network?: string;
  address: string;
};

const walletAddressPathCandidates = (walletId: string) => [
  `/wallets/${walletId}/addresses`,
  `/wallets/wallets/${walletId}/addresses`,
];

const resolveWalletAddressPath = async (walletId: string) => {
  const candidates = walletAddressPathCandidates(walletId);
  for (const path of candidates) {
    try {
      await api.get(path);
      return path;
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        return path;
      }
    }
  }

  return candidates[0];
};

export const getWalletAddresses = async (walletId: string) => {
  const path = await resolveWalletAddressPath(walletId);
  const response = await api.get(path);
  return response.data;
};

export const createWalletAddress = async (
  walletId: string,
  data: WalletAddressPayload,
) => {
  const path = await resolveWalletAddressPath(walletId);
  const response = await api.post(path, data);
  return response.data;
};

export const deleteWalletAddress = async (
  walletId: string,
  addressId: string,
) => {
  const basePath = await resolveWalletAddressPath(walletId);
  const response = await api.delete(`${basePath}/${addressId}`);
  return response.data;
};

export const replaceWalletAddresses = async (
  walletId: string,
  addresses: WalletAddressPayload[],
) => {
  let existing: any[] = [];
  try {
    const data = await getWalletAddresses(walletId);
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0]?.addresses)) {
        const currentWallet = data.find((item) => item.id === walletId);
        existing = currentWallet?.addresses ?? [];
      } else {
        existing = data;
      }
    }
  } catch {
    existing = [];
  }

  await Promise.all(
    existing
      .filter((item) => item?.id)
      .map((item) => deleteWalletAddress(walletId, item.id)),
  );

  await Promise.all(
    addresses.map((item) => createWalletAddress(walletId, item)),
  );
};
export async function uploadTransactionImage(params: {
  transaction_id: string;
  file: File;
  title?: string;
}) {
  const form = new FormData();
  form.append("image", params.file);
  form.append("transaction_id", params.transaction_id);
  if (params.title) form.append("title", params.title);
  const res = await api.post("/transaction-images/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { message, data }
}
export async function getTransactionImages(transaction_id: string) {
  const res = await api.get(`/transaction-images/${transaction_id}`);
  return res.data as Array<{
    id: string;
    image_base64: string;
    title: string;
    created_at: string;
  }>;
}
export default api;
