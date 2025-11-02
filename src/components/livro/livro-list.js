// 📁 src/components/livro/livro-list.js
import "./livro-list.css";
import { BaseService } from "../../domains/base-service";

const api = new BaseService();

class LivroList extends HTMLElement {
  constructor() {
    super();
    this._search = "";
    this._livros = [];
    this._onEdit = null;
    this._onDelete = null;
    this._onView = null;
    this._onAdd = null;
    this._onEditExemplares = null;
  }

  set livros(livros) {
    this._livros = Array.isArray(livros) ? livros : [];
    this.render();
  }
  get livros() {
    return this._livros || [];
  }

  set onEdit(cb)           { this._onEdit = typeof cb === "function" ? cb : null; this.render(); }
  set onDelete(cb)         { this._onDelete = typeof cb === "function" ? cb : null; this.render(); }
  set onView(cb)           { this._onView = typeof cb === "function" ? cb : null; this.render(); }
  set onAdd(cb)            { this._onAdd = typeof cb === "function" ? cb : null; this.render(); }
  set onEditExemplares(cb) { this._onEditExemplares = typeof cb === "function" ? cb : null; this.render(); }

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

    // Se ninguém injetou dados, carrega da API
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
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#c00;">Falha ao carregar livros.</td></tr>`;
          }
        }
      })();
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <div class="livro-list-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <h2 style="margin:0;">Lista de Livros</h2>
        <button id="add-livro-btn" class="outline">
          <i class="fa-solid fa-plus"></i> <span class="d-sm-none">Adicionar Livro</span>
        </button>
      </div>

      <div class="livro-list-search" style="margin-bottom:1rem;">
        <input type="search" id="busca-livro" placeholder="Buscar livro..." value="${this._search || ""}">
      </div>

      <div class="table-responsive">
        <table class="livros-table striped" style="width:100%;">
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

    this._rerenderTbody();

    const addBtn = this.querySelector("#add-livro-btn");
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this._onAdd) {
          this._onAdd();
          return;
        }
        // Fallback 100% SPA (sem rota)
        if (window.gestorController?.showLivroForm) {
          window.gestorController.showLivroForm(null, () => window.gestorController.showLivrosPage?.());
        }
      };
    }

    const busca = this.querySelector("#busca-livro");
    if (busca) {
      busca.oninput = (e) => {
        this._search = e.target.value;
        this._rerenderTbody();
      };
    }
  }

  _rerenderTbody() {
    const tbody = this.querySelector("#livros-tbody");
    if (!tbody) return;

    const livros = this.filteredLivros;
    if (!livros.length) {
      const isBusca = !!(this._search && this._search.trim());
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">${
        isBusca
          ? "Nenhum livro encontrado para o termo buscado. Tente outro termo."
          : "Nenhum livro cadastrado. Clique em '+ Adicionar Livro' para inserir o primeiro."
      }</td></tr>`;
    } else {
      tbody.innerHTML = livros.map((livro) => `
        <tr data-id="${livro.id}">
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
    // ===== EDITAR =====
    this.querySelectorAll(".edit-livro-icon").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const id = Number(btn.dataset.id);
        // tenta achar o objeto completo na lista atual
        let livro = (this._livros || []).find((l) => Number(l?.id) === id);

        // preferir callback vindo da View/Controller
        if (this._onEdit) {
          this._onEdit(livro || { id }); // View cuida de buscar se precisar
          return;
        }

        // fallback SPA: chamar controller diretamente (sem rota)
        if (window.gestorController?.showLivroForm) {
          // se não tivermos os dados completos, busca pela API antes de abrir o form
          if (!livro || !livro.titulo) {
            try {
              livro = await api.get(`/gestor/livros/${id}/`);
            } catch (err) {
              console.error("Falha ao buscar livro antes de editar:", err);
              alert("Não foi possível carregar o livro para edição.");
              return;
            }
          }
          window.gestorController.showLivroForm(livro, () => window.gestorController.showLivrosPage?.());
          return;
        }

        // SEM NAVEGAÇÃO POR ROTA — nunca chame window.navigate aqui
        alert("Não foi possível abrir o formulário de edição no momento.");
      };
    });

    // ===== EXCLUIR =====
    this.querySelectorAll(".delete-livro-icon").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const id = Number(btn.dataset.id);
        if (!window.confirm("Tem certeza que deseja excluir este livro?")) return;

        if (this._onDelete) {
          this._onDelete(id);
          return;
        }

        try {
          await api.delete(`/gestor/livros/${id}/`);
          this._livros = (this._livros || []).filter((l) => Number(l.id) !== id);
          this._rerenderTbody();
        } catch (err) {
          console.error(err);
          const msg = err?.response?.data?.message || err?.message || "Erro ao excluir o livro.";
          alert(msg);
        }
      };
    });

    // ===== VISUALIZAR =====
    this.querySelectorAll(".view-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const id = Number(btn.dataset.id);

        if (this._onView) {
          this._onView(id);
          return;
        }
        if (window.gestorController?.showLivroDetalhe) {
          window.gestorController.showLivroDetalhe(id);
          return;
        }
        alert("Não foi possível abrir os detalhes agora.");
      };
    });

    // ===== EDITAR EXEMPLARES =====
    this.querySelectorAll(".edit-exemplares-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const id = Number(btn.dataset.id);

        if (this._onEditExemplares) {
          this._onEditExemplares(id);
          return;
        }
        if (window.gestorController?.showLivroExemplaresForm) {
          window.gestorController.showLivroExemplaresForm(id, () => window.gestorController.showLivrosPage?.());
          return;
        }
        alert("Não foi possível abrir a edição de exemplares agora.");
      };
    });
  }
}

customElements.define("livro-list", LivroList);
