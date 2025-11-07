export async function authRoutes({ authController, authView, navigate }) {
  const path = window.location.pathname;

  // Só cuida da rota /login. Se não for, não mexe no DOM.
  if (path !== "/login") return false;

  // Limpa o shell atual apenas quando for /login
  function clearHeader() {
    const main = document.querySelector("main");
    if (main) main.remove();
    const header = document.getElementById("main-header");
    if (header) header.remove();
    const publicHeader = document.getElementById("public-header");
    if (publicHeader) publicHeader.remove();
    const appContent = document.getElementById("app-content");
    if (appContent) appContent.remove();
    const app = document.querySelector("#app");
    if (app) app.innerHTML = "";
  }

  clearHeader();
  window.scrollTo(0, 0);
  switch (path) {
    case "/login":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main class="main-login"><div id="app-content" class="app-content"></div></main>`
      );

      // Renderiza o form e trata o submit
      authView.renderLogin(async (username, password) => {
        try {
          // garante chamada assíncrona; ajuste se seu login retornar boolean/throw
          await authController.login(username, password);
          navigate("/livros"); // só após sucesso
        } catch (err) {
          console.error("Falha no login:", err);
          // Se seu authView tiver método para mostrar erro, use-o:
          if (typeof authView.showError === "function") {
            authView.showError("Usuário ou senha inválidos.");
          } else {
            alert("Usuário ou senha inválidos.");
          }
        }
      });

      return true;
    default:
      return false;
  }
}
