import "./css/style.css";
import "./components/biblioteca/biblioteca-form.js";
import "./components/biblioteca/biblioteca-list.js";
import "./components/livro/livro-form.js";
import "./components/livro/livro-list.js";

import { GestorController } from "./domains/gestor/gestor-controller.js";
import { GestorView } from "./domains/gestor/gestor-view.js";
import { AuthController } from "./domains/auth/auth-controller.js";
import { AuthView } from "./domains/auth/auth-view.js";

const gestorController = new GestorController();
const gestorView = new GestorView();
const authController = new AuthController();
const authView = new AuthView();

document.querySelector("#app").innerHTML = `
  <div>
    <h1>Bibliotecas Conectadas</h1>
    <div class="container">
      <div class="form-container">
        <h2>Bibliotecas</h2>
        <biblioteca-form></biblioteca-form>
        <biblioteca-list></biblioteca-list>
      </div>
      <div class="form-container">
        <h2>Livros</h2>
        <livro-form></livro-form>
        <livro-list></livro-list>
      </div>
    </div>
  </div>
`;

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
}

function renderHeader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <header id="main-header">
      <h1>Bibliotecas Conectadas</h1>
      <nav>
        <button id="navLivrosBtn">Livros</button>
        <button id="navUnidadesBtn">Unidades</button>
      </nav>
    </header>
    <div id="app-content"></div>
  `
  );
  document.getElementById("navLivrosBtn").onclick = () => navigate("/livros");
  document.getElementById("navUnidadesBtn").onclick = () =>
    navigate("/unidades");
}

function clearHeader() {
  const header = document.getElementById("main-header");
  if (header) header.remove();
  const appContent = document.getElementById("app-content");
  if (appContent) appContent.remove();
  // Limpa também o #app para evitar conteúdo duplicado
  document.querySelector("#app").innerHTML = "";
}

function router() {
  clearHeader();
  const path = window.location.pathname;
  if (path === "/login") {
    document.querySelector("#app").innerHTML = "";
    authView.renderLogin((username, password) => {
      authController.login(username, password);
      navigate("/livros");
    });
  } else if (path.startsWith("/livros") || path.startsWith("/unidades")) {
    renderHeader();
    if (path === "/livros") {
      document.querySelector(
        "#app-content"
      ).innerHTML = `<button id="addLivroBtn" style="margin-bottom:16px">+ Adicionar Livro</button><div id="livros-list"></div>`;
      document.getElementById("addLivroBtn").onclick = () =>
        navigate("/livros/novo");
      gestorController.showLivrosPage({
        onAdd: () => navigate("/livros/novo"),
        onEdit: (id) => navigate(`/livros/${id}`),
        onDelete: (id) => {
          gestorController.deleteLivro(id);
          router();
        },
      });
    } else if (path === "/livros/novo") {
      gestorController.showLivroForm(null, () => navigate("/livros"));
    } else if (/^\/livros\/[0-9]+$/.test(path)) {
      const id = parseInt(path.split("/")[2]);
      gestorController.editLivro(id, () => navigate("/livros"));
    } else if (path === "/unidades") {
      document.querySelector(
        "#app-content"
      ).innerHTML = `<button id="addUnidadeBtn" style="margin-bottom:16px">+ Adicionar Unidade</button><div id="unidades-list"></div>`;
      document.getElementById("addUnidadeBtn").onclick = () =>
        navigate("/unidades/novo");
      gestorController.showUnidadesPage({
        onAdd: () => navigate("/unidades/novo"),
        onEdit: (id) => navigate(`/unidades/${id}`),
        onDelete: (id) => {
          gestorController.deleteUnidade(id);
          router();
        },
      });
    } else if (path === "/unidades/novo") {
      gestorController.showUnidadeForm(null, () => navigate("/unidades"));
    } else if (/^\/unidades\/[0-9]+$/.test(path)) {
      const id = parseInt(path.split("/")[2]);
      gestorController.editUnidade(id, () => navigate("/unidades"));
    }
  } else {
    navigate("/login");
  }
}

window.addEventListener("popstate", router);

// Inicialização
router();

// Exemplo: para navegação programática, use navigate('/login'), navigate('/livros'), etc.

// Adicionar apenas CSS reset (Eric Meyer's Reset CSS)
const style = document.createElement("style");
style.textContent = `
/* http://meyerweb.com/eric/tools/css/reset/ 
   v2.0 | 20110126
   License: none (public domain)
*/
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
`;
document.head.appendChild(style);
