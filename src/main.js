import "./css/style.css";
import "./components/livro/livro-form.js";
import "./components/livro/livro-list.js";
import "./components/unidade/unidade-form.js";
import "./components/unidade/unidade-list.js";
import "./components/app-header.js";

import { GestorController } from "./domains/gestor/gestor-controller.js";
import { AuthController } from "./domains/auth/auth-controller.js";
import { AuthView } from "./domains/auth/auth-view.js";

const gestorController = new GestorController();
window.gestorController = gestorController;
const authController = new AuthController();
const authView = new AuthView();

function startApp() {
  gestorController.showLivrosPage();
}

function showLogin() {
  authView.renderLogin((username, password) => {
    authController.login(username, password);
    startApp();
  });
}

function navigate(path) {
  window.history.pushState({}, "", path);
  router();
  window.scrollTo(0, 0); // Garante que a tela sempre vá para o topo ao trocar de rota
}

window.navigate = navigate;

function clearHeader() {
  // Remove o main antigo se existir
  const main = document.querySelector("main");
  if (main) main.remove();
  const header = document.getElementById("main-header");
  if (header) header.remove();
  const appContent = document.getElementById("app-content");
  if (appContent) appContent.remove();
  // Limpa também o #app para evitar conteúdo duplicado
  document.querySelector("#app").innerHTML = "";
}

function router() {
  clearHeader();
  window.scrollTo(0, 0);
  const path = window.location.pathname;

  // Rotas dinâmicas para detalhes (devem vir antes do switch)
  if (/^\/livros\/[0-9]+\/detalhe$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      /* html */ `
      <main>
        <app-header></app-header>
        <div id="app-content" class="app-content"></div>
      </main>
    `
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.showLivroDetalhe(id);
    return;
  }
  if (/^\/unidades\/[0-9]+\/detalhe$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      /* html */ `
      <main>
        <app-header></app-header>
        <div id="app-content" class="app-content"></div>
      </main>
    `
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.showUnidadeDetalhe(id);
    return;
  }

  // Rotas dinâmicas para edição
  if (/^\/livros\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      /* html */ `
      <main>
        <app-header></app-header>
        <div id="app-content" class="app-content"></div>
      </main>
    `
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.editLivro(id, () => navigate("/livros"));
    return;
  }
  if (/^\/unidades\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      /* html */ `
      <main>
        <app-header></app-header>
        <div id="app-content" class="app-content"></div>
      </main>
    `
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.editUnidade(id, () => navigate("/unidades"));
    return;
  }

  // Rotas principais
  switch (path) {
    case "/login":
      document.querySelector("#app").innerHTML = "";
      authView.renderLogin((username, password) => {
        authController.login(username, password);
        navigate("/livros");
      });
      break;
    case "/livros":
      document.body.insertAdjacentHTML(
        "afterbegin",
        /* html */ `
        <main>
          <app-header></app-header>
          <div id="app-content" class="app-content"></div>
        </main>
      `
      );
      document.querySelector(
        "#app-content"
      ).innerHTML = /* html */ `<div id="livros-list"></div>`;
      gestorController.showLivrosPage({
        onAdd: () => navigate("/livros/novo"),
        onEdit: (id) => navigate(`/livros/${id}`),
        onDelete: (id) => {
          gestorController.deleteLivro(id);
          router();
        },
        onView: (id) => navigate(`/livros/${id}/detalhe`),
      });
      break;
    case "/livros/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        /* html */ `
        <main>
          <app-header></app-header>
          <div id="app-content" class="app-content"></div>
        </main>
      `
      );
      gestorController.showLivroForm(null, () => navigate("/livros"));
      break;
    case "/unidades":
      document.body.insertAdjacentHTML(
        "afterbegin",
        /* html */ `
        <main>
          <app-header></app-header>
          <div id="app-content" class="app-content"></div>
        </main>
      `
      );
      document.querySelector(
        "#app-content"
      ).innerHTML = /* html */ `<div id="unidades-list"></div>`;
      gestorController.showUnidadesPage({
        onAdd: () => navigate("/unidades/novo"),
        onEdit: (id) => navigate(`/unidades/${id}`),
        onDelete: (id) => {
          gestorController.deleteUnidade(id);
          router();
        },
        onView: (id) => navigate(`/unidades/${id}/detalhe`),
      });
      break;
    case "/unidades/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        /* html */ `
        <main>
          <app-header></app-header>
          <div id="app-content" class="app-content"></div>
        </main>
      `
      );
      gestorController.showUnidadeForm(null, () => navigate("/unidades"));
      break;
    default:
      navigate("/login");
      break;
  }
}

window.addEventListener("popstate", router);

// Inicialização
router();

// Exemplo: para navegação programática, use navigate('/login'), navigate('/livros'), etc.
