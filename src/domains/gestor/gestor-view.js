// 📁 src/controllers/gestor-view.js
// View do domínio Gestor
// Responsável por renderizar e manipular o DOM relacionado ao gestor

const normalizeId = (v) => {
  if (v == null) return "";
  if (typeof v === "object" && "id" in v) return String(v.id);
  return String(v);
};

export class GestorView {
  renderGestores(gestores) {
    console.log("Lista de Gestores:", gestores);
  }

  renderLivrosPage(livros, onAdd, onEdit, onDelete, onView, onEditExemplares) {
    const container =
      document.getElementById("livros-list") ||
      document.querySelector("#app-content");

    if (!container) return;

    container.innerHTML = /* html */ `
      <livro-list></livro-list>
    `;

    const livroList = container.querySelector("livro-list");
    if (!livroList) return;

    livroList.livros = livros || [];
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
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = /* html */ `
      <div class="form-container">
        <livro-form ${livro ? "edit" : ""}></livro-form>
      </div>
    `;

    const livroFormEl = document.querySelector("livro-form");
    if (!livroFormEl) return;

    // Disponíveis e selecionadas (para o webcomponent usar)
    livroFormEl._unidadesDisponiveis = Array.isArray(unidades) ? unidades : [];
    if (livro && Array.isArray(livro.unidades)) {
      livroFormEl._unidadesSelecionadas = livro.unidades;
      livroFormEl._livroSelecionado = livro;
    }

    // Preenche campos básicos quando em edição
    if (livro) {
      if (livroFormEl.titulo) livroFormEl.titulo.value = livro.titulo ?? "";
      if (livroFormEl.autor) livroFormEl.autor.value = livro.autor ?? "";
      if (livroFormEl.editora) livroFormEl.editora.value = livro.editora ?? "";
      if (livroFormEl.data_publicacao)
        livroFormEl.data_publicacao.value = livro.data_publicacao ?? "";
      if (livroFormEl.isbn) livroFormEl.isbn.value = livro.isbn ?? "";
      if (livroFormEl.paginas) livroFormEl.paginas.value = livro.paginas ?? "";
      if (livroFormEl.capa) livroFormEl.capa.value = livro.capa ?? "";
      if (livroFormEl.idioma) livroFormEl.idioma.value = livro.idioma ?? "";
    }

    /* -------------------------------
       Select de Gênero (robusto)
    --------------------------------*/
    let generoSelect = null;
    const generoInput = livroFormEl.querySelector(
      'input[name="genero"], input#genero'
    );

    const generoHtml = `
      <label for="genero">Gênero:</label>
      <select id="genero" name="genero" required>
        <option value="">Selecione o gênero</option>
        ${(generos || [])
          .map((g) => `<option value="${g.id}">${g.nome}</option>`)
          .join("")}
      </select>
    `;

    if (generoInput) {
      const generoDiv = generoInput.closest("div");
      if (generoDiv) {
        generoDiv.innerHTML = generoHtml;
        generoSelect = generoDiv.querySelector("select#genero");
      }
    } else {
      // Se não encontrou input, insere antes do bloco de unidades
      const unidadeSelect = livroFormEl.querySelector("select#unidade-select");
      const unidadeDiv = unidadeSelect ? unidadeSelect.closest("div") : null;
      const generoDiv = document.createElement("div");
      generoDiv.innerHTML = generoHtml;
      if (unidadeDiv && unidadeDiv.parentNode) {
        unidadeDiv.parentNode.insertBefore(generoDiv, unidadeDiv);
      } else {
        livroFormEl.appendChild(generoDiv);
      }
      generoSelect = generoDiv.querySelector("select#genero");
    }

    if (livro && generoSelect) {
      // aceita livro.genero (id ou obj) ou livro.generoObj
      generoSelect.value =
        normalizeId(livro.genero) || normalizeId(livro.generoObj) || "";
    }

    /* -----------------------------------
       Select de Tipo de Obra (robusto)
    ------------------------------------*/
    let tipoObraSelect = null;
    const tipoObraInput = livroFormEl.querySelector(
      'input[name="tipo_obra"], input#tipo_obra'
    );

    const tipoObraHtml = `
      <label for="tipo_obra">Tipo de Obra:</label>
      <select id="tipo_obra" name="tipo_obra">
        <option value="">Selecione o tipo de obra</option>
        ${(tipo_obras || [])
          .map((t) => `<option value="${t.id}">${t.nome}</option>`)
          .join("")}
      </select>
    `;

    if (tipoObraInput) {
      const tipoDiv = tipoObraInput.closest("div");
      if (tipoDiv) {
        tipoDiv.innerHTML = tipoObraHtml;
        tipoObraSelect = tipoDiv.querySelector("select#tipo_obra");
      }
    } else {
      const tipoDiv = document.createElement("div");
      tipoDiv.innerHTML = tipoObraHtml;
      livroFormEl.appendChild(tipoDiv);
      tipoObraSelect = tipoDiv.querySelector("select#tipo_obra");
    }

    if (livro && tipoObraSelect) {
      tipoObraSelect.value =
        normalizeId(livro.tipo_obra) ||
        normalizeId(livro.tipo_obraObj) ||
        "";
    }

    // Submit
    livroFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      onSubmit && onSubmit(livroFormEl);
    });

    // Voltar (se existir)
    const voltarBtn = document.getElementById("voltar-btn");
    if (onBack && voltarBtn) voltarBtn.onclick = onBack;
  }

  renderUnidadeForm(onSubmit, unidade = null, onBack = null) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = /* html */ `
      <div class="form-container">
        <unidade-form ${unidade ? "edit" : ""}></unidade-form>
      </div>
    `;

    // Aguarda o componente ser renderizado antes de acessar o form
    setTimeout(() => {
      const form = document.querySelector("#unidade-form");
      if (!form) return;

      if (unidade) {
        form.nome.value = unidade.nome ?? "";
        form.endereco.value = unidade.endereco ?? "";
        form.telefone.value = unidade.telefone ?? "";
        form.email.value = unidade.email ?? "";
        form.site.value = unidade.site ?? "";
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (typeof onSubmit === "function") onSubmit(event.target);
      });

      const voltar = document.getElementById("voltar-unidade-btn");
      const cancelar = document.getElementById("cancelar-unidade-btn");
      if (onBack && voltar) voltar.onclick = onBack;
      if (onBack && cancelar) cancelar.onclick = onBack;
    }, 0);
  }

  renderUnidadesPage(unidades, onAdd, onEdit, onDelete, onView) {
    const container =
      document.getElementById("unidades-list") ||
      document.querySelector("#app-content");
    if (!container) return;

    container.innerHTML = /* html */ `
      <unidade-list></unidade-list>
    `;

    const unidadeList = container.querySelector("unidade-list");
    if (!unidadeList) return;

    unidadeList.unidades = Array.isArray(unidades) ? unidades : [];
    unidadeList.onAdd = onAdd;
    unidadeList.onEdit = onEdit;
    unidadeList.onDelete = onDelete;
    unidadeList.onView = onView;
  }

  renderLivroDetalhe(livro) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    const unidades = Array.isArray(livro?.unidades) ? livro.unidades : [];
    const totalExemplares = unidades.reduce(
      (sum, u) => sum + (Number(u?.exemplares) || 0),
      0
    );

    root.innerHTML = `
      <div class="livro-detalhe-container">
        <h2>
          <button type="button" id="voltar-btn" class="outline border-0" aria-label="Voltar">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          Detalhes do Livro
        </h2>

        <div>
          <div><b>Título:</b> ${livro.titulo}</div>
          <div><b>Autor:</b> ${livro.autor}</div>
          <div><b>Editora:</b> ${livro.editora || "-"}</div>
          <div><b>Data de Publicação:</b> ${livro.data_publicacao || "-"}</div>
          <div><b>ISBN:</b> ${livro.isbn || "-"}</div>
          <div><b>Páginas:</b> ${livro.paginas || "-"}</div>
          <div><b>Idioma:</b> ${livro.idioma || "-"}</div>
          <div><b>Gênero:</b> ${
            livro.generoObj?.nome || "-"
          }</div>
          <div><b>Tipo de Obra:</b> ${
            livro.tipo_obraObj?.nome || "-"
          }</div>
        </div>

        <hr/>

        <h6>Unidades <small style="font-weight:normal;">(Total: ${totalExemplares} exemplar(es))</small></h6>
        <ul>
          ${
            unidades.length
              ? unidades
                  .map(
                    (u) =>
                      `<li><strong>${u.unidade?.nome ?? "—"}:</strong> ${Number(u.exemplares) || 0} exemplar(es)</li>`
                  )
                  .join("")
              : "<li>Nenhuma unidade cadastrada.</li>"
          }
        </ul>
      </div>
    `;

    const voltar = document.getElementById("voltar-btn");
    if (voltar) {
      voltar.onclick = () =>
        window.navigate ? window.navigate("/livros") : history.back();
    }
  }

  renderUnidadeDetalhe(unidade) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = /* html */ `
      <div class="form-container">
        <div class="unidade-detalhe-header">
          <button id="voltar-unidade-detalhe" class="outline border-0" aria-label="Voltar">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2>${unidade.nome}</h2>
        </div>
        <p><strong>Endereço:</strong> ${unidade.endereco ?? "-"}</p>
        <p><strong>Telefone:</strong> ${unidade.telefone ?? "-"}</p>
        <p><strong>Email:</strong> ${unidade.email ?? "-"}</p>
        <p><strong>Site:</strong> ${unidade.site ?? "-"}</p>
      </div>
    `;

    const voltar = document.getElementById("voltar-unidade-detalhe");
    if (voltar && window.navigate) voltar.onclick = () => window.navigate("/unidades");
  }

  /**
   * Mantido por compatibilidade (o fluxo principal usa <livro-exemplares-page> via controller)
   * Recebe: livro (com .unidades), onSave(payload), onBack()
   */
  renderLivroExemplaresForm(livro, onSave, onBack) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = /* html */ `
      <div class="form-container">
        <div class="livro-form-header">
          <button type="button" id="voltar-exemplares-btn" class="outline border-0" aria-label="Voltar">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
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

    // Unidades disponíveis: tenta do controller.initData; cai pra lista vazia se não houver
    const unidadesDisponiveis =
      (window.gestorController &&
        window.gestorController.initData &&
        Array.isArray(window.gestorController.initData.unidades) &&
        window.gestorController.initData.unidades) ||
      [];

    // Monta estrutura: todas as unidades disponíveis devem aparecer, com 0 por padrão,
    // mesclando as que o livro já possua.
    const existentes = new Map(
      (Array.isArray(livro?.unidades) ? livro.unidades : []).map((u) => [
        normalizeId(u?.unidade),
        Number(u?.exemplares) || 0,
      ])
    );

    let exemplaresPorUnidade = unidadesDisponiveis.map((u) => ({
      unidade: u,
      exemplares: existentes.get(String(u.id)) || 0,
    }));

    const exemplaresListDiv = document.getElementById("exemplares-unidades-list");
    const renderExemplaresList = () => {
      exemplaresListDiv.innerHTML = exemplaresPorUnidade
        .map(
          (u) => `
          <div class="exemplares-unidade">
            <input
              id="exemplares-unidade-${u.unidade.id}"
              type="number"
              min="0"
              value="${u.exemplares}"
              data-id="${u.unidade.id}"
              style="width:110px;margin-right:8px;"
            >
            <label for="exemplares-unidade-${u.unidade.id}">
              ${u.unidade.nome}
            </label>
          </div>
        `
        )
        .join("");
    };

    renderExemplaresList();

    exemplaresListDiv.addEventListener("input", (e) => {
      if (e.target && e.target.type === "number") {
        const id = Number(e.target.dataset.id);
        const val = Math.max(0, Number(e.target.value) || 0);
        exemplaresPorUnidade = exemplaresPorUnidade.map((u) =>
          Number(u.unidade.id) === id ? { ...u, exemplares: val } : u
        );
      }
    });

    const voltarBtn = document.getElementById("voltar-exemplares-btn");
    const cancelarBtn = document.getElementById("cancelar-exemplares-btn");
    if (onBack && voltarBtn) voltarBtn.onclick = onBack;
    if (onBack && cancelarBtn) cancelarBtn.onclick = onBack;

    const form = document.getElementById("exemplares-form");
    form.onsubmit = (e) => {
      e.preventDefault();
      // Mantém compat: envia [{unidade: obj, exemplares:Number}]
      onSave && onSave(exemplaresPorUnidade);
    };
  }
}
