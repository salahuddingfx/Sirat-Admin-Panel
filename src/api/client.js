import axios from "axios";

export function createApiClient(baseURL, getToken) {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json"
    }
  });

  client.interceptors.request.use((config) => {
    const token = getToken?.();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return client;
}
