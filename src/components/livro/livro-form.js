// Web Component para o formulário de livro
class LivroForm extends HTMLElement {
    constructor() {
        super();
        // Lógica do construtor
    }

    connectedCallback() {
        this.innerHTML = `
            <form id="livroForm">
                <h2>Formulário de Livro</h2>
                <div>
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" name="titulo" required>
                </div>
                <div>
                    <label for="autor">Autor:</label>
                    <input type="text" id="autor" name="autor" required>
                </div>
                <div>
                    <label for="editora">Editora:</label>
                    <input type="text" id="editora" name="editora">
                </div>
                <div>
                    <label for="data_publicacao">Data de Publicação:</label>
                    <input type="date" id="data_publicacao" name="data_publicacao">
                </div>
                <div>
                    <label for="isbn">ISBN:</label>
                    <input type="text" id="isbn" name="isbn">
                </div>
                <div>
                    <label for="paginas">Páginas:</label>
                    <input type="number" id="paginas" name="paginas">
                </div>
                <div>
                    <label for="capa">URL da Capa:</label>
                    <input type="url" id="capa" name="capa">
                </div>
                <div>
                    <label for="idioma">Idioma:</label>
                    <input type="text" id="idioma" name="idioma">
                </div>
                <div>
                    <label for="genero">Gênero (ID):</label> <!-- Simplificado para ID por enquanto -->
                    <input type="number" id="genero" name="genero">
                </div>
                <!-- O campo 'unidades' será tratado na lógica principal, pois é mais complexo -->
                <button type="submit">Salvar Livro</button>
            </form>
        `;
    }
}

customElements.define('livro-form', LivroForm);

