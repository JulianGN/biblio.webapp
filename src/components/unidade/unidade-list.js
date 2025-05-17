import "./unidade-list.css";

// Web Component para a listagem de unidades (bibliotecas)
class UnidadeList extends HTMLElement {
  set unidades(unidades) {
    this._unidades = unidades;
    this.render();
  }

  get unidades() {
    return this._unidades || [];
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

  render() {
    this.innerHTML = /* html */ `
      <div class="unidade-list-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <h2 style="margin:0;">Lista de Unidades</h2>
        <button id="add-unidade-btn" class="outline">+ Adicionar Unidade</button>
      </div>
      <table class="unidades-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Endereço</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Site</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.unidades
            .map(
              (unidade) => /* html */ `
            <tr>
              <td>${unidade.nome}</td>
              <td>${unidade.endereco}</td>
              <td>${unidade.telefone || ""}</td>
              <td>${unidade.email || ""}</td>
              <td>${unidade.site || ""}</td>
              <td>
                <div class="unidade-list-actions">
                    <button class="view-unidade-icon outline border-0" data-id="${
                      unidade.id
                    }" title="Visualizar">👁️</button>
                    <button class="edit-unidade-icon outline border-0" data-id="${
                      unidade.id
                    }" title="Editar">✏️</button>
                    <button class="delete-unidade-icon outline border-0" data-id="${
                      unidade.id
                    }" title="Excluir">🗑️</button>
                </div>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    this.querySelector("#add-unidade-btn").onclick = (e) => {
      e.preventDefault();
      if (this._onAdd) this._onAdd();
    };
    this.querySelectorAll(".edit-unidade-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (this._onEdit) this._onEdit(parseInt(btn.dataset.id));
      };
    });
    this.querySelectorAll(".delete-unidade-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (window.confirm("Tem certeza que deseja excluir esta unidade?")) {
          if (this._onDelete) this._onDelete(parseInt(btn.dataset.id));
        }
      };
    });
    this.querySelectorAll(".view-unidade-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (window.navigate)
          window.navigate(`/unidades/${btn.dataset.id}/detalhe`);
        else if (this._onView) this._onView(parseInt(btn.dataset.id));
      };
    });
  }
}
customElements.define("unidade-list", UnidadeList);
