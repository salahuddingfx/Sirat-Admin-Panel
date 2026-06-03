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

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("sirat_admin_user");
        localStorage.removeItem("sirat_admin_token");
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );

  return client;
}
