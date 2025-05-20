// View de autenticação
export class AuthView {
  renderLogin(onLogin) {
    document.querySelector("#app-content").innerHTML = `
      <div class="login-container">
        <img src="/assets/imgs/logo.png" alt="Logo Bibliotecas Conectadas" id="logo-bibliotecas" /> 
        <form id="login-form">
          <h2>Login</h2>
          <div>
            <label for="username">Usuário:</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div>
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Entrar</button>
        </form>
      </div>
    `;
    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      onLogin(username, password);
    });
  }
}
