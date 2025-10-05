// 📁 src/components/unidade/unidade-list.js
import "./unidade-list.css";
import { BaseService } from "../../domains/base-service"; // ✅ caminho correto

// Instância única da API
const api = new BaseService();

// Web Component para a listagem de unidades (bibliotecas)
class UnidadeList extends HTMLElement {
  constructor() {
    super();
    this._unidades = [];
  }

  set unidades(unidades) {
    this._unidades = Array.isArray(unidades) ? unidades : [];
    this.render();
  }

  get unidades() {
    return Array.isArray(this._unidades) ? this._unidades : [];
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

  // Carregar da API se nada vier pelo setter
  connectedCallback() {
    this.render();

    if (!this._unidades || this._unidades.length === 0) {
      (async () => {
        try {
          const data = await api.get("gestor/unidades/"); // ← sem /api
          this._unidades = Array.isArray(data) ? data : (data?.results || []);
          this.render();
        } catch (e) {
          console.error("Falha ao carregar unidades:", e);
          const tbody = this.querySelector("#unidades-tbody");
          if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#c00;">
              Erro ao carregar unidades. Verifique a conexão com o servidor.
            </td></tr>`;
          }
        }
      })();
    }
  }

  render() {
    const unidades = this.unidades;

    this.innerHTML = /* html */ `
      <div class="unidade-list-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <h2 style="margin:0;">Lista de Unidades</h2>
        <button id="add-unidade-btn" class="outline">+ <span class="d-sm-none">Adicionar Unidade</span></button>
      </div>

      <div class="table-responsive">
        <table class="unidades-table striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Site</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody id="unidades-tbody">
            ${
              unidades.length > 0
                ? unidades
                    .map(
                      (unidade) => /* html */ `
                        <tr>
                          <td>${unidade.nome ?? ""}</td>
                          <td>${unidade.endereco ?? ""}</td>
                          <td>${unidade.telefone ?? ""}</td>
                          <td>${unidade.email ?? ""}</td>
                          <td>${unidade.site ?? ""}</td>
                          <td class="text-end">
                            <div class="list-actions unidade-list-actions">
                              <button class="view-unidade-icon outline border-0" data-id="${unidade.id}" title="Visualizar"><i class="fa-solid fa-eye"></i></button>
                              <button class="edit-unidade-icon outline border-0" data-id="${unidade.id}" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                              <button class="delete-unidade-icon outline border-0" data-id="${unidade.id}" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                          </td>
                        </tr>
                      `
                    )
                    .join("")
                : '<tr><td colspan="6" style="text-align:center;color:#888;">Nenhuma unidade cadastrada.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;

    // Botão "Adicionar"
    const addBtn = this.querySelector("#add-unidade-btn");
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.preventDefault();
        if (this._onAdd) this._onAdd();
        else if (window.navigate) window.navigate("/unidades/novo");
      };
    }

    // Ações por linha
    this._bindRowEvents();
  }

  _bindRowEvents() {
    // Editar
    this.querySelectorAll(".edit-unidade-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        if (this._onEdit) this._onEdit(id);
        else if (window.navigate) window.navigate(`/unidades/${id}/editar`);
      };
    });

    // Excluir
    this.querySelectorAll(".delete-unidade-icon").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        if (!window.confirm("Tem certeza que deseja excluir esta unidade?")) return;

        if (this._onDelete) {
          this._onDelete(id);
          return;
        }

        try {
          // DELETE em /gestor/unidades/{id}/
          await api.delete(`gestor/unidades/${id}/`);
          this._unidades = (this._unidades || []).filter((u) => u.id !== id);
          // re-renderiza apenas o tbody
          const tbody = this.querySelector("#unidades-tbody");
          if (tbody) {
            tbody.innerHTML =
              this._unidades.length > 0
                ? this._unidades
                    .map(
                      (unidade) => /* html */ `
                        <tr>
                          <td>${unidade.nome ?? ""}</td>
                          <td>${unidade.endereco ?? ""}</td>
                          <td>${unidade.telefone ?? ""}</td>
                          <td>${unidade.email ?? ""}</td>
                          <td>${unidade.site ?? ""}</td>
                          <td class="text-end">
                            <div class="list-actions unidade-list-actions">
                              <button class="view-unidade-icon outline border-0" data-id="${unidade.id}" title="Visualizar"><i class="fa-solid fa-eye"></i></button>
                              <button class="edit-unidade-icon outline border-0" data-id="${unidade.id}" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                              <button class="delete-unidade-icon outline border-0" data-id="${unidade.id}" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                          </td>
                        </tr>
                      `
                    )
                    .join("")
                : '<tr><td colspan="6" style="text-align:center;color:#888;">Nenhuma unidade cadastrada.</td></tr>';
          }
          // reatribui eventos após re-render
          this._bindRowEvents();
        } catch (err) {
          console.error(err);
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Erro ao excluir a unidade.";
          alert(msg);
        }
      };
    });

    // Visualizar
    this.querySelectorAll(".view-unidade-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        if (this._onView) this._onView(id);
        else if (window.navigate) window.navigate(`/unidades/${id}/detalhe`);
      };
    });
  }
}

customElements.define("unidade-list", UnidadeList);
