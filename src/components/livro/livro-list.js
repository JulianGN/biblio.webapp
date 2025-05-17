import "./livro-list.css";

// Web Component para a lista de livros
class LivroList extends HTMLElement {
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

  connectedCallback() {
    this.innerHTML = `
            <div id="livroList">
                <h2>Lista de Livros</h2>
                <table>
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
    const tbody = this.querySelector("tbody");
    tbody.innerHTML = ""; // Limpa a tabela antes de adicionar novos itens

    if (!this.livros || this.livros.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4">Nenhum livro cadastrado.</td></tr>';
      return;
    }

    this.livros.forEach((livro) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${livro.titulo}</td>
                <td>${livro.autor}</td>
                <td>${livro.isbn}</td>
                <td>
                    <div class="livro-list-actions">
                      <button class="edit-livro-icon outline border-0" data-id="${livro.id}" title="Editar">✏️</button>
                      <button class="delete-livro-icon outline border-0" data-id="${livro.id}" title="Excluir">🗑️</button>
                    </div>
                </td>
            `;
      tbody.appendChild(tr);
    });

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
  }
}

customElements.define("livro-list", LivroList);
