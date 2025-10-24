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
            <input type="text" id="username" name="username" placeholder="Digite qualquer usuário" />
          </div>
          <div>
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" placeholder="Digite qualquer senha" />
          </div>
          <button type="submit">Entrar</button>
        </form>
        <div style="text-align:center;margin-top:1.5rem;">
          <a href="/faq" id="faq-link" style="color:var(--primary);text-decoration:none;display:inline-flex;align-items:center;gap:0.5rem;">
            <i class="fa-solid fa-circle-question"></i>
            <span>Dúvidas? Consulte o FAQ</span>
          </a>
        </div>
      </div>
    `;
    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      onLogin(username, password);
    });
    
    const faqLink = document.getElementById("faq-link");
    if (faqLink) {
      faqLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.navigate && window.navigate("/faq");
      });
    }
  }
}
