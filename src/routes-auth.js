// src/routes-auth.js
export function authRoutes({ authController, authView, navigate }) {
  const path = window.location.pathname;
  switch (path) {
    case "/login":
      document.querySelector("#app").innerHTML = "";
      authView.renderLogin((username, password) => {
        authController.login(username, password);
        navigate("/livros");
      });
      return true;
    default:
      return false;
  }
}
