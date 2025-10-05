// 📁 src/domains/base-service.js
export class BaseService {
  constructor(baseUrl) {
    const envUrl = import.meta?.env?.VITE_API_BASE_URL?.trim();
    const resolved = (baseUrl || envUrl || "https://biblio-webapi.onrender.com/").trim();
    this.baseUrl = resolved.endsWith("/") ? resolved : resolved + "/";

    // Timeout e retries
    this.defaultTimeoutMs = 65000; // 65s (para cold start do Render)
    this.maxRetries = 2;           // total de tentativas = 1 (original) + 2 retries
    this.backoffMs = [1200, 3000]; // esperas entre as tentativas
  }

  async request(endpoint, { method = "GET", body, headers = {}, timeoutMs } = {}) {
    const token = localStorage.getItem("token") || null;

    const finalHeaders = { "Content-Type": "application/json", ...headers };
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    const url = this.baseUrl + String(endpoint).replace(/^\//, "");

    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs ?? this.defaultTimeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers: finalHeaders,
          body: body ? JSON.stringify(body) : undefined,
          redirect: "follow",
          signal: controller.signal,
          // mode: "cors",
          // credentials: "omit",
        });

        clearTimeout(id);

        if (response.status === 204) return {};
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
          const vercelHint = response.headers.get("x-vercel-error");
          const raw = await response.text().catch(() => "");
          if (vercelHint === "NOT_FOUND") {
            throw new Error(`404 (Vercel NOT_FOUND). Verifique rota/proxy. URL: ${url}`);
          }
          throw new Error(raw || `Erro ${response.status}: ${response.statusText}`);
        }

        if (contentType.includes("application/json")) {
          const text = await response.text();
          return text ? JSON.parse(text) : {};
        }
        if (contentType.includes("text/")) {
          return await response.text();
        }
        try { return await response.json(); } catch {}
        try { return await response.text(); } catch {}
        return {};

      } catch (err) {
        clearTimeout(id);
        lastErr = err;

        // Se foi timeout (AbortError) ou erro de rede, tentar de novo com backoff
        const isAbort = err?.name === "AbortError";
        const isNetwork = String(err?.message || "").toLowerCase().includes("falha de rede") || isAbort;

        if (attempt < this.maxRetries && isNetwork) {
          const wait = this.backoffMs[attempt] ?? 2000;
          await new Promise(r => setTimeout(r, wait));
          continue; // retry
        }

        // Última tentativa fracassou → propaga
        if (isAbort) throw new Error("Tempo de requisição excedido. Tente novamente.");
        throw new Error(err?.message || "Falha de rede ao acessar a API. Verifique a URL e o CORS.");
      }
    }

    // fallback (não deveria chegar aqui)
    throw lastErr || new Error("Falha desconhecida ao acessar a API.");
  }

  get(endpoint, options = {}) { return this.request(endpoint, { ...options, method: "GET" }); }
  post(endpoint, body, options = {}) { return this.request(endpoint, { ...options, method: "POST", body }); }
  patch(endpoint, body, options = {}) { return this.request(endpoint, { ...options, method: "PATCH", body }); }
  put(endpoint, body, options = {}) { return this.request(endpoint, { ...options, method: "PUT", body }); }
  delete(endpoint, options = {}) { return this.request(endpoint, { ...options, method: "DELETE" }); }
}
