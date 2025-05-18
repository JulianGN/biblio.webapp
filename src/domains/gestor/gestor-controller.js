// Controller do domínio Gestor
// Orquestra as ações entre view e service

import { GestorService } from "./gestor-service.js";
import { GestorView } from "./gestor-view.js";
import { GestorInitService } from "./gestor-init-service.js";

// Função de navegação SPA (espera-se que esteja global ou na main.js)
const navigate =
  window.navigate ||
  ((path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  });

export class GestorController {
  constructor() {
    this.service = new GestorService();
    this.initService = new GestorInitService();
    this.initData = { generos: [], unidades: [] };
  }

  async fetchInitData() {
    this.initData = await this.initService.getInitData();
  }

  // CRUD de Livros
  async listarLivros() {
    // Garante que retorna um array de livros, não uma Promise
    const livros = await this.service.listarLivros();
    return Array.isArray(livros) ? livros : [];
  }

  adicionarLivro(livroData) {
    return this.service.adicionarLivro(livroData);
  }

  atualizarLivro(livroId, livroData) {
    return this.service.atualizarLivro(livroId, livroData);
  }

  removerLivro(livroId) {
    return this.service.removerLivro(livroId);
  }

  // --- Lógica de UI e eventos para Livros --- //
  initLivros() {
    this.livroListComponent = document.querySelector("livro-list");
    this.livroFormComponent = document.querySelector("livro-form");
    this.renderLivros();
    this.setupFormHandler();
  }

  renderLivros() {
    if (this.livroListComponent) {
      this.livroListComponent.render(this.listarLivros());
      this.addEventListenersToLivroButtons();
    }
  }

  addEventListenersToLivroButtons() {
    document.querySelectorAll(".edit-livro-btn").forEach((button) => {
      button.removeEventListener("click", this.handleEditLivroBound);
      button.addEventListener("click", this.handleEditLivroBound);
    });
    document.querySelectorAll(".delete-livro-btn").forEach((button) => {
      button.removeEventListener("click", this.handleDeleteLivroBound);
      button.addEventListener("click", this.handleDeleteLivroBound);
    });
  }

  handleEditLivro(event) {
    const livroId = parseInt(event.target.dataset.id);
    const livro = this.listarLivros().find((l) => l.id === livroId);
    if (livro && this.livroFormComponent) {
      const form = this.livroFormComponent.querySelector("#livro-form");
      this.clearFormErrors(form);
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
  }

  handleDeleteLivro(event) {
    const livroId = parseInt(event.target.dataset.id);
    this.removerLivro(livroId);
    this.renderLivros();
  }

  setupFormHandler() {
    if (this.livroFormComponent) {
      const form = this.livroFormComponent.querySelector("#livro-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.clearFormErrors(form);
        let isValid = true;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        if (!data.titulo) {
          this.displayFieldError(form.titulo, "Título é obrigatório.");
          isValid = false;
        }
        if (!data.autor) {
          this.displayFieldError(form.autor, "Autor é obrigatório.");
          isValid = false;
        }
        if (
          data.paginas &&
          (isNaN(parseInt(data.paginas)) || parseInt(data.paginas) <= 0)
        ) {
          this.displayFieldError(
            form.paginas,
            "Número de páginas deve ser um número positivo."
          );
          isValid = false;
        }
        if (
          data.genero &&
          (isNaN(parseInt(data.genero)) || parseInt(data.genero) < 0)
        ) {
          this.displayFieldError(
            form.genero,
            "Gênero (ID) deve ser um número não negativo."
          );
          isValid = false;
        }
        if (!isValid) return;
        const livroIdInput = form.querySelector("#livroId");
        const livroId = livroIdInput ? parseInt(livroIdInput.value) : null;
        const unidades = [{ unidade: 0, exemplares: 1 }];
        const livroData = {
          titulo: data.titulo,
          autor: data.autor,
          editora: data.editora,
          data_publicacao: data.data_publicacao,
          isbn: data.isbn,
          paginas: parseInt(data.paginas) || 0,
          capa: data.capa,
          idioma: data.idioma,
          genero: parseInt(data.genero) || 0,
          unidades: unidades,
        };
        if (livroId) {
          this.atualizarLivro(livroId, livroData);
          if (livroIdInput) livroIdInput.remove();
          form.querySelector('button[type="submit"]').textContent =
            "Salvar Livro";
        } else {
          this.adicionarLivro(livroData);
        }
        form.reset();
        this.renderLivros();
      });
    }
    // Bind handlers for event listeners
    this.handleEditLivroBound = this.handleEditLivro.bind(this);
    this.handleDeleteLivroBound = this.handleDeleteLivro.bind(this);
  }

  clearFormErrors(form) {
    form.querySelectorAll(".error-message").forEach((el) => el.remove());
    form
      .querySelectorAll("input.invalid")
      .forEach((el) => el.classList.remove("invalid"));
  }

  displayFieldError(inputElement, message) {
    inputElement.classList.add("invalid");
    const errorElement = document.createElement("p");
    errorElement.classList.add("error-message");
    errorElement.style.color = "red";
    errorElement.style.fontSize = "0.9em";
    errorElement.textContent = message;
    inputElement.parentNode.insertBefore(
      errorElement,
      inputElement.nextSibling
    );
  }

  async showLivrosPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    // Busca livros da API
    let livros = await this.service.listarLivros();
    livros = livros.map((livro) => ({
      ...livro,
      unidades: (livro.unidades || []).map((u) => ({
        unidade: this.initData.unidades.find((uni) => uni.id === u.unidade) || {
          id: u.unidade,
          nome: `Unidade ${u.unidade}`,
        },
        exemplares: u.exemplares,
      })),
    }));
    this._livrosCache = livros;
    this._lastCallbacks = callbacks;
    this.view.renderLivrosPage(
      livros,
      callbacks.onAdd,
      callbacks.onEdit,
      callbacks.onDelete,
      callbacks.onView,
      callbacks.onEditExemplares
    );
  }

  async editLivro(id, onBack = null) {
    // Busca o livro por id na API
    const livro = await this.service.getLivroById(id);
    // Garante que os dados iniciais estejam carregados
    if (!this.initData.unidades || this.initData.unidades.length === 0) {
      await this.fetchInitData();
    }
    // Ajusta unidades do livro para o formato esperado pela view
    livro.unidades = (livro.unidades || []).map((u) => ({
      unidade: this.initData.unidades.find(
        (uni) => uni.id === (u.unidade.id || u.unidade)
      ) || {
        id: u.unidade.id || u.unidade,
        nome: `Unidade ${u.unidade.id || u.unidade}`,
      },
      exemplares: u.exemplares,
    }));
    await this.showLivroForm(livro, onBack);
  }

  async showLivroForm(livro = null, onBack = null) {
    this.view = this.view || new GestorView();
    if (
      !this.initData.generos ||
      this.initData.generos.length === 0 ||
      !this.initData.unidades ||
      this.initData.unidades.length === 0
    ) {
      await this.fetchInitData();
    }
    // Se for edição, garantir que as unidades do livro estejam no formato correto
    if (livro && Array.isArray(livro.unidades)) {
      livro.unidades = livro.unidades.map((u) => ({
        unidade: this.initData.unidades.find(
          (uni) => uni.id === (u.unidade.id || u.unidade)
        ) || {
          id: u.unidade.id || u.unidade,
          nome: `Unidade ${u.unidade.id || u.unidade}`,
        },
        exemplares: u.exemplares,
      }));
    }
    this.view.renderLivroForm(
      async (form) => {
        // Obter dados do livro base (edição) ou objeto vazio (criação)
        const livroBase = form._livroSelecionado || {};
        // Obter valores dos campos do form
        const getValue = (name) =>
          form.querySelector(`[name="${name}"]`)?.value || "";
        const getNumber = (name) => {
          const v = getValue(name);
          return v === "" ? null : parseInt(v);
        };
        const data = {
          titulo: getValue("titulo") || livroBase.titulo || "",
          autor: getValue("autor") || livroBase.autor || "",
          editora: getValue("editora") || livroBase.editora || "",
          data_publicacao:
            getValue("data_publicacao") || livroBase.data_publicacao || "",
          isbn: getValue("isbn") || livroBase.isbn || "",
          paginas: getNumber("paginas") ?? livroBase.paginas ?? 0,
          capa: getValue("capa") || livroBase.capa || "",
          idioma: getValue("idioma") || livroBase.idioma || "",
          genero: getNumber("genero") ?? livroBase.genero ?? 0,
        };
        let isValid = true;
        const displayFieldError = (input, msg) => {
          if (this.view && typeof this.view.displayFieldError === "function") {
            this.view.displayFieldError(input, msg);
          } else if (input) {
            input.classList.add("invalid");
            const errorElement = document.createElement("p");
            errorElement.classList.add("error-message");
            errorElement.style.color = "red";
            errorElement.style.fontSize = "0.9em";
            errorElement.textContent = msg;
            input.parentNode.insertBefore(errorElement, input.nextSibling);
          }
        };
        // Validação usando os campos do form
        if (!data.titulo) {
          displayFieldError(
            form.querySelector('[name="titulo"]'),
            "Título é obrigatório."
          );
          isValid = false;
        }
        if (!data.autor) {
          displayFieldError(
            form.querySelector('[name="autor"]'),
            "Autor é obrigatório."
          );
          isValid = false;
        }
        if (data.paginas && (isNaN(data.paginas) || data.paginas <= 0)) {
          displayFieldError(
            form.querySelector('[name="paginas"]'),
            "Número de páginas deve ser um número positivo."
          );
          isValid = false;
        }
        if (!data.genero) {
          displayFieldError(
            form.querySelector('[name="genero"]'),
            "Gênero é obrigatório."
          );
          isValid = false;
        }
        if (!isValid) return;
        // Unidades: usar sempre a lista de unidades adicionadas pelo usuário
        const unidades =
          form._livroUnidades && form._livroUnidades.length > 0
            ? form._livroUnidades.map((u) => ({
                unidade: u.unidade.id,
                exemplares: u.exemplares,
              }))
            : [{ unidade: this.initData.unidades[0]?.id || 1, exemplares: 1 }];
        const livroData = {
          ...livroBase,
          ...data,
          unidades: unidades,
        };
        if (livroBase.id) {
          await this.service.atualizarLivro(livroBase.id, livroData);
        } else {
          await this.service.adicionarLivro(livroData);
        }
        if (onBack) onBack();
        else navigate("/livros");
      },
      livro,
      onBack || (() => navigate("/livros")),
      this.initData.generos,
      this.initData.unidades
    );
  }

  async showLivroExemplaresForm(id, onBack = null) {
    this.view = this.view || new GestorView();
    // Busca o livro por id na API
    const livro = await this.service.getLivroById(id);
    // Garante que as unidades estejam carregadas
    if (!this.initData.unidades || this.initData.unidades.length === 0) {
      await this.fetchInitData();
    }
    // Mapear unidades para objetos completos
    livro.unidades = (livro.unidades || []).map((u) => ({
      unidade: this.initData.unidades.find(
        (uni) => uni.id === (u.unidade.id || u.unidade)
      ) || {
        id: u.unidade.id || u.unidade,
        nome: `Unidade ${u.unidade.id || u.unidade}`,
      },
      exemplares: u.exemplares,
    }));
    this.view.renderLivroExemplaresForm(
      livro,
      async (unidadesAtualizadas) => {
        if (this.service.atualizarLivroParcial) {
          await this.service.atualizarLivroParcial(livro.id, {
            unidades: unidadesAtualizadas.map((u) => ({
              unidade: u.unidade.id,
              exemplares: u.exemplares,
            })),
          });
        }

        if (onBack) onBack();
        else navigate("/livros");
      },
      onBack || (() => navigate("/livros"))
    );
  }

  showUnidadesPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    this.view.renderUnidadesPage(
      this.service.listarUnidades(),
      callbacks.onAdd || (() => {}),
      callbacks.onEdit || (() => {}),
      callbacks.onDelete || (() => {})
    );
  }

  addUnidade(unidadeData) {
    return this.service.adicionarUnidade(unidadeData);
  }

  editUnidade(id, onBack = null) {
    const unidade = this.service.listarUnidades().find((u) => u.id === id);
    this.showUnidadeForm(unidade, onBack);
  }

  deleteUnidade(id) {
    this.service.removerUnidade(id);
    this.showUnidadesPage();
  }

  async deleteLivro(id) {
    try {
      await this.removerLivro(id);
      alert("Livro removido com sucesso!");
      // Remove o livro da lista local e atualiza a view
      if (this._livrosCache) {
        this._livrosCache = this._livrosCache.filter((l) => l.id !== id);
        this.view.renderLivrosPage(
          this._livrosCache,
          this._lastCallbacks?.onAdd,
          this._lastCallbacks?.onEdit,
          this._lastCallbacks?.onDelete,
          this._lastCallbacks?.onView,
          this._lastCallbacks?.onEditExemplares
        );
      } else {
        await this.showLivrosPage(this._lastCallbacks);
      }
    } catch (err) {
      alert("Erro ao remover livro: " + (err.message || err));
    }
  }

  async showUnidadeForm(unidade = null, onBack = null) {
    this.view =
      this.view || new (await import("./gestor-view.js")).GestorView();
    this.view.renderUnidadeForm(
      (form) => {
        // Validação simples
        let isValid = true;
        if (!form.nome.value) {
          this.view.displayFieldError(form.nome, "Nome é obrigatório.");
          isValid = false;
        }
        if (!form.endereco.value) {
          this.view.displayFieldError(form.endereco, "Endereço é obrigatório.");
          isValid = false;
        }
        if (
          form.email.value &&
          !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value)
        ) {
          this.view.displayFieldError(
            form.email,
            "Formato de e-mail inválido."
          );
          isValid = false;
        }
        if (!isValid) return;
        const unidadeData = {
          nome: form.nome.value,
          endereco: form.endereco.value,
          telefone: form.telefone.value,
          email: form.email.value,
          site: form.site.value,
        };
        // Aqui você pode adicionar lógica para salvar a unidade futuramente
        if (onBack) onBack();
        else navigate("/unidades");
      },
      unidade,
      onBack || (() => navigate("/unidades"))
    );
  }

  async showLivroDetalhe(id) {
    this.view = this.view || new GestorView();
    // Busca o livro por id na API
    const livro = await this.service.getLivroById(id);
    // Garante que os dados iniciais estejam carregados
    if (
      !this.initData.unidades ||
      this.initData.unidades.length === 0 ||
      !this.initData.generos ||
      this.initData.generos.length === 0
    ) {
      await this.fetchInitData();
    }
    // Mapear unidades para objetos completos
    livro.unidades = (livro.unidades || []).map((u) => ({
      unidade: this.initData.unidades.find(
        (uni) => uni.id === (u.unidade.id || u.unidade)
      ) || {
        id: u.unidade.id || u.unidade,
        nome: `Unidade ${u.unidade.id || u.unidade}`,
      },
      exemplares: u.exemplares,
    }));
    // Mapear gênero para objeto completo
    livro.generoObj = this.initData.generos.find(
      (g) => g.id === (livro.genero?.id || livro.genero)
    ) || { id: livro.genero, nome: `Gênero ${livro.genero}` };
    this.view.renderLivroDetalhe(livro);
  }

  showUnidadeDetalhe(id) {
    const unidade = this.service.unidades.find((u) => u.id === id);
    this.view.renderUnidadeDetalhe(unidade);
  }
}
