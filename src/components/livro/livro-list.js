// Web Component para a lista de livros
class LivroList extends HTMLElement {
    constructor() {
        super();
        // Lógica do construtor
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
                            <th>Ações</th>
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
    render(livros) {
        const tbody = this.querySelector("tbody");
        tbody.innerHTML = ""; // Limpa a tabela antes de adicionar novos itens

        if (!livros || livros.length === 0) {
            tbody.innerHTML = "<tr><td colspan=\"4\">Nenhum livro cadastrado.</td></tr>";
            return;
        }

        livros.forEach(livro => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${livro.titulo}</td>
                <td>${livro.autor}</td>
                <td>${livro.isbn}</td>
                <td>
                    <button class=\"edit-livro-btn\" data-id=\"${livro.id}\">Editar</button>
                    <button class=\"delete-livro-btn\" data-id=\"${livro.id}\">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

customElements.define("livro-list", LivroList);

