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
      <livro-list></livro-list>
    `;
    const livroList = container.querySelector("livro-list");
    livroList.livros = livros;
    livroList.onEdit = onEdit;
    livroList.onDelete = onDelete;
  }

  renderLivroForm(onSubmit, livro = null, onBack = null) {
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <livro-form ${livro ? "edit" : ""}></livro-form>
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
        <unidade-form ${unidade ? "edit" : ""}></unidade-form>
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
