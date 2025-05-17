// Controller do domínio Gestor
// Orquestra as ações entre view e service

import { GestorService } from "./gestor-service.js";
import { GestorView } from "./gestor-view.js";

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
  }

  // CRUD de Livros
  listarLivros() {
    return this.service.listarLivros();
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
      const form = this.livroFormComponent.querySelector("#livroForm");
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
      const form = this.livroFormComponent.querySelector("#livroForm");
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

  showLivrosPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    this.view.renderLivrosPage(
      this.listarLivros(),
      callbacks.onAdd || (() => {}),
      callbacks.onEdit || (() => {}),
      callbacks.onDelete || (() => {})
    );
  }

  showLivroForm(livro = null, onBack = null) {
    this.view = this.view || new GestorView();
    this.view.renderLivroForm(
      (form) => {
        // Validação simples (pode ser melhorada)
        const data = Object.fromEntries(new FormData(form).entries());
        let isValid = true;
        if (!data.titulo) {
          this.view.displayFieldError(form.titulo, "Título é obrigatório.");
          isValid = false;
        }
        if (!data.autor) {
          this.view.displayFieldError(form.autor, "Autor é obrigatório.");
          isValid = false;
        }
        if (
          data.paginas &&
          (isNaN(parseInt(data.paginas)) || parseInt(data.paginas) <= 0)
        ) {
          this.view.displayFieldError(
            form.paginas,
            "Número de páginas deve ser um número positivo."
          );
          isValid = false;
        }
        if (
          data.genero &&
          (isNaN(parseInt(data.genero)) || parseInt(data.genero) < 0)
        ) {
          this.view.displayFieldError(
            form.genero,
            "Gênero (ID) deve ser um número não negativo."
          );
          isValid = false;
        }
        if (!isValid) return;
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
        if (livro && livro.id) {
          this.atualizarLivro(livro.id, livroData);
        } else {
          this.adicionarLivro(livroData);
        }
        if (onBack) onBack();
        else navigate("/livros");
      },
      livro,
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
}
