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

  renderLivroForm(
    onSubmit,
    livro = null,
    onBack = null,
    generos = [],
    unidades = [],
    tipo_obras = []
  ) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <livro-form ${livro ? "edit" : ""}></livro-form>
      </div>
    `;
    const livroFormEl = document.querySelector("livro-form");
    // Passar as unidades disponíveis para o componente
    livroFormEl._unidadesDisponiveis = unidades;
    // Passar as unidades já selecionadas para edição
    if (livro && Array.isArray(livro.unidades)) {
      livroFormEl._unidadesSelecionadas = livro.unidades;
      livroFormEl._livroSelecionado = livro;
    }
    if (livro) {
      if (livroFormEl.titulo) livroFormEl.titulo.value = livro.titulo;
      if (livroFormEl.autor) livroFormEl.autor.value = livro.autor;
      if (livroFormEl.editora) livroFormEl.editora.value = livro.editora || "";
      if (livroFormEl.data_publicacao)
        livroFormEl.data_publicacao.value = livro.data_publicacao || "";
      if (livroFormEl.isbn) livroFormEl.isbn.value = livro.isbn || "";
      if (livroFormEl.paginas) livroFormEl.paginas.value = livro.paginas || "";
      if (livroFormEl.capa) livroFormEl.capa.value = livro.capa || "";
      if (livroFormEl.idioma) livroFormEl.idioma.value = livro.idioma || "";
      // Gênero será setado após inserir o select
    }
    // Substituir input de gênero por select de forma robusta
    let generoSelect = null;
    let generoInput = livroFormEl.querySelector(
      'input[name="genero"], input#genero'
    );
    if (generoInput) {
      const generoDiv = generoInput.closest("div");
      if (generoDiv) {
        generoDiv.innerHTML = `
          <label for="genero">Gênero:</label>
          <select id="genero" name="genero" required>
            <option value="">Selecione o gênero</option>
            ${generos
              .map((g) => `<option value="${g.id}">${g.nome}</option>`)
              .join("")}
          </select>
        `;
        generoSelect = generoDiv.querySelector("select#genero");
      }
    } else {
      // Se não encontrar input, insere o select ANTES do bloco de unidades
      const unidadeSelect = livroFormEl.querySelector("select#unidade-select");
      const unidadeDiv = unidadeSelect ? unidadeSelect.closest("div") : null;
      const generoDiv = document.createElement("div");
      generoDiv.innerHTML = `
        <label for="genero">Gênero:</label>
        <select id="genero" name="genero" required>
          <option value="">Selecione o gênero</option>
          ${generos
            .map((g) => `<option value="${g.id}">${g.nome}</option>`)
            .join("")}
        </select>
      `;
      if (unidadeDiv && unidadeDiv.parentNode) {
        unidadeDiv.parentNode.insertBefore(generoDiv, unidadeDiv);
      } else {
        livroFormEl.appendChild(generoDiv);
      }
      generoSelect = generoDiv.querySelector("select#genero");
    }
    if (livro && livro.genero && generoSelect) {
      generoSelect.value = livro.genero;
    }
    // Substituir input de tipo_obra por select de forma robusta
    let tipoObraSelect = null;
    let tipoObraInput = livroFormEl.querySelector(
      'input[name="tipo_obra"], input#tipo_obra'
    );
    if (tipoObraInput) {
      const tipoDiv = tipoObraInput.closest("div");
      if (tipoDiv) {
        tipoDiv.innerHTML = `
          <label for="tipo_obra">Tipo de Obra:</label>
          <select id="tipo_obra" name="tipo_obra">
            <option value="">Selecione o tipo de obra</option>
            ${tipo_obras
              .map((t) => `<option value="${t.id}">${t.nome}</option>`)
              .join("")}
          </select>
        `;
        tipoObraSelect = tipoDiv.querySelector("select#tipo_obra");
      }
    }
    if (livro && livro.tipo_obra && tipoObraSelect) {
      tipoObraSelect.value = livro.tipo_obra;
    }
    livroFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      onSubmit(livroFormEl);
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
        // Garante que o parâmetro é o <form> real
        if (typeof onSubmit === "function") {
          onSubmit(event.target);
        }
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
    document.querySelector("#app-content").innerHTML = `
      <div class="livro-detalhe-container">
        <h2><button type="button" id="voltar-btn" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button> Detalhes do Livro</h2>
        <div>
          <div><b>Título:</b> ${livro.titulo}</div>
          <div><b>Autor:</b> ${livro.autor}</div>
          <div><b>Editora:</b> ${livro.editora || "-"}</div>
          <div><b>Data de Publicação:</b> ${livro.data_publicacao || "-"}</div>
          <div><b>ISBN:</b> ${livro.isbn || "-"}</div>
          <div><b>Páginas:</b> ${livro.paginas || "-"}</div>
          <div><b>Idioma:</b> ${livro.idioma || "-"}</div>
          <div><b>Gênero:</b> ${
            livro.generoObj && livro.generoObj.nome ? livro.generoObj.nome : "-"
          }</div>
          <div><b>Tipo de Obra:</b> ${
            livro.tipo_obraObj && livro.tipo_obraObj.nome ? livro.tipo_obraObj.nome : "-"
          }</div>
        </div>
        <hr/>
        <h6>Unidades</h6>
        <ul>
          ${
            (livro.unidades || [])
              .map(
                (u) =>
                  `<li><strong>${u.unidade.nome}:</strong> ${u.exemplares} exemplar(es)</li>`
              )
              .join("") || "<li>Nenhuma unidade cadastrada.</li>"
          }
        </ul>
      </div>
    `;
    document.getElementById("voltar-btn").onclick = () =>
      window.navigate ? window.navigate("/livros") : history.back();
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
        <div class="exemplares-unidade">
          <input id="exemplares-unidade-${u.unidade.id}" type="number" min="0" value="${u.exemplares}" data-id="${u.unidade.id}">
          <label for="exemplares-unidade-${u.unidade.id}">${u.unidade.nome}</label>
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
