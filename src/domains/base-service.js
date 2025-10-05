// src/domains/base-service.js
export class BaseService {
  constructor(baseUrl) {
    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const envUrl = import.meta?.env?.VITE_API_BASE_URL?.trim();

    // Em DEV aceita fallback para http://localhost:8000/
    // Em PRODUÇÃO exige VITE_API_BASE_URL (evita apontar para a mesma origem /api e tomar 404 na Vercel)
    if (!baseUrl) {
      if (envUrl) {
        this.baseUrl = envUrl.endsWith("/") ? envUrl : envUrl + "/";
      } else if (isLocalhost) {
        this.baseUrl = "http://localhost:8000/";
      } else {
        // Falha explícita para não mascarar erro de rota inexistente na Vercel
        throw new Error(
          "VITE_API_BASE_URL não definida em produção. Configure a URL do backend (ex.: https://<sua-api>.railway.app/)."
        );
      }
    } else {
      this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    }
  }

  async request(endpoint, { method = "GET", body, headers = {} } = {}) {
    const token = localStorage.getItem("token") || null;

    const finalHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    const url = this.baseUrl + String(endpoint).replace(/^\//, "");

    let response;
    try {
      response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
        redirect: "follow",
      });
    } catch (err) {
      console.error("❌ Network/Fetch error:", err);
      throw new Error("Falha de rede ao acessar a API. Verifique a URL e o CORS.");
    }

    // Trata 204 (sem corpo)
    if (response.status === 204) return {};

    const raw = await response.text();

    if (!response.ok) {
      // Ajuda a identificar o 404 de Vercel (rota inexistente)
      const vercelHint = response.headers.get("x-vercel-error");
      if (vercelHint === "NOT_FOUND") {
        throw new Error(
          `Rota inexistente na Vercel (404 NOT_FOUND). Verifique se o frontend está chamando a API certa. URL: ${url}`
        );
      }
      throw new Error(raw || `Erro ${response.status}: ${response.statusText}`);
    }

    // Conteúdo pode ser vazio ou não-JSON
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return raw; // fallback: texto simples
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
