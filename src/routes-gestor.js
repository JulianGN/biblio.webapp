// 📁 src/routes/gestor-routes.js
export async function gestorRoutes({ gestorController, gestorView, navigate }) {
  const path = window.location.pathname;

  // Só processa rotas que começam com /livros ou /unidades
  if (!/^\/(livros|unidades)/.test(path)) {
    return false;
  }

  function clearHeader() {
    const main = document.querySelector("main");
    if (main) main.remove();
    const header = document.getElementById("main-header");
    if (header) header.remove();
    const appContent = document.getElementById("app-content");
    if (appContent) appContent.remove();
    const app = document.querySelector("#app");
    if (app) app.innerHTML = "";
  }

  function renderShell() {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
  }

  clearHeader();
  window.scrollTo(0, 0);

  /* ─────────────────────────────────────────
   *  Detalhes (antes do switch)
   * ───────────────────────────────────────── */
  if (/^\/livros\/[0-9]+\/detalhe\/?$/.test(path)) {
    renderShell();
    const id = parseInt(path.split("/")[2], 10);
    await gestorController.showLivroDetalhe(id);
    return true;
  }

  if (/^\/unidades\/[0-9]+\/detalhe\/?$/.test(path)) {
    renderShell();
    const id = parseInt(path.split("/")[2], 10);
    await gestorController.showUnidadeDetalhe(id);
    return true;
  }

  /* ─────────────────────────────────────────
   *  Edição dinâmica
   * ───────────────────────────────────────── */

  // ✅ /livros/:id/editar  → abrir form de edição com ID na URL
  if (/^\/livros\/[0-9]+\/editar\/?$/.test(path)) {
    renderShell();
    const id = parseInt(path.split("/")[2], 10);
    await gestorController.showLivroForm(id, () => navigate("/livros"));
    return true;
  }

  // Fallback: /livros/:id  → também abre o form (caso alguém acesse direto)
  if (/^\/livros\/[0-9]+\/?$/.test(path)) {
    renderShell();
    const id = parseInt(path.split("/")[2], 10);
    await gestorController.showLivroForm(id, () => navigate("/livros"));
    return true;
  }

  // /unidades/:id  → editar unidade
  if (/^\/unidades\/[0-9]+\/?$/.test(path)) {
    renderShell();
    const id = parseInt(path.split("/")[2], 10);
    await gestorController.editUnidade(id, () => navigate("/unidades"));
    return true;
  }

  // /livros/:id/exemplares  → form de exemplares por unidade
  if (/^\/livros\/[0-9]+\/exemplares\/?$/.test(path)) {
    renderShell();
    const id = parseInt(path.split("/")[2], 10);
    await gestorController.showLivroExemplaresForm(id, () => navigate("/livros"));
    return true;
  }

  /* ─────────────────────────────────────────
   *  Rotas principais
   * ───────────────────────────────────────── */
  switch (path) {
    case "/livros": {
      renderShell();
      document.querySelector("#app-content").innerHTML = `<div id="livros-list"></div>`;

      // ⚠️ Mudança: agora NAVEGA para /livros/:id/editar para o form captar o ID da URL
      await gestorController.showLivrosPage({
        onAdd: () => navigate("/livros/novo"),
        onEdit: (id) => navigate(`/livros/${id}/editar`),          // ← aqui!
        onDelete: async (id) => {
          await gestorController.removerLivro(id);
          await gestorController.showLivrosPage({}); // re-render da lista
        },
        onView: (id) => navigate(`/livros/${id}/detalhe`),
        onEditExemplares: (id) => navigate(`/livros/${id}/exemplares`),
      });
      return true;
    }

    case "/livros/novo": {
      renderShell();
      await gestorController.showLivroForm(null, () => navigate("/livros"));
      return true;
    }

    case "/unidades": {
      renderShell();
      document.querySelector("#app-content").innerHTML = `<div id="unidades-list"></div>`;
      await gestorController.showUnidadesPage({
        onAdd: () => gestorController.editUnidade(null, () => navigate("/unidades")),
        onEdit: (id) => gestorController.editUnidade(id, () => navigate("/unidades")),
        onDelete: async (id) => {
          await gestorController.deleteUnidade(id);
          await gestorController.showUnidadesPage({});
        },
        onView: (id) => navigate(`/unidades/${id}/detalhe`),
      });
      return true;
    }

    case "/unidades/novo": {
      renderShell();
      await gestorController.editUnidade(null, () => navigate("/unidades"));
      return true;
    }

    default:
      return false;
  }
}
