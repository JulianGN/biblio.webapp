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
   1) GUARD global para impedir o roteador de
      capturar cliques nos botões de ação da lista
   ────────────────────────────────────────────── */
// Qualquer elemento com data-stop-route NÃO deve disparar navegação SPA.
document.addEventListener(
  "click",
  (e) => {
    const el = e.target?.closest?.("[data-stop-route], .livro-list-actions button, .livro-list-actions i");
    if (el) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      // Evita que âncoras com href troquem a URL
      if (el.tagName === "A" && el.hasAttribute("href")) {
        return false;
      }
    }
  },
  true // ← em CAPTURA, antes de qualquer outro listener
);

/* ──────────────────────────────────────────────
   2) navigate com log — ajuda a identificar
      quem está chamando navegação.
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
