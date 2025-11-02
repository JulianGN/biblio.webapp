// 📁 src/components/livro/livro-list.js
import "./livro-list.css";
import { BaseService } from "../../domains/base-service";

const api = new BaseService();

class LivroList extends HTMLElement {
  constructor() {
    super();
    this._search = "";
    this._livros = [];
  }

  set livros(livros) {
    this._livros = Array.isArray(livros) ? livros : [];
    this.render();
  }
  get livros() {
    return this._livros || [];
  }

  set onEdit(callback) { this._onEdit = callback; this.render(); }
  set onDelete(callback) { this._onDelete = callback; this.render(); }
  set onView(callback) { this._onView = callback; this.render(); }
  set onAdd(callback) { this._onAdd = callback; this.render(); }
  set onEditExemplares(callback) { this._onEditExemplares = callback; this.render(); }

  get filteredLivros() {
    if (!this._search) return this.livros;
    const s = this._search.toLowerCase();
    return this.livros.filter(
      (livro) =>
        (livro.titulo && String(livro.titulo).toLowerCase().includes(s)) ||
        (livro.autor && String(livro.autor).toLowerCase().includes(s)) ||
        (livro.isbn && String(livro.isbn).toLowerCase().includes(s))
    );
  }

  connectedCallback() {
    this.render();
    if (!this._livros || this._livros.length === 0) {
      (async () => {
        try {
          const data = await api.get("/gestor/livros/");
          this._livros = Array.isArray(data) ? data : (data?.results || []);
          this.render();
        } catch (e) {
          console.error("Falha ao carregar livros:", e);
          const tbody = this.querySelector("#livros-tbody");
          if (tbody) {
            tbody.innerHTML =
              `<tr><td colspan="4" style="text-align:center;color:#c00;">Falha ao carregar livros.</td></tr>`;
          }
        }
      })();
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <div class="livro-list-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <h2 style="margin:0;">Lista de Livros</h2>
        <button id="add-livro-btn" class="outline">+ <span class="d-sm-none">Adicionar Livro</span></button>
      </div>
      <div class="livro-list-search" style="margin-bottom:1rem;">
        <input type="search" id="busca-livro" placeholder="Buscar livro..." value="${this._search || ""}">
      </div>
      <div class="table-responsive">
        <table class="livros-table striped">
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
      </div>
    `;

    const tbody = this.querySelector("#livros-tbody");
    if (tbody) {
      const livros = this.filteredLivros;
      if (livros.length === 0) {
        const isBusca = this._search && this._search.trim().length > 0;
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">${
          isBusca
            ? "Nenhum livro encontrado para o termo buscado. Tente outro termo."
            : "Nenhum livro cadastrado. Clique em '+ Adicionar Livro' para inserir o primeiro."
        }</td></tr>`;
      } else {
        tbody.innerHTML = livros.map((livro) => `
          <tr>
            <td>${livro.titulo ?? ""}</td>
            <td>${livro.autor ?? ""}</td>
            <td>${livro.isbn ?? ""}</td>
            <td>
              <div class="list-actions livro-list-actions">
                <button class="view-livro-icon outline border-0" data-id="${livro.id}" title="Visualizar"><i class="fa-solid fa-eye"></i></button>
                <button class="edit-livro-icon outline border-0" data-id="${livro.id}" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="edit-exemplares-livro-icon outline border-0" data-id="${livro.id}" title="Exemplares por unidade"><i class="fa-solid fa-list-ol"></i></button>
                <button class="delete-livro-icon outline border-0" data-id="${livro.id}" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            </td>
          </tr>
        `).join("");
      }
    }

    const addBtn = this.querySelector("#add-livro-btn");
    if (addBtn) addBtn.onclick = (e) => {
      e.preventDefault();
      if (this._onAdd) this._onAdd(); else if (window.navigate) window.navigate("/livros/novo");
    };

    const busca = this.querySelector("#busca-livro");
    if (busca) busca.oninput = (e) => { this._search = e.target.value; this._rerenderTbody(); };

    this._bindRowActions();
  }

  _rerenderTbody() {
    const tbody = this.querySelector("#livros-tbody");
    if (!tbody) return;
    const livros = this.filteredLivros;
    if (livros.length === 0) {
      const isBusca = this._search && this._search.trim().length > 0;
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">${
        isBusca ? "Nenhum livro encontrado para o termo buscado." : "Nenhum livro cadastrado."
      }</td></tr>`;
    } else {
      tbody.innerHTML = livros.map((livro) => `
        <tr>
          <td>${livro.titulo ?? ""}</td>
          <td>${livro.autor ?? ""}</td>
          <td>${livro.isbn ?? ""}</td>
          <td>
            <div class="list-actions livro-list-actions">
              <button class="view-livro-icon outline border-0" data-id="${livro.id}" title="Visualizar"><i class="fa-solid fa-eye"></i></button>
              <button class="edit-livro-icon outline border-0" data-id="${livro.id}" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="edit-exemplares-livro-icon outline border-0" data-id="${livro.id}" title="Exemplares por unidade"><i class="fa-solid fa-list-ol"></i></button>
              <button class="delete-livro-icon outline border-0" data-id="${livro.id}" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </td>
        </tr>
      `).join("");
    }
    this._bindRowActions();
  }

  _bindRowActions() {
    this.querySelectorAll(".edit-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        // NÃO navega → chama o callback direto
        if (this._onEdit) this._onEdit(id);
        else if (window.gestorController?.showLivroForm) window.gestorController.showLivroForm({ id });
      };
    });

    this.querySelectorAll(".delete-livro-icon").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        if (!window.confirm("Tem certeza que deseja excluir este livro?")) return;
        if (this._onDelete) return this._onDelete(id);
        try {
          await api.delete(`/gestor/livros/${id}/`);
          this._livros = (this._livros || []).filter((l) => l.id !== id);
          this._rerenderTbody();
        } catch (err) {
          console.error(err);
          alert(err?.response?.data?.message || err?.message || "Erro ao excluir o livro.");
        }
      };
    });

    this.querySelectorAll(".view-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        if (this._onView) this._onView(id);
        else if (window.navigate) window.navigate(`/livros/${id}/detalhe`);
      };
    });

    this.querySelectorAll(".edit-exemplares-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        if (this._onEditExemplares) this._onEditExemplares(id);
        else if (window.navigate) window.navigate(`/livros/${id}/exemplares`);
      };
    });
  }
}

customElements.define("livro-list", LivroList);
