// 📁 src/controllers/gestor-controller.js
// Controller do domínio Gestor
// Orquestra as ações entre view e service

import { GestorService } from "./gestor-service.js";
import { GestorView } from "./gestor-view.js";
import { GestorInitService } from "./gestor-init-service.js";
import "../components/livro/livro-exemplares.js";

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
    this.initData = { generos: [], unidades: [], tipo_obras: [] };
  }

  async fetchInitData() {
    this.initData = await this.initService.getInitData();
  }

  /* ───────────────────────────────
   * LIVROS — CRUD BÁSICO
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
   * LIVROS — VISUAL / UI
   * ─────────────────────────────── */
  async showLivrosPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    let livros = await this.service.listarLivros();

    livros = livros.map((livro) => ({
      ...livro,
      unidades: (livro.unidades || []).map((u) => ({
        unidade:
          this.initData.unidades.find((uni) => uni.id === u.unidade) || {
            id: u.unidade,
            nome: `Unidade ${u.unidade}`,
          },
        exemplares: u.exemplares,
      })),
      generoObj:
        this.initData.generos.find(
          (g) => g.id === (livro.genero?.id || livro.genero)
        ) || { id: livro.genero, nome: `Gênero ${livro.genero}` },
      tipo_obraObj:
        this.initData.tipo_obras.find(
          (t) => t.id === (livro.tipo_obra?.id || livro.tipo_obra)
        ) || { id: livro.tipo_obra, nome: `Tipo ${livro.tipo_obra}` },
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

  /* ───────────────────────────────
   * LIVROS — FORMULÁRIO PRINCIPAL
   * ─────────────────────────────── */
  async showLivroForm(livro = null, onBack = null) {
    this.view = this.view || new GestorView();

    if (
      !this.initData.generos.length ||
      !this.initData.unidades.length ||
      !this.initData.tipo_obras.length
    ) {
      await this.fetchInitData();
    }

    // Ajuste de formato das unidades
    if (livro && Array.isArray(livro.unidades)) {
      livro.unidades = livro.unidades.map((u) => ({
        unidade:
          this.initData.unidades.find(
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
        const livroBase = form._livroSelecionado || {};
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
          tipo_obra: getNumber("tipo_obra") ?? livroBase.tipo_obra ?? 0,
        };

        // validações simples
        if (!data.titulo || !data.autor) {
          alert("Preencha os campos obrigatórios: título e autor.");
          return;
        }

        const unidades =
          form._livroUnidades && form._livroUnidades.length > 0
            ? form._livroUnidades.map((u) => ({
                unidade: u.unidade.id,
                exemplares: u.exemplares,
              }))
            : [{ unidade: this.initData.unidades[0]?.id || 1, exemplares: 1 }];

        const livroData = { ...livroBase, ...data, unidades };

        if (livroBase.id) {
          await this.service.atualizarLivro(livroBase.id, livroData);
        } else {
          await this.service.adicionarLivro(livroData);
        }

        onBack ? onBack() : navigate("/livros");
      },
      livro,
      onBack || (() => navigate("/livros")),
      this.initData.generos,
      this.initData.unidades,
      this.initData.tipo_obras
    );
  }

  /* ───────────────────────────────
   * LIVROS — FORM DE EXEMPLARES
   * ─────────────────────────────── */
  async showLivroExemplaresForm(id, onBack = null) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = `<livro-exemplares-page></livro-exemplares-page>`;
    const el = root.querySelector("livro-exemplares-page");

    try {
      const livro = await this.service.getLivroById(id);
      if (!this.initData.unidades.length) await this.fetchInitData();

      const unidadesDisponiveis = this.initData.unidades;
      const unidadesSelecionadas = (livro.unidades || []).map((u) => ({
        unidade:
          unidadesDisponiveis.find(
            (uni) => uni.id === (u.unidade.id || u.unidade)
          ) || {
            id: u.unidade.id || u.unidade,
            nome: `Unidade ${u.unidade.id || u.unidade}`,
          },
        exemplares: u.exemplares,
      }));

      el.livroId = id;
      el.livro = livro;
      el.unidadesDisponiveis = unidadesDisponiveis;
      el.unidadesSelecionadas = unidadesSelecionadas;

      el.onCancelar = () => (onBack ? onBack() : navigate("/livros"));

      el.onSalvar = async (payload) => {
        try {
          await this.service.atualizarLivroParcial(id, {
            unidades: payload.unidades,
          });
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

  /* ───────────────────────────────
   * UNIDADES — CRUD + UI
   * ─────────────────────────────── */
  async showUnidadesPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    let unidades = await this.service.listarUnidades();
    unidades = Array.isArray(unidades) ? unidades : [];
    this._unidadesCache = unidades;
    this._lastCallbacks = callbacks;

    this.view.renderUnidadesPage(
      unidades,
      callbacks.onAdd || (() => {}),
      callbacks.onEdit || (() => {}),
      callbacks.onDelete || (() => {}),
      callbacks.onView || (() => {})
    );
  }

  async addUnidade(unidadeData) {
    await this.service.adicionarUnidadeApi(unidadeData);
    await this.showUnidadesPage(this._lastCallbacks);
  }

  async editUnidade(id, onBack = null) {
    const unidade = await this.service.getUnidadeById(id);
    this.view.renderUnidadeForm(
      async (form) => {
        const unidadeData = {
          nome: form.nome.value,
          endereco: form.endereco.value,
          telefone: form.telefone.value,
          email: form.email.value,
          site: form.site.value,
        };
        await this.service.atualizarUnidadeApi(id, unidadeData);
        onBack ? onBack() : navigate("/unidades");
      },
      unidade,
      onBack || (() => navigate("/unidades"))
    );
  }

  async deleteUnidade(id) {
    await this.service.removerUnidadeApi(id);
    if (this._unidadesCache) {
      this._unidadesCache = this._unidadesCache.filter((u) => u.id !== id);
      this.view.renderUnidadesPage(
        this._unidadesCache,
        this._lastCallbacks?.onAdd,
        this._lastCallbacks?.onEdit,
        this._lastCallbacks?.onDelete,
        this._lastCallbacks?.onView
      );
    } else {
      this.showUnidadesPage(this._lastCallbacks);
    }
  }

  /* ───────────────────────────────
   * DETALHES DE LIVRO / UNIDADE
   * ─────────────────────────────── */
  async showLivroDetalhe(id) {
    const livro = await this.service.getLivroById(id);
    if (
      !this.initData.unidades.length ||
      !this.initData.generos.length
    ) {
      await this.fetchInitData();
    }

    livro.unidades = (livro.unidades || []).map((u) => ({
      unidade:
        this.initData.unidades.find(
          (uni) => uni.id === (u.unidade.id || u.unidade)
        ) || {
          id: u.unidade.id || u.unidade,
          nome: `Unidade ${u.unidade.id || u.unidade}`,
        },
      exemplares: u.exemplares,
    }));

    livro.generoObj =
      this.initData.generos.find(
        (g) => g.id === (livro.genero?.id || livro.genero)
      ) || { id: livro.genero, nome: `Gênero ${livro.genero}` };

    livro.tipo_obraObj =
      this.initData.tipo_obras.find(
        (t) => t.id === (livro.tipo_obra?.id || livro.tipo_obra)
      ) || { id: livro.tipo_obra, nome: `Tipo ${livro.tipo_obra}` };

    this.view.renderLivroDetalhe(livro);
  }

  async showUnidadeDetalhe(id) {
    const unidade = await this.service.getUnidadeById(id);
    this.view.renderUnidadeDetalhe(unidade);
  }
}
