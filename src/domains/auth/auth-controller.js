// Controller de autenticação
export class AuthController {
  constructor() {
    this.isAuthenticated = false;
  }

  login(username, password) {
    // Não faz validação real por enquanto
    this.isAuthenticated = true;
    return true;
  }

  logout() {
    this.isAuthenticated = false;
  }

  checkAuth() {
    return this.isAuthenticated;
  }
}
