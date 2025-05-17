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
    container.innerHTML = /* html */ `
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
              (livro) => /* html */ `
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
      btn.onclick = (e) => {
        e.preventDefault();
        onEdit(parseInt(btn.dataset.id));
      };
    });
    container.querySelectorAll(".delete-livro-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (window.confirm("Tem certeza que deseja excluir este livro?")) {
          onDelete(parseInt(btn.dataset.id));
        }
      };
    });
  }

  renderLivroForm(onSubmit, livro = null, onBack = null) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <h2>${livro ? "Editar Livro" : "Adicionar Livro"}</h2>
        <livro-form></livro-form>
      </div>
    `;
    const form = document.querySelector("#livro-form");
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
      document.getElementById("voltar-btn").onclick = onBack;
    }
  }

  renderUnidadeForm(onSubmit, unidade = null, onBack = null) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <unidade-form${unidade ? " edit" : ""}></unidade-form>
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
        onSubmit(form);
      });
      if (onBack) {
        document.getElementById("voltar-unidade-btn").onclick = onBack;
        document.getElementById("cancelar-unidade-btn").onclick = onBack;
      }
    }, 0);
  }

  renderUnidadesPage(unidades, onAdd, onEdit, onDelete) {
    const container =
      document.getElementById("unidades-list") ||
      document.querySelector("#app-content");
    container.innerHTML = /* html */ `
      <unidade-list></unidade-list>
    `;
    const unidadeList = container.querySelector("unidade-list");
    unidadeList.unidades = unidades;
    unidadeList.onEdit = onEdit;
    unidadeList.onDelete = onDelete;
  }
}
