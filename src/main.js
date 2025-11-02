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

/* ──────────────────────────────────────────────
   1) Guard global: só trata links <a href="/...">
      Não intercepta <button>, nem ícones.
   ────────────────────────────────────────────── */
document.addEventListener(
  "click",
  (e) => {
    const a = e.target?.closest?.("a[href]");
    if (!a) return; // não é link → deixe o clique seguir

    const href = a.getAttribute("href");

    // Só SPA para rotas internas (começam com "/")
    if (href && href.startsWith("/")) {
      e.preventDefault(); // evita reload
      if (window.navigate) window.navigate(href);
    }
  },
  true // captura primeiro, mas sem stopPropagation
);

/* ──────────────────────────────────────────────
   2) Navegação SPA
   ────────────────────────────────────────────── */
function _invokeRouter(path) {
  appRouter({
    gestorController,
    gestorView,
    authController,
    authView,
    navigate,
  });
  window.scrollTo(0, 0);
}

function navigate(path, meta = {}) {
  try {
    console.debug("[NAVIGATE]", path, meta);
  } catch {}
  window.history.pushState({}, "", path);
  _invokeRouter(path);
}
window.navigate = navigate;

window.addEventListener("popstate", () =>
  _invokeRouter(document.location.pathname)
);

/* ──────────────────────────────────────────────
   3) Primeira renderização de rotas
   ────────────────────────────────────────────── */
_invokeRouter(document.location.pathname);
