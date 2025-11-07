// 📁 src/domains/gestor/gestor-controller.js
// Controller do domínio Gestor
// Orquestra as ações entre view e service

import { GestorService } from "./gestor-service.js";
import { GestorView } from "./gestor-view.js";
import { GestorInitService } from "./gestor-init-service.js";

// Função de navegação SPA
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
    this.initData = { generos: [], unidades: [], tipo_obras: [] };
    this.view = null;

    // Disponibiliza para componentes/Views que leem do window
    window.gestorController = this;

    // caches
    this._livrosCache = null;
    this._unidadesCache = null;
    this._lastCallbacks = null;
  }

  async fetchInitData() {
    try {
      const data = await this.initService.getInitData();
      this.initData = {
        generos: Array.isArray(data.generos) ? data.generos : [],
        unidades: Array.isArray(data.unidades) ? data.unidades : [],
        tipo_obras: Array.isArray(data.tipo_obras) ? data.tipo_obras : [],
      };
    } catch (err) {
      console.error("Erro ao carregar initData:", err);
      alert("Não foi possível carregar listas iniciais (gêneros/unidades/tipos).");
    }
  }

  /* ───────────────────────────────
   * LIVROS — CRUD
   * ─────────────────────────────── */
  async listarLivros() {
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

  /* ───────────────────────────────
   * LIVROS — VIEWS
   * ─────────────────────────────── */
  async showLivrosPage(callbacks = {}) {
    this.view = this.view || new GestorView();

    if (
      !this.initData.generos.length ||
      !this.initData.unidades.length ||
      !this.initData.tipo_obras.length
    ) {
      await this.fetchInitData();
    }

    let livros = [];
    try {
      livros = await this.service.listarLivros();
    } catch (e) {
      console.error("Falha ao listar livros:", e);
      alert("Não foi possível carregar a lista de livros agora.");
    }
    livros = Array.isArray(livros) ? livros : [];

    this._livrosCache = livros;
    this._lastCallbacks = callbacks;

    const onAdd =
      callbacks.onAdd ||
      (() => this.showLivroForm(null, () => this.showLivrosPage(callbacks)));

    const onEdit =
      callbacks.onEdit ||
      (async (idOrObj) => {
        try {
          const id = typeof idOrObj === "object" ? Number(idOrObj?.id) : Number(idOrObj);
          if (!id) return alert("ID do livro inválido.");
          const livroApi = await this.service.getLivroById(id);
          await this.showLivroForm(livroApi, () => this.showLivrosPage(callbacks));
        } catch (err) {
          console.error("Falha ao abrir edição do livro:", err);
          alert("Não foi possível abrir o formulário de edição.");
        }
      });

    const onDelete =
      callbacks.onDelete ||
      (async (livroId) => {
        if (confirm("Deseja realmente remover este livro?")) {
          await this.removerLivro(livroId);
          await this.showLivrosPage(callbacks);
        }
      });

    const onView = callbacks.onView || ((livroId) => this.showLivroDetalhe(livroId));

    const onEditExemplares =
      callbacks.onEditExemplares ||
      ((livroId) =>
        this.showLivroExemplaresForm(livroId, () => this.showLivrosPage(callbacks)));

    this.view.renderLivrosPage(
      livros,
      onAdd,
      onEdit,
      onDelete,
      onView,
      onEditExemplares,
      this.initData
    );
  }

  async showLivroForm(idOrLivro = null, onBack = null) {
    this.view = this.view || new GestorView();

    if (
      !this.initData.generos.length ||
      !this.initData.unidades.length ||
      !this.initData.tipo_obras.length
    ) {
      await this.fetchInitData();
    }

    let livro = null;
    try {
      if (idOrLivro && typeof idOrLivro === "object") {
        livro = { ...idOrLivro };
      } else if (idOrLivro != null) {
        const id = Number(idOrLivro);
        if (Number.isFinite(id) && id > 0) {
          const fromApi = await this.service.getLivroById(id);
          livro = fromApi || null;
        }
      }
    } catch (e) {
      console.error("Erro ao obter livro para edição:", e);
    }

    this.view.renderLivroForm(
      async (formData) => {
        try {
          if (livro?.id) {
            await this.service.atualizarLivro(Number(livro.id), formData);
            alert("Livro atualizado com sucesso!");
          } else {
            await this.service.adicionarLivro(formData);
            alert("Livro criado com sucesso!");
          }
          onBack ? onBack() : navigate("/livros");
        } catch (err) {
          console.error("Erro ao salvar livro:", err);
          alert("Falha ao salvar o livro. Tente novamente.");
        }
      },
      livro,
      onBack || (() => navigate("/livros")),
      this.initData.generos,
      this.initData.unidades,
      this.initData.tipo_obras
    );
  }

  async showLivroExemplaresForm(id, onBack = null) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = `<livro-exemplares-page></livro-exemplares-page>`;
    const el = root.querySelector("livro-exemplares-page");

    try {
      const livro = await this.service.getLivroById(id);
      if (!this.initData.unidades.length) await this.fetchInitData();

      el.livroId = Number(id);
      el.livro = livro;
      el.unidadesDisponiveis = this.initData.unidades;

      el.onCancelar = () => (onBack ? onBack() : navigate("/livros"));

      el.onSalvar = async (payload) => {
        try {
          const unidades = Array.isArray(payload?.unidades) ? payload.unidades : [];
          await this.service.atualizarLivroParcial(Number(id), { unidades });
          alert("Exemplares atualizados com sucesso!");
          onBack ? onBack() : navigate("/livros");
        } catch (err) {
          console.error(err);
          alert("Erro ao salvar exemplares. Tente novamente.");
        }
      };
    } catch (err) {
      console.error("Erro ao carregar exemplares:", err);
      root.innerHTML = `<div style="padding:1rem;color:#c00;">Falha ao carregar dados do livro.</div>`;
    }
  }

  async showLivroDetalhe(id) {
    try {
      const livro = await this.service.getLivroById(id);
      this.view = this.view || new GestorView();
      this.view.renderLivroDetalhe(livro, this.initData);
    } catch (err) {
      console.error("Erro ao carregar detalhe do livro:", err);
      alert("Não foi possível abrir o detalhe do livro.");
    }
  }

  /* ───────────────────────────────
   * UNIDADES — CRUD
   * ─────────────────────────────── */
  async showUnidadesPage(callbacks = {}) {
    this.view = this.view || new GestorView();

    let unidades = [];
    try {
      unidades = await this.service.listarUnidades();
    } catch (e) {
      console.error("Falha ao listar unidades:", e);
      alert("Não foi possível carregar a lista de unidades agora.");
    }
    unidades = Array.isArray(unidades) ? unidades : [];

    this._unidadesCache = unidades;
    this._lastCallbacks = callbacks;

    const onAdd =
      callbacks.onAdd ||
      (() => this.showUnidadeForm(null, () => this.showUnidadesPage(callbacks)));

    const onEdit =
      callbacks.onEdit ||
      ((idOrObj) => {
        const id = typeof idOrObj === "object" ? idOrObj?.id : idOrObj;
        this.showUnidadeForm(id, () => this.showUnidadesPage(callbacks));
      });

    const onDelete =
      callbacks.onDelete ||
      (async (id) => {
        if (confirm("Deseja realmente remover esta unidade?")) {
          await this.service.removerUnidade(id);
          await this.showUnidadesPage(callbacks);
        }
      });

    const onView = callbacks.onView || ((id) => this.showUnidadeDetalhe(id));

    this.view.renderUnidadesPage(unidades, onAdd, onEdit, onDelete, onView);
  }

  async showUnidadeForm(id, onBack = null) {
    const unidade = id ? await this.service.getUnidadeById(id) : null;

    this.view = this.view || new GestorView();
    this.view.renderUnidadeForm(
      async (unidadeData) => {
        try {
          if (id) {
            await this.service.atualizarUnidade(id, unidadeData);
            alert("Unidade atualizada com sucesso!");
          } else {
            await this.service.adicionarUnidade(unidadeData);
            alert("Unidade criada com sucesso!");
          }
          onBack ? onBack() : navigate("/unidades");
        } catch (err) {
          console.error("Erro ao salvar unidade:", err);
          alert("Falha ao salvar a unidade. Tente novamente.");
        }
      },
      unidade,
      onBack || (() => navigate("/unidades"))
    );
  }

  async editUnidade(id, onBack = null) {
    await this.showUnidadeForm(id, onBack);
  }

  async deleteUnidade(id) {
    if (confirm("Deseja realmente remover esta unidade?")) {
      await this.service.removerUnidade(id);
      await this.showUnidadesPage(this._lastCallbacks || {});
    }
  }

  async showUnidadeDetalhe(id) {
    try {
      const unidade = await this.service.getUnidadeById(id);
      this.view = this.view || new GestorView();
      this.view.renderUnidadeDetalhe(unidade);
    } catch (err) {
      console.error("Erro ao carregar detalhe da unidade:", err);
      alert("Não foi possível abrir o detalhe da unidade.");
    }
  }
}
