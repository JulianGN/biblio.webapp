// Web Component para o formulário de biblioteca
class BibliotecaForm extends HTMLElement {
    constructor() {
        super();
        // Lógica do construtor
    }

    connectedCallback() {
        this.innerHTML = `
            <form id="bibliotecaForm">
                <h2>Formulário de Biblioteca</h2>
                <div>
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" required>
                </div>
                <div>
                    <label for="endereco">Endereço:</label>
                    <input type="text" id="endereco" name="endereco" required>
                </div>
                <div>
                    <label for="telefone">Telefone:</label>
                    <input type="text" id="telefone" name="telefone">
                </div>
                <div>
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email">
                </div>
                <div>
                    <label for="site">Site:</label>
                    <input type="url" id="site" name="site">
                </div>
                <button type="submit">Salvar</button>
            </form>
        `;
    }
}

customElements.define('biblioteca-form', BibliotecaForm);

