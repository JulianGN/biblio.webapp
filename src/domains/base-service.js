// 📁 src/domains/base-service.js
export class BaseService {
  constructor(baseUrl) {
    // Permite configurar por várias fontes:
    // 1) parâmetro do construtor
    // 2) VITE_API_URL (recomendado)
    // 3) VITE_API_BASE_URL (legado)
    // 4) window.API_URL (fallback runtime)
    // 5) default onrender (produção)
    const env = (typeof import !== "undefined" && import.meta?.env) || {};
    const fromEnv =
      baseUrl ||
      env.VITE_API_URL ||
      env.VITE_API_BASE_URL ||
      (typeof window !== "undefined" && window.API_URL) ||
      "https://biblio-webapi.onrender.com";

    const trimmed = String(fromEnv).trim();
    // Normaliza: remove barra final
    this.baseUrl = trimmed.replace(/\/+$/, "");

    // Timeout e retries
    this.defaultTimeoutMs = 65_000; // 65s (cold start / rede lenta)
    this.maxRetries = 2;            // total = 1 (original) + 2 retries
    this.backoffMs = [1200, 3000];  // esperas entre tentativas
  }

  /** Junta baseUrl + path com segurança */
  buildUrl(path = "") {
    const p = String(path || "");
    // Se path já é absoluto (http...), retorna como está
    if (/^https?:\/\//i.test(p)) return p;
    // Remove barras extras no começo do path e concatena com uma única barra
    return `${this.baseUrl}/${p.replace(/^\/+/, "")}`;
  }

  async request(endpoint, { method = "GET", body, headers = {}, timeoutMs } = {}) {
    const token =
      (typeof localStorage !== "undefined" && localStorage.getItem("token")) ||
      null;

    const finalHeaders = { "Content-Type": "application/json", ...headers };
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    const url = this.buildUrl(endpoint);

    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), timeoutMs ?? this.defaultTimeoutMs);

      try {
        const res = await fetch(url, {
          method,
          headers: finalHeaders,
          body: body != null ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          mode: "cors",
          credentials: "omit", // DRF sem sessão/CSRF
          redirect: "follow",
        });

        clearTimeout(timerId);

        // 204 No Content
        if (res.status === 204) return {};

        const contentType = res.headers.get("content-type") || "";
        const vercelHint = res.headers.get("x-vercel-error");

        if (!res.ok) {
          const raw = await res.text().catch(() => "");
          if (vercelHint === "NOT_FOUND") {
            throw new Error(`404 (Vercel NOT_FOUND) na URL: ${url}`);
          }
          // Inclui status, statusText e corpo para facilitar o debug
          const detail = raw || res.statusText || "Erro HTTP";
          throw new Error(`Erro ${res.status} em ${url} — ${detail}`);
        }

        // Prioriza JSON
        if (contentType.includes("application/json")) {
          // evita erro quando body vazio
          const text = await res.text();
          return text ? JSON.parse(text) : {};
        }

        // Texto simples
        if (contentType.startsWith("text/")) {
          return await res.text();
        }

        // Tentativas finais de parse
        try { return await res.json(); } catch {}
        try { return await res.text(); } catch {}

        return {};
      } catch (err) {
        clearTimeout(timerId);
        lastErr = err;

        const isAbort = err?.name === "AbortError";
        const msg = String(err?.message || "").toLowerCase();
        const isNetwork =
          isAbort ||
          msg.includes("networkerror") ||
          msg.includes("failed to fetch") ||
          msg.includes("falha de rede") ||
          msg.includes("load failed") ||
          msg.includes("typeerror: network");

        // Retry apenas para erro de rede/timeout
        if (attempt < this.maxRetries && isNetwork) {
          const wait = this.backoffMs[attempt] ?? 2000;
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }

        // Última tentativa falhou → propaga mensagem mais amigável
        if (isAbort) {
          throw new Error("Tempo de requisição excedido. Verifique sua conexão e tente novamente.");
        }
        throw new Error(
          err?.message ||
            `Falha de rede ao acessar a API (${url}). Verifique a URL, CORS e disponibilidade do servidor.`
        );
      }
    }

    // fallback (não deveria chegar aqui)
    throw lastErr || new Error("Falha desconhecida ao acessar a API.");
  }

  // Helpers HTTP
  get(endpoint, options = {})    { return this.request(endpoint, { ...options, method: "GET" }); }
  post(endpoint, body, options = {})  { return this.request(endpoint, { ...options, method: "POST", body }); }
  patch(endpoint, body, options = {}) { return this.request(endpoint, { ...options, method: "PATCH", body }); }
  put(endpoint, body, options = {})   { return this.request(endpoint, { ...options, method: "PUT", body }); }
  delete(endpoint, options = {})      { return this.request(endpoint, { ...options, method: "DELETE" }); }
}
