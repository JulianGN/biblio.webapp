import "./livro-list.css";

// Web Component para a lista de livros
class LivroList extends HTMLElement {
  constructor() {
    super();
    this._search = "";
  }

  set livros(livros) {
    this._livros = livros;
    this.render();
  }

  get livros() {
    return this._livros || [];
  }

  set onEdit(callback) {
    this._onEdit = callback;
    this.render();
  }

  set onDelete(callback) {
    this._onDelete = callback;
    this.render();
  }

  set onView(callback) {
    this._onView = callback;
    this.render();
  }

  set onAdd(callback) {
    this._onAdd = callback;
    this.render();
  }

  get filteredLivros() {
    if (!this._search) return this.livros;
    const s = this._search.toLowerCase();
    return this.livros.filter(
      (livro) =>
        (livro.titulo && livro.titulo.toLowerCase().includes(s)) ||
        (livro.autor && livro.autor.toLowerCase().includes(s)) ||
        (livro.isbn && livro.isbn.toLowerCase().includes(s))
    );
  }

  connectedCallback() {
    this.innerHTML = `
            <div id="livroList">
                <h2>Lista de Livros</h2>
                <div class="livro-list-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <input type="search" id="busca-livro" placeholder="Buscar livro..." value="${
                      this._search || ""
                    }">
                </div>
                <table class="livros-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>ISBN</th>
                            <th class="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Linhas da tabela serão adicionadas aqui -->
                    </tbody>
                </table>
            </div>
        `;
  }

  // Método para renderizar a lista de livros
  render() {
    // Renderiza o header, busca e tabela (sem tbody)
    this.innerHTML = /* html */ `
      <div class="livro-list-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <h2 style="margin:0;">Lista de Livros</h2>
        <button id="add-livro-btn" class="outline">+ Adicionar Livro</button>
      </div>
      <div class="livro-list-search" style="margin-bottom:1rem;">
        <input type="search" id="busca-livro" placeholder="Buscar livro..." value="${
          this._search || ""
        }" style="max-width:300px;">
      </div>
      <table class="livros-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>ISBN</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody id="livros-tbody"></tbody>
      </table>
    `;
    // Renderiza apenas o tbody separadamente
    const tbody = this.querySelector("#livros-tbody");
    if (tbody) {
      tbody.innerHTML = this.filteredLivros
        .map(
          (livro) => /* html */ `
            <tr>
              <td>${livro.titulo}</td>
              <td>${livro.autor}</td>
              <td>${livro.isbn}</td>
              <td>
                <div class="livro-list-actions">
                  <button class="view-livro-icon outline border-0" data-id="${livro.id}" title="Visualizar">👁️</button>
                  <button class="edit-livro-icon outline border-0" data-id="${livro.id}" title="Editar">✏️</button>
                  <button class="delete-livro-icon outline border-0" data-id="${livro.id}" title="Excluir">🗑️</button>
                </div>
              </td>
            </tr>
          `
        )
        .join("");
    }
    // Eventos
    this.querySelector("#add-livro-btn").onclick = (e) => {
      e.preventDefault();
      if (this._onAdd) this._onAdd();
    };
    this.querySelector("#busca-livro").oninput = (e) => {
      this._search = e.target.value;
      // Só atualiza o tbody, não o componente inteiro
      const tbody = this.querySelector("#livros-tbody");
      if (tbody) {
        tbody.innerHTML = this.filteredLivros
          .map(
            (livro) => /* html */ `
              <tr>
                <td>${livro.titulo}</td>
                <td>${livro.autor}</td>
                <td>${livro.isbn}</td>
                <td>
                  <div class="livro-list-actions">
                    <button class="view-livro-icon outline border-0" data-id="${livro.id}" title="Visualizar">👁️</button>
                    <button class="edit-livro-icon outline border-0" data-id="${livro.id}" title="Editar">✏️</button>
                    <button class="delete-livro-icon outline border-0" data-id="${livro.id}" title="Excluir">🗑️</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join("");
        // Reatribui eventos aos botões do novo tbody
        this.querySelectorAll(".edit-livro-icon").forEach((btn) => {
          btn.onclick = (e) => {
            e.preventDefault();
            if (this._onEdit) this._onEdit(parseInt(btn.dataset.id));
          };
        });
        this.querySelectorAll(".delete-livro-icon").forEach((btn) => {
          btn.onclick = (e) => {
            e.preventDefault();
            if (window.confirm("Tem certeza que deseja excluir este livro?")) {
              if (this._onDelete) this._onDelete(parseInt(btn.dataset.id));
            }
          };
        });
        this.querySelectorAll(".view-livro-icon").forEach((btn) => {
          btn.onclick = (e) => {
            e.preventDefault();
            if (window.navigate)
              window.navigate(`/livros/${btn.dataset.id}/detalhe`);
            else if (this._onView) this._onView(parseInt(btn.dataset.id));
          };
        });
      }
    };
    // Eventos iniciais do tbody
    this.querySelectorAll(".edit-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (this._onEdit) this._onEdit(parseInt(btn.dataset.id));
      };
    });
    this.querySelectorAll(".delete-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (window.confirm("Tem certeza que deseja excluir este livro?")) {
          if (this._onDelete) this._onDelete(parseInt(btn.dataset.id));
        }
      };
    });
    this.querySelectorAll(".view-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (window.navigate)
          window.navigate(`/livros/${btn.dataset.id}/detalhe`);
        else if (this._onView) this._onView(parseInt(btn.dataset.id));
      };
    });
  }
}

customElements.define("livro-list", LivroList);
