// 📁 src/domains/base-service.js

export class BaseService {
  constructor(baseUrl) {
    // 🔧 Detecta ambiente automaticamente
    if (!baseUrl) {
      if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL;
      } else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        this.baseUrl = "http://localhost:8000/";
      } else {
        // 🔹 Em produção, usa a mesma origem (ajusta conforme seu backend)
        this.baseUrl = window.location.origin + "/api/";
      }
    } else {
      this.baseUrl = baseUrl;
    }
  }

  async request(endpoint, { method = "GET", body, headers = {} } = {}) {
    const token = localStorage.getItem("token") || null;

    const finalHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    const url = this.baseUrl.endsWith("/")
      ? `${this.baseUrl}${endpoint.replace(/^\//, "")}`
      : `${this.baseUrl}/${endpoint.replace(/^\//, "")}`;

    try {
      const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
        redirect: "follow",
      });

      // 🧩 Trata redirecionamentos e respostas vazias
      if (response.status === 204) return {}; // No Content
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erro ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error("❌ Erro em BaseService.request:", error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}
