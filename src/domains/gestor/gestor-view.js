// 📁 src/controllers/gestor-view.js
// View do domínio Gestor
// Responsável por renderizar e manipular o DOM relacionado ao gestor

const normalizeId = (v) => {
  if (v == null) return "";
  if (typeof v === "object" && "id" in v) return String(v.id);
  return String(v);
};

const isFn = (f) => typeof f === "function";
const noop = () => {};

export class GestorView {
  renderGestores(gestores) {
    console.log("Lista de Gestores:", gestores);
  }

  renderLivrosPage(livros, onAdd, onEdit, onDelete, onView, onEditExemplares) {
    const container =
      document.getElementById("livros-list") ||
      document.querySelector("#app-content");
    if (!container) return;

    container.innerHTML = /* html */ `<livro-list></livro-list>`;
    const el = container.querySelector("livro-list");
    if (!el) return;

    const isFn = (f) => typeof f === "function";
    const noop = () => {};

    // Handlers normalizados
    const _onAdd = isFn(onAdd) ? onAdd : noop;
    const _onEdit = isFn(onEdit) ? onEdit : noop;
    const _onDelete = isFn(onDelete) ? onDelete : noop;
    const _onView = isFn(onView) ? onView : noop;
    const _onEditEx = isFn(onEditExemplares) ? onEditExemplares : noop;

    // 1) Proxy por item — garante d.editLivro mesmo que o componente espalhe/cloque
    const decorate = (row) => {
      if (!row || typeof row !== "object") return row;
      return new Proxy(row, {
        get(target, prop, receiver) {
          if (prop === "editLivro") return () => _onEdit(target);
          if (prop === "deleteLivro") return () => _onDelete(target?.id);
          if (prop === "viewLivro") return () => _onView(target?.id);
          if (prop === "editExemplares") return () => _onEditEx(target?.id);
          return Reflect.get(target, prop, receiver);
        },
        // mantém propriedades enumeráveis (spread vê os valores)
        ownKeys(target) {
          const keys = Reflect.ownKeys(target);
          return [...new Set([...keys, "editLivro", "deleteLivro", "viewLivro", "editExemplares"])];
        },
        getOwnPropertyDescriptor(target, prop) {
          if (["editLivro", "deleteLivro", "viewLivro", "editExemplares"].includes(prop)) {
            return { configurable: true, enumerable: true, writable: false, value: this.get?.(target, prop) };
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
        }
      });
    };

    const safeLivros = Array.isArray(livros) ? livros : [];
    const proxied = safeLivros.map(decorate);

    // passa a lista proxificada
    el.livros = proxied;

    // 2) Ponte de compatibilidade também no elemento
    el.onAdd = _onAdd;        el.addLivro = _onAdd;
    el.onEdit = _onEdit;      el.editLivro = _onEdit;
    el.onDelete = _onDelete;  el.deleteLivro = _onDelete;
    el.onView = _onView;      el.viewLivro = _onView;
    el.onEditExemplares = _onEditEx; el.editExemplares = _onEditEx;

    // 3) Fallbacks globais (se o bundle usa window.*)
    window.addLivro = _onAdd;
    window.editLivro = _onEdit;
    window.deleteLivro = _onDelete;
    window.viewLivro = _onView;
    window.editExemplares = _onEditEx;

    // 4) Delegação de eventos no host (cobre o caso do componente não usar d.editLivro)
    el.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "edit") return _onEdit(proxied.find(r => r.id === id));
      if (action === "delete") return _onDelete(id);
      if (action === "view") return _onView(id);
      if (action === "exemplares") return _onEditEx(id);
    });

    // 5) Também escuta CustomEvents, se existirem
    el.addEventListener("livro:criar", () => _onAdd?.());
    el.addEventListener("livro:editar", (e) => _onEdit?.(e.detail));
    el.addEventListener("livro:excluir", (e) => _onDelete?.(e.detail?.id ?? e.detail));
    el.addEventListener("livro:ver", (e) => _onView?.(e.detail?.id ?? e.detail));
    el.addEventListener("livro:exemplares", (e) => _onEditEx?.(e.detail?.id ?? e.detail));

    // 6) Log rápido para depuração
    console.debug("[livro-list] itens entregues:", el.livros.slice(0, 3));
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

    // ✅ Disponíveis e selecionadas (para o webcomponent usar)
    livroFormEl._unidadesDisponiveis  = Array.isArray(unidades)   ? unidades   : [];
    livroFormEl._tipoObrasDisponiveis = Array.isArray(tipo_obras) ? tipo_obras : [];
    if (livro && Array.isArray(livro.unidades)) {
      livroFormEl._unidadesSelecionadas = livro.unidades;
      livroFormEl._livroSelecionado = livro;
      if (livro.id) livroFormEl.setAttribute("livro-id", String(livro.id));
    }

    // Preenche campos básicos quando em edição (compat)
    if (livro) {
      if (livroFormEl.titulo) livroFormEl.titulo.value = livro.titulo ?? "";
      if (livroFormEl.autor) livroFormEl.autor.value = livro.autor ?? "";
      if (livroFormEl.editora) livroFormEl.editora.value = livro.editora ?? "";
      if (livroFormEl.data_publicacao) livroFormEl.data_publicacao.value = livro.data_publicacao ?? "";
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

    /* ---------------------------------------------------------
       🔧 Tipo de Obra: NÃO recriar o campo (evita duplicado).
       Apenas seta o valor no select que já existe no <livro-form>.
    ----------------------------------------------------------*/
    const tipoObraSelect = livroFormEl.querySelector('select#tipo_obra, select[name="tipo_obra"]');
    if (tipoObraSelect && livro) {
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

    container.innerHTML = /* html */ `<unidade-list></unidade-list>`;
    const unidadeList = container.querySelector("unidade-list");
    if (!unidadeList) return;

    unidadeList.unidades = Array.isArray(unidades) ? unidades : [];
    unidadeList.onAdd = isFn(onAdd) ? onAdd : noop;
    unidadeList.onEdit = isFn(onEdit) ? onEdit : noop;
    unidadeList.onDelete = isFn(onDelete) ? onDelete : noop;
    unidadeList.onView = isFn(onView) ? onView : noop;
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
          <div><b>Gênero:</b> ${livro.generoObj?.nome || "-"}</div>
          <div><b>Tipo de Obra:</b> ${livro.tipo_obraObj?.nome || "-"}</div>
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

    const unidadesDisponiveis =
      (window.gestorController &&
        window.gestorController.initData &&
        Array.isArray(window.gestorController.initData.unidades) &&
        window.gestorController.initData.unidades) ||
      [];

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
      onSave && onSave(exemplaresPorUnidade);
    };
  }
}
