export async function authRoutes({ authController, authView, navigate }) {
  function clearHeader() {
    const main = document.querySelector("main");
    if (main) main.remove();
    const header = document.getElementById("main-header");
    if (header) header.remove();
    const publicHeader = document.getElementById("public-header");
    if (publicHeader) publicHeader.remove();
    const appContent = document.getElementById("app-content");
    if (appContent) appContent.remove();
    document.querySelector("#app").innerHTML = "";
  }

  clearHeader();
  window.scrollTo(0, 0);
  const path = window.location.pathname;
  switch (path) {
    case "/login":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main class="main-login"><div id="app-content" class="app-content"></div></main>`
      );
      authView.renderLogin((username, password) => {
        authController.login(username, password);
        navigate("/livros");
      });
      return true;
    default:
      return false;
  }
}
