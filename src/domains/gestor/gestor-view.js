// View do domínio Gestor
// Responsável por renderizar e manipular o DOM relacionado ao gestor

export class GestorView {
  renderGestores(gestores) {
    // Exemplo: renderizar lista de gestores no console
    console.log("Lista de Gestores:", gestores);
    // Aqui você pode implementar a renderização no DOM
  }

  renderLivrosPage(livros, onAdd, onEdit, onDelete, onView, onEditExemplares) {
    const container =
      document.getElementById("livros-list") ||
      document.querySelector("#app-content");
    container.innerHTML = /* html */ `
      <livro-list></livro-list>
    `;
    const livroList = container.querySelector("livro-list");
    livroList.livros = livros;
    livroList.onAdd = onAdd;
    livroList.onEdit = onEdit;
    livroList.onDelete = onDelete;
    livroList.onView = onView;
    livroList.onEditExemplares = onEditExemplares;
  }

  renderLivroForm(onSubmit, livro = null, onBack = null) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <livro-form ${livro ? "edit" : ""}></livro-form>
      </div>
    `;
    const form = document.querySelector("#livro-form");
    if (livro) {
      form.titulo.value = livro.titulo;
      form.autor.value = livro.autor;
      form.editora.value = livro.editora || "";
      form.data_publicacao.value = livro.data_publicacao || "";
      form.isbn.value = livro.isbn || "";
      form.paginas.value = livro.paginas || "";
      form.capa.value = livro.capa || "";
      form.idioma.value = livro.idioma || "";
      form.genero.value = livro.genero || "";
      if (!form.querySelector("#livroId")) {
        const hiddenIdInput = document.createElement("input");
        hiddenIdInput.type = "hidden";
        hiddenIdInput.id = "livroId";
        form.appendChild(hiddenIdInput);
      }
      form.querySelector("#livroId").value = livro.id;
      form.querySelector('button[type="submit"]').textContent =
        "Atualizar Livro";
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      onSubmit(form);
    });
    if (onBack) {
      document.getElementById("voltar-btn").onclick = onBack;
    }
  }

  renderUnidadeForm(onSubmit, unidade = null, onBack = null) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <unidade-form ${unidade ? "edit" : ""}></unidade-form>
      </div>
    `;
    // Aguarda o componente ser renderizado antes de acessar o form
    setTimeout(() => {
      const form = document.querySelector("#unidade-form");
      if (!form) return;
      if (unidade) {
        form.nome.value = unidade.nome;
        form.endereco.value = unidade.endereco;
        form.telefone.value = unidade.telefone || "";
        form.email.value = unidade.email || "";
        form.site.value = unidade.site || "";
      }
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        onSubmit(form);
      });
      if (onBack) {
        document.getElementById("voltar-unidade-btn").onclick = onBack;
        document.getElementById("cancelar-unidade-btn").onclick = onBack;
      }
    }, 0);
  }

  renderUnidadesPage(unidades, onAdd, onEdit, onDelete, onView) {
    const container =
      document.getElementById("unidades-list") ||
      document.querySelector("#app-content");
    container.innerHTML = /* html */ `
      <unidade-list></unidade-list>
    `;
    const unidadeList = container.querySelector("unidade-list");
    unidadeList.unidades = unidades;
    unidadeList.onAdd = onAdd;
    unidadeList.onEdit = onEdit;
    unidadeList.onDelete = onDelete;
    unidadeList.onView = onView;
  }

  renderLivroDetalhe(livro) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <div class="livro-detalhe-header">
          <button id="voltar-livro-detalhe" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button>
          <h2>${livro.titulo}</h2>
        </div>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Editora:</strong> ${livro.editora || "-"}</p>
        <p><strong>Data de Publicação:</strong> ${
          livro.data_publicacao || "-"
        }</p>
        <p><strong>ISBN:</strong> ${livro.isbn || "-"}</p>
        <p><strong>Páginas:</strong> ${livro.paginas || "-"}</p>
        <p><strong>Idioma:</strong> ${livro.idioma || "-"}</p>
        <p><strong>Gênero:</strong> ${livro.genero || "-"}</p>
        <h3>Exemplares por Unidade</h3>
        <ul>
          ${
            (livro.unidades || []).length > 0
              ? livro.unidades
                  .map(
                    (u) =>
                      `<li><strong>${u.unidade.nome}:</strong> ${
                        u.exemplares || 0
                      } exemplar(es)</li>`
                  )
                  .join("")
              : "<li>Nenhuma unidade cadastrada para este livro.</li>"
          }
        </ul>
      </div>
    `;
    document.getElementById("voltar-livro-detalhe").onclick = () =>
      window.navigate && window.navigate("/livros");
  }

  renderUnidadeDetalhe(unidade) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <div class="unidade-detalhe-header">
          <button id="voltar-unidade-detalhe" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button>
          <h2>${unidade.nome}</h2>
        </div>
        <p><strong>Endereço:</strong> ${unidade.endereco}</p>
        <p><strong>Telefone:</strong> ${unidade.telefone || "-"}</p>
        <p><strong>Email:</strong> ${unidade.email || "-"}</p>
        <p><strong>Site:</strong> ${unidade.site || "-"}</p>
      </div>
    `;
    document.getElementById("voltar-unidade-detalhe").onclick = () =>
      window.navigate && window.navigate("/unidades");
  }

  renderLivroExemplaresForm(livro, onSave, onBack) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <div class="livro-form-header">
          <button type="button" id="voltar-exemplares-btn" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button>
          <h2 style="margin: 0;">Exemplares por Unidade</h2>
        </div>
        <form id="exemplares-form">
          <div id="exemplares-unidades-list" style="margin:8px 0 16px 0;"></div>
          <div class="livro-form-footer">
            <button type="button" id="cancelar-exemplares-btn" class="outline">Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    `;
    // Renderiza lista de unidades e campos de exemplares
    const unidades =
      (window.gestorController &&
        window.gestorController.service &&
        window.gestorController.service.unidades) ||
      [];
    const exemplaresListDiv = document.getElementById(
      "exemplares-unidades-list"
    );
    let exemplaresPorUnidade = [];
    if (livro && livro.unidades) {
      exemplaresPorUnidade = livro.unidades.map((u) => ({
        unidade: u.unidade,
        exemplares: u.exemplares,
      }));
    } else {
      exemplaresPorUnidade = unidades.map((u) => ({
        unidade: u,
        exemplares: 0,
      }));
    }
    const renderExemplaresList = () => {
      exemplaresListDiv.innerHTML = exemplaresPorUnidade
        .map(
          (u) => `
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:8px;">
          <span style="min-width:120px;">${u.unidade.nome}</span>
          <input type="number" min="0" value="${u.exemplares}" data-id="${u.unidade.id}" style="width:60px;">
        </div>
      `
        )
        .join("");
    };
    renderExemplaresList();
    exemplaresListDiv.addEventListener("input", (e) => {
      if (e.target && e.target.type === "number") {
        const id = parseInt(e.target.dataset.id);
        const val = parseInt(e.target.value) || 0;
        exemplaresPorUnidade = exemplaresPorUnidade.map((u) =>
          u.unidade.id === id ? { ...u, exemplares: val } : u
        );
      }
    });
    document.getElementById("voltar-exemplares-btn").onclick = () =>
      onBack && onBack();
    document.getElementById("cancelar-exemplares-btn").onclick = () =>
      onBack && onBack();
    document.getElementById("exemplares-form").onsubmit = (e) => {
      e.preventDefault();
      onSave && onSave(exemplaresPorUnidade);
    };
  }
}
