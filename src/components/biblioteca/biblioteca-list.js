// Web Component para a lista de bibliotecas
class BibliotecaList extends HTMLElement {
    constructor() {
        super();
        // Lógica do construtor
    }

    connectedCallback() {
        this.innerHTML = `
            <div id="bibliotecaList">
                <h2>Lista de Bibliotecas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Endereço</th>
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

    // Método para renderizar a lista de bibliotecas
    render(bibliotecas) {
        const tbody = this.querySelector('tbody');
        tbody.innerHTML = ''; // Limpa a tabela antes de adicionar novos itens

        if (!bibliotecas || bibliotecas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Nenhuma biblioteca cadastrada.</td></tr>';
            return;
        }

        bibliotecas.forEach(biblioteca => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${biblioteca.nome}</td>
                <td>${biblioteca.endereco}</td>
                <td>
                    <button class="edit-btn" data-id="${biblioteca.id}">Editar</button>
                    <button class="delete-btn" data-id="${biblioteca.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

customElements.define('biblioteca-list', BibliotecaList);

