import "./livro-form.css";

// Web Component para o formulário de livro
class LivroForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const isEdit = this.hasAttribute("edit");
    const unidades =
      this._unidadesDisponiveis ||
      (window.gestorController &&
        window.gestorController.initData &&
        window.gestorController.initData.unidades) ||
      [];
    this._livroUnidades =
      Array.isArray(this._livroUnidades) && this._livroUnidades.length > 0
        ? this._livroUnidades
        : (this._livroUnidades = []);
    if (
      isEdit &&
      this._livroUnidades.length === 0 &&
      this._unidadesSelecionadas
    ) {
      this._livroUnidades = this._unidadesSelecionadas;
    }
    if (
      isEdit &&
      this._unidadesSelecionadas &&
      this._unidadesSelecionadas.length > 0
    ) {
      this._livroUnidades = [...this._unidadesSelecionadas];
    }
    this.innerHTML = `
            <form id="livro-form">
                <div class="livro-form-header">
                    <button type="button" id="voltar-btn" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button>
                    <h2 style="margin: 0;">${
                      isEdit ? "Editar Livro" : "Adicionar Livro"
                    }</h2>
                </div>
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
                    <label for="genero">Gênero (ID):</label>
                    <input type="number" id="genero" name="genero">
                </div>
                <div class="livro-unidade-header">
                    <div class="livro-unidade">
                  <label for="unidade-select">Unidade:</label>
                  <select id="unidade-select">
                    <option value="">Selecione a unidade</option>
                    ${unidades
                      .map((u) => `<option value="${u.id}">${u.nome}</option>`)
                      .join("")}
                  </select>
                    </div>
                    <div class="livro-unidade">
                      <label for="exemplares-input">Exemplares:</label>
                      <input type="number" id="exemplares-input" min="1" value="1">
                    </div>
                     <button type="button" id="add-unidade-livro" class="outline">Adicionar Unidade</button>
                </div>
                <div id="livro-unidades-list" style="margin:8px 0 16px 0;"></div>
                <div class="livro-form-footer">
                    <button type="button" id="cancelar-btn" class="outline">Cancelar</button>
                    <button type="submit">Salvar Livro</button>
                </div>
            </form>
        `;
    setTimeout(() => {
      const voltarBtn = this.querySelector("#voltar-btn");
      const cancelarBtn = this.querySelector("#cancelar-btn");
      if (voltarBtn)
        voltarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/livros");
        };
      if (cancelarBtn)
        cancelarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/livros");
        };
      const unidadeSelect = this.querySelector("#unidade-select");
      const exemplaresInput = this.querySelector("#exemplares-input");
      const addUnidadeBtn = this.querySelector("#add-unidade-livro");
      const unidadesListDiv = this.querySelector("#livro-unidades-list");
      const form = this.querySelector("#livro-form");
      // Se for edição, popular a lista de unidades já escolhidas
      if (
        isEdit &&
        Array.isArray(this._livroUnidades) &&
        this._livroUnidades.length === 0 &&
        this._unidadesSelecionadas
      ) {
        this._livroUnidades = this._unidadesSelecionadas;
      }
      // Renderizar lista de unidades já escolhidas
      const renderUnidadesList = () => {
        unidadesListDiv.innerHTML =
          this._livroUnidades.length > 0
            ? `<ul style='margin:0;padding-left:1.2em;'>` +
              this._livroUnidades
                .map(
                  (u) =>
                    `<li><strong>${u.unidade.nome}:</strong> ${u.exemplares} exemplar(es) <button type='button' class='remove-unidade-livro outline' data-id='${u.unidade.id}'>Remover</button></li>`
                )
                .join("") +
              `</ul>`
            : '<span style="color:#888;">Nenhuma unidade adicionada.</span>';
        // Eventos de remover
        unidadesListDiv
          .querySelectorAll(".remove-unidade-livro")
          .forEach((btn) => {
            btn.onclick = (e) => {
              e.preventDefault();
              const id = parseInt(btn.dataset.id);
              this._livroUnidades = this._livroUnidades.filter(
                (u) => u.unidade.id !== id
              );
              renderUnidadesList();
            };
          });
      };
      if (
        isEdit &&
        this._unidadesSelecionadas &&
        this._unidadesSelecionadas.length > 0
      ) {
        this._livroUnidades = [...this._unidadesSelecionadas];
        renderUnidadesList();
      }

      addUnidadeBtn.onclick = (e) => {
        e.preventDefault();
        const unidadeId = parseInt(unidadeSelect.value);
        const unidade = unidades.find((u) => u.id === unidadeId);
        const exemplares = parseInt(exemplaresInput.value) || 1;
        if (!unidadeId || !unidade) return;
        if (this._livroUnidades.some((u) => u.unidade.id === unidadeId)) return;
        this._livroUnidades.push({ unidade, exemplares });
        renderUnidadesList();
      };
      form.addEventListener("submit", (event) => {
        // Validação extra: data e ISBN
        const dataPub = form.data_publicacao?.value;
        const isbn = form.isbn?.value;
        let dataInvalida = false;
        if (dataPub) {
          const dataObj = new Date(dataPub);
          const hoje = new Date();
          if (isNaN(dataObj.getTime()) || dataObj > hoje) {
            dataInvalida = true;
          }
        }
        if ((dataInvalida || !dataPub) && (!isbn || isbn.trim() === "")) {
          alert("Informe uma data de publicação válida ou um ISBN.");
          event.preventDefault();
          return false;
        }
        // Adiciona as unidades selecionadas ao form para o controller
        if (form._livroUnidades && form._livroUnidades.length > 0) {
          form._unidadesPayload = form._livroUnidades.map((u) => ({
            unidade: u.unidade.id,
            exemplares: u.exemplares,
          }));
        } else {
          form._unidadesPayload = [
            { unidade: unidades[0]?.id || 1, exemplares: 1 },
          ];
        }
      });
      // Preencher campos do formulário ao editar
      if (isEdit && this._livroSelecionado) {
        const livro = this._livroSelecionado;
        const form = this.querySelector("#livro-form");
        if (livro && form) {
          if (form.titulo) form.titulo.value = livro.titulo || "";
          if (form.autor) form.autor.value = livro.autor || "";
          if (form.editora) form.editora.value = livro.editora || "";
          if (form.data_publicacao)
            form.data_publicacao.value = livro.data_publicacao || "";
          if (form.isbn) form.isbn.value = livro.isbn || "";
          if (form.paginas) form.paginas.value = livro.paginas || "";
          if (form.capa) form.capa.value = livro.capa || "";
          if (form.idioma) form.idioma.value = livro.idioma || "";
          if (form.genero) form.genero.value = livro.genero || "";
        }
      }
      // Renderizar lista de unidades já escolhidas imediatamente ao abrir
      renderUnidadesList();
    }, 0);
  }
}

customElements.define("livro-form", LivroForm);

if (typeof window !== "undefined") {
  if (!window.gestorController && window.GestorController) {
    window.gestorController = new window.GestorController();
  }
}
