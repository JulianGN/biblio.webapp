import "./unidade-form.css";

// Web Component para o formulário de unidade (biblioteca)
class UnidadeForm extends HTMLElement {
  connectedCallback() {
    const isEdit = this.hasAttribute("edit");
    this.innerHTML = `
      <form id="unidade-form">
        <div class="unidade-form-header">
          <button type="button" id="voltar-unidade-btn" class="outline border-0">&larr;</button>
          <h2 style="margin: 0;">${
            isEdit ? "Editar Unidade" : "Adicionar Unidade"
          }</h2>
        </div>
        <div>
          <label for="nome">Nome:</label>
          <input type="text" id="nome" name="nome" required />
        </div>
        <div>
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" name="endereco" required />
        </div>
        <div>
          <label for="telefone">Telefone:</label>
          <input type="text" id="telefone" name="telefone" />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label for="site">Site:</label>
          <input type="url" id="site" name="site" />
        </div>
        <div class="unidade-form-footer">
          <button type="button" id="cancelar-unidade-btn" class="outline">Cancelar</button>
          <button type="submit">Salvar Unidade</button>
        </div>
      </form>
    `;
  }
}
customElements.define("unidade-form", UnidadeForm);
