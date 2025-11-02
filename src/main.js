import "./css/style.css";
import "./components/livro/livro-form.js";
import "./components/livro/livro-list.js";
import "./components/unidade/unidade-form.js";
import "./components/unidade/unidade-list.js";
import "./components/app-header.js";
import { router as appRouter } from "./routes.js";
import { GestorController } from "./domains/gestor/gestor-controller.js";
import { AuthController } from "./domains/auth/auth-controller.js";
import { AuthView } from "./domains/auth/auth-view.js";
import { GestorView } from "./domains/gestor/gestor-view.js";

const gestorController = new GestorController();
window.gestorController = gestorController;
const authController = new AuthController();
const authView = new AuthView();
const gestorView = new GestorView();
window.gestorView = gestorView;

function navigate(path) {
  window.history.pushState({}, "", path);
  appRouter({
    gestorController,
    gestorView,
    authController,
    authView,
    navigate,
  });
  window.scrollTo(0, 0);
}

window.navigate = navigate;

window.addEventListener("popstate", () =>
  appRouter({
    gestorController,
    gestorView,
    authController,
    authView,
    navigate,
  })
);

appRouter({ gestorController, gestorView, authController, authView, navigate });
