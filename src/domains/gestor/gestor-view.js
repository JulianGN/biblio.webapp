// View do domínio Gestor
// Responsável por renderizar e manipular o DOM relacionado ao gestor

export class GestorView {
  renderGestores(gestores) {
    // Exemplo: renderizar lista de gestores no console
    console.log("Lista de Gestores:", gestores);
    // Aqui você pode implementar a renderização no DOM
  }

  renderLivrosPage(livros, onAdd, onEdit, onDelete) {
    const container =
      document.getElementById("livros-list") ||
      document.querySelector("#app-content");
    container.innerHTML = `
      <table class="livros-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>ISBN</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${livros
            .map(
              (livro) => `
            <tr>
              <td>${livro.titulo}</td>
              <td>${livro.autor}</td>
              <td>${livro.isbn}</td>
              <td style="text-align:right">
                <button class="edit-livro-icon" data-id="${livro.id}" title="Editar">✏️</button>
                <button class="delete-livro-icon" data-id="${livro.id}" title="Excluir">🗑️</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    container.querySelectorAll(".edit-livro-icon").forEach((btn) => {
      btn.onclick = () => onEdit(parseInt(btn.dataset.id));
    });
    container.querySelectorAll(".delete-livro-icon").forEach((btn) => {
      btn.onclick = () => {
        if (window.confirm("Tem certeza que deseja excluir este livro?")) {
          onDelete(parseInt(btn.dataset.id));
        }
      };
    });
  }

  renderLivroForm(onSubmit, livro = null, onBack = null) {
    // Renderiza apenas o formulário, não a lista
    document.querySelector("#app-content").innerHTML = `
      <div class="form-container">
        <button id="voltarBtn" style="margin-bottom:16px">&larr; Voltar</button>
        <h2>${livro ? "Editar Livro" : "Adicionar Livro"}</h2>
        <livro-form></livro-form>
      </div>
    `;
    const form = document.querySelector("#livroForm");
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
      document.getElementById("voltarBtn").onclick = onBack;
    }
  }

  renderUnidadeForm(onSubmit, unidade = null, onBack = null) {
    document.querySelector("#app-content").innerHTML = `
      <div class="form-container">
        <button id="voltarUnidadeBtn" style="margin-bottom:16px">&larr; Voltar</button>
        <h2>${unidade ? "Editar Unidade" : "Adicionar Unidade"}</h2>
        <form id="unidadeForm">
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
          <button type="submit">${
            unidade ? "Atualizar Unidade" : "Salvar Unidade"
          }</button>
        </form>
      </div>
    `;
    const form = document.getElementById("unidadeForm");
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
      document.getElementById("voltarUnidadeBtn").onclick = onBack;
    }
  }

  renderUnidadesPage(unidades, onAdd, onEdit, onDelete) {
    const container =
      document.getElementById("unidades-list") ||
      document.querySelector("#app-content");
    container.innerHTML = `
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
          ${unidades
            .map(
              (unidade) => `
            <tr>
              <td>${unidade.nome}</td>
              <td>${unidade.endereco}</td>
              <td>${unidade.telefone || ""}</td>
              <td>${unidade.email || ""}</td>
              <td>${unidade.site || ""}</td>
              <td style="text-align:right">
                <button class="edit-unidade-icon" data-id="${
                  unidade.id
                }" title="Editar">✏️</button>
                <button class="delete-unidade-icon" data-id="${
                  unidade.id
                }" title="Excluir">🗑️</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    container.querySelectorAll(".edit-unidade-icon").forEach((btn) => {
      btn.onclick = () => onEdit(parseInt(btn.dataset.id));
    });
    container.querySelectorAll(".delete-unidade-icon").forEach((btn) => {
      btn.onclick = () => {
        if (window.confirm("Tem certeza que deseja excluir esta unidade?")) {
          onDelete(parseInt(btn.dataset.id));
        }
      };
    });
  }
}
