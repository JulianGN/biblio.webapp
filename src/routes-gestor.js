export async function gestorRoutes({ gestorController, gestorView, navigate }) {
  function clearHeader() {
    const main = document.querySelector("main");
    if (main) main.remove();
    const header = document.getElementById("main-header");
    if (header) header.remove();
    const appContent = document.getElementById("app-content");
    if (appContent) appContent.remove();
    document.querySelector("#app").innerHTML = "";
  }

  clearHeader();
  window.scrollTo(0, 0);
  const path = window.location.pathname;

  // Rotas dinâmicas para detalhes (devem vir antes do switch)
  if (/^\/livros\/[0-9]+\/detalhe$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.showLivroDetalhe(id);
    return true;
  }
  if (/^\/unidades\/[0-9]+\/detalhe$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.showUnidadeDetalhe(id);
    return true;
  }

  // Rotas dinâmicas para edição
  if (/^\/livros\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.editLivro(id, () => navigate("/livros"));
    return true;
  }
  if (/^\/unidades\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.editUnidade(id, () => navigate("/unidades"));
    return true;
  }

  // Rota para edição de exemplares por unidade
  if (/^\/livros\/[0-9]+\/exemplares$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    await gestorController.showLivroExemplaresForm(id, () =>
      navigate("/livros")
    );
    return true;
  }

  // Rotas principais
  switch (path) {
    case "/livros":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      document.querySelector(
        "#app-content"
      ).innerHTML = `<div id="livros-list"></div>`;
      gestorController.showLivrosPage({
        onAdd: () => navigate("/livros/novo"),
        onEdit: (id) => navigate(`/livros/${id}`),
        onDelete: (id) => {
          gestorController.deleteLivro(id);
          navigate("/livros");
        },
        onView: (id) => navigate(`/livros/${id}/detalhe`),
        onEditExemplares: (id) => navigate(`/livros/${id}/exemplares`),
      });
      return true;
    case "/livros/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      gestorController.showLivroForm(null, () => navigate("/livros"));
      return true;
    case "/unidades":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      document.querySelector(
        "#app-content"
      ).innerHTML = `<div id="unidades-list"></div>`;
      gestorController.showUnidadesPage({
        onAdd: () => navigate("/unidades/novo"),
        onEdit: (id) => navigate(`/unidades/${id}`),
        onDelete: (id) => {
          gestorController.deleteUnidade(id);
          navigate("/unidades");
        },
        onView: (id) => navigate(`/unidades/${id}/detalhe`),
      });
      return true;
    case "/unidades/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      gestorController.showUnidadeForm(null, () => navigate("/unidades"));
      return true;
    default:
      return false;
  }
}
