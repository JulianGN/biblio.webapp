export async function gestorRoutes({ gestorController, gestorView, navigate }) {
  const path = window.location.pathname;
  if (!/^\/(livros|unidades)/.test(path)) {
    return false;
  }
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
    await gestorController.editUnidade(id, () => navigate("/unidades"));
    return true;
  }

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
      await gestorController.showUnidadesPage({
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
