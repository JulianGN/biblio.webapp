// 📁 src/domains/base-service.js
export class BaseService {
  constructor(baseUrl) {
    const envUrl = import.meta?.env?.VITE_API_BASE_URL?.trim();
    const resolved = (baseUrl || envUrl || "https://biblio-webapi.onrender.com/").trim();
    this.baseUrl = resolved.endsWith("/") ? resolved : resolved + "/";
    this.defaultTimeoutMs = 20000; // 20s
  }

  async request(endpoint, { method = "GET", body, headers = {}, timeoutMs } = {}) {
    const token = localStorage.getItem("token") || null;

    const finalHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    const url = this.baseUrl + String(endpoint).replace(/^\//, "");

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs ?? this.defaultTimeoutMs);

    let response;
    try {
      response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
        redirect: "follow",
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(id);
      console.error("❌ Network/Fetch error:", err);
      if (err.name === "AbortError") {
        throw new Error("Tempo de requisição excedido. Tente novamente.");
      }
      throw new Error("Falha de rede ao acessar a API. Verifique a URL e o CORS.");
    } finally {
      clearTimeout(id);
    }

    // 204 = No Content
    if (response.status === 204) return {};

    const contentType = response.headers.get("content-type") || "";

    // Erros HTTP
    if (!response.ok) {
      // Dica específica se algum dia apontar para /api na Vercel sem rewrite
      const vercelHint = response.headers.get("x-vercel-error");
      const raw = await response.text().catch(() => "");
      if (vercelHint === "NOT_FOUND") {
        throw new Error(`404 (Vercel NOT_FOUND). Verifique a rota/proxy. URL: ${url}`);
      }
      throw new Error(raw || `Erro ${response.status}: ${response.statusText}`);
    }

    // Parse pelo Content-Type
    if (contentType.includes("application/json")) {
      // Pode vir vazio mesmo com header JSON
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    }

    if (contentType.includes("text/")) {
      return await response.text();
    }

    // Fallback: tentar blob/arrayBuffer conforme necessidade
    try {
      return await response.json();
    } catch {
      try {
        return await response.text();
      } catch {
        return {}; // último recurso
      }
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
