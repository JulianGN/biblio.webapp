// src/domains/base-service.js
export class BaseService {
  constructor(baseUrl = "http://127.0.0.1:8000/") {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, { method = "GET", body, headers = {} } = {}) {
    // Inclui token JWT de autenticação se disponível
    const token = localStorage.getItem('authToken');
    const finalHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(this.baseUrl + endpoint, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (response.status === 401) {
      console.warn("Token inválido ou expirado - redirecionando para login");
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      
      if (window.navigate) {
        window.navigate("/login");
      }
      
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Erro ${response.status}`);
    }
    
    return response.json();
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
