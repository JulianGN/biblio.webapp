// 📁 src/controllers/gestor-controller.js
// Controller do domínio Gestor
// Orquestra as ações entre view e service

import { GestorService } from "./gestor-service.js";
import { GestorView } from "./gestor-view.js";
import { GestorInitService } from "./gestor-init-service.js";
import "../../components/livro/livro-exemplares.js";

// Função de navegação SPA (espera-se que esteja global ou na main.js)
const navigate =
  window.navigate ||
  ((path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  });

/* ──────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────── */
const normalizeId = (v) => {
  if (v == null) return null;
  if (typeof v === "object" && "id" in v) return Number(v.id);
  return Number(v);
};

function ensureInitArrays(obj = {}) {
  return {
    generos: Array.isArray(obj.generos) ? obj.generos : [],
    unidades: Array.isArray(obj.unidades) ? obj.unidades : [],
    tipo_obras: Array.isArray(obj.tipo_obras) ? obj.tipo_obras : [],
  };
}

function mapLivroWithRefs(livro, initData) {
  const { generos, unidades, tipo_obras } = ensureInitArrays(initData);
  const generoId = normalizeId(livro?.genero);
  const tipoObraId = normalizeId(livro?.tipo_obra);

  // Aceita tanto `unidades_detalhe` quanto `unidades`
  const rawUnidades =
    (Array.isArray(livro?.unidades_detalhe) && livro.unidades_detalhe.length
      ? livro.unidades_detalhe
      : Array.isArray(livro?.unidades)
      ? livro.unidades
      : []) || [];

  const unidadesMapeadas = rawUnidades.map((u) => {
    // aceita {unidade: id|obj} ou {unidade_id: id}
    const unidId = normalizeId(u?.unidade ?? u?.unidade_id);
    const unidadeObj =
      unidades.find((uni) => Number(uni.id) === Number(unidId)) ||
      (unidId != null ? { id: unidId, nome: `Unidade ${unidId}` } : { id: null, nome: "—" });

    // aceita `exemplares`, `qtd`, `quantidade`
    const exemplares = Number(u?.exemplares ?? u?.qtd ?? u?.quantidade ?? 0) || 0;

    return { unidade: unidadeObj, exemplares };
  });

  return {
    ...livro,
    // Padroniza: sempre expõe em .unidades (e mantém _detalhe para quem usa)
    unidades: unidadesMapeadas,
    unidades_detalhe: unidadesMapeadas,

    generoObj:
      generos.find((g) => Number(g.id) === Number(generoId)) ||
      (generoId ? { id: generoId, nome: `Gênero ${generoId}` } : null),

    tipo_obraObj:
      tipo_obras.find((t) => Number(t.id) === Number(tipoObraId)) ||
      (tipoObraId ? { id: tipoObraId, nome: `Tipo ${tipoObraId}` } : null),
  };
}

export class GestorController {
  constructor() {
    this.service = new GestorService();
    this.initService = new GestorInitService();
    this.initData = { generos: [], unidades: [], tipo_obras: [] };
    this.view = null;

    // Disponibiliza para componentes/Views que leem do window
    window.gestorController = this;

    // caches leves
    this._livrosCache = null;
    this._unidadesCache = null;
    this._lastCallbacks = null;
  }

  async fetchInitData() {
    try {
      const data = await this.initService.getInitData();
      this.initData = ensureInitArrays(data);
    } catch (err) {
      console.error("Erro ao carregar initData:", err);
      this.initData = ensureInitArrays(this.initData);
      alert("Não foi possível carregar listas iniciais (gêneros/unidades/tipos).");
    }
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

    // Garante initData para montar colunas ricas
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
    livros = (Array.isArray(livros) ? livros : []).map((livro) =>
      mapLivroWithRefs(livro, this.initData)
    );

    this._livrosCache = livros;
    this._lastCallbacks = callbacks;

    // Callbacks padrão — resolvem botões criar/editar quando não vier do roteador
    const onAdd =
      callbacks.onAdd ||
      (() => this.showLivroForm(null, () => this.showLivrosPage(callbacks)));

    // ✅ aceita id ou objeto; busca na API se vier um id
    const onEdit =
      callbacks.onEdit ||
      (async (idOrObj) => {
        try {
          const id = typeof idOrObj === "object" ? Number(idOrObj?.id) : Number(idOrObj);
          if (!id) return alert("ID do livro inválido.");
          const livroApi = await this.service.getLivroById(id);
          const livroPronto = mapLivroWithRefs(livroApi, this.initData);
          await this.showLivroForm(livroPronto, () => this.showLivrosPage(callbacks));
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
      onEditExemplares
    );
  }

  /* ───────────────────────────────
   * LIVROS — FORMULÁRIO PRINCIPAL
   * ─────────────────────────────── */
  async showLivroForm(idOrLivro = null, onBack = null) {
    this.view = this.view || new GestorView();

    if (
      !this.initData.generos.length ||
      !this.initData.unidades.length ||
      !this.initData.tipo_obras.length
    ) {
      await this.fetchInitData();
    }

    // ✅ aceita id ou objeto; busca se necessário
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

    // Ajuste de formato das unidades do livro quando editando
    let livroEdit = livro ? { ...livro } : null;
    if (livroEdit && Array.isArray(livroEdit.unidades)) {
      livroEdit = mapLivroWithRefs(livroEdit, this.initData);
    }

    this.view.renderLivroForm(
      async (form) => {
        // base pode conter id quando em edição
        const livroBase = form._livroSelecionado || {};
        const getValue = (name) =>
          form.querySelector(`[name="${name}"]`)?.value?.trim() || "";
        const getNumber = (name) => {
          const v = getValue(name);
          return v === "" ? null : Number.parseInt(v, 10);
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
          genero: getNumber("genero") ?? normalizeId(livroBase.genero) ?? 0,
          tipo_obra:
            getNumber("tipo_obra") ?? normalizeId(livroBase.tipo_obra) ?? 0,
        };

        // validações simples
        if (!data.titulo || !data.autor) {
          alert("Preencha os campos obrigatórios: título e autor.");
          return;
        }

        // Unidades vindas do componente/lista interna do form
        const unidadesPayload =
          form._livroUnidades && form._livroUnidades.length > 0
            ? form._livroUnidades.map((u) => ({
                unidade: normalizeId(u.unidade),
                exemplares: Number(u.exemplares || 0),
              }))
            : [
                {
                  unidade: this.initData.unidades[0]?.id
                    ? Number(this.initData.unidades[0].id)
                    : 1,
                  exemplares: 1,
                },
              ];

        const livroData = { ...livroBase, ...data, unidades: unidadesPayload };

        try {
          if (livroBase.id) {
            await this.service.atualizarLivro(Number(livroBase.id), livroData);
            alert("Livro atualizado com sucesso!");
          } else {
            await this.service.adicionarLivro(livroData);
            alert("Livro criado com sucesso!");
          }
          onBack ? onBack() : navigate("/livros");
        } catch (err) {
          console.error("Erro ao salvar livro:", err);
          alert("Falha ao salvar o livro. Tente novamente.");
        }
      },
      livroEdit,
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

      // ✅ usa tanto unidades_detalhe quanto unidades
      const rawUnidades =
        (Array.isArray(livro?.unidades_detalhe) && livro.unidades_detalhe.length
          ? livro.unidades_detalhe
          : Array.isArray(livro?.unidades)
          ? livro.unidades
          : []) || [];

      const unidadesSelecionadas = rawUnidades.map((u) => {
        const unidId = normalizeId(u?.unidade ?? u?.unidade_id);
        const unidadeObj =
          unidadesDisponiveis.find((uni) => Number(uni.id) === Number(unidId)) ||
          { id: unidId, nome: `Unidade ${unidId}` };
        const exemplares =
          Number(u?.exemplares ?? u?.qtd ?? u?.quantidade ?? 0) || 0;
        return { unidade: unidadeObj, exemplares };
      });

      el.livroId = Number(id);
      el.livro = mapLivroWithRefs(livro, this.initData);
      el.unidadesDisponiveis = unidadesDisponiveis;
      el.unidadesSelecionadas = unidadesSelecionadas;

      el.onCancelar = () => (onBack ? onBack() : navigate("/livros"));

      el.onSalvar = async (payload) => {
        try {
          // payload.unidades esperado como [{unidade:{id,...} ou id, exemplares:Number}]
          const unidades = (Array.isArray(payload?.unidades) ? payload.unidades : []).map(
            (u) => ({
              unidade: normalizeId(u.unidade),
              exemplares: Number(u.exemplares || 0),
            })
          );

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

  /* ───────────────────────────────
   * UNIDADES — CRUD + UI
   * ─────────────────────────────── */
  async showUnidadesPage(callbacks = {}) {
    this.view = this.view || new GestorView();

    let unidades = await this.service.listarUnidades();
    unidades = Array.isArray(unidades) ? unidades : [];

    this._unidadesCache = unidades;
    this._lastCallbacks = callbacks;

    const onAdd =
      callbacks.onAdd ||
      (() => this.editUnidade(null, () => this.showUnidadesPage(callbacks)));
    const onEdit =
      callbacks.onEdit ||
      ((unidade) =>
        this.editUnidade(unidade?.id, () => this.showUnidadesPage(callbacks)));
    const onDelete =
      callbacks.onDelete ||
      (async (id) => {
        if (confirm("Deseja realmente remover esta unidade?")) {
          await this.service.removerUnidadeApi(id);
          await this.showUnidadesPage(callbacks);
        }
      });
    const onView = callbacks.onView || ((id) => this.showUnidadeDetalhe(id));

    this.view.renderUnidadesPage(unidades, onAdd, onEdit, onDelete, onView);
  }

  async addUnidade(unidadeData) {
    await this.service.adicionarUnidadeApi(unidadeData);
    await this.showUnidadesPage(this._lastCallbacks || {});
  }

  async editUnidade(id, onBack = null) {
    const unidade = id ? await this.service.getUnidadeById(id) : null;

    this.view.renderUnidadeForm(
      async (form) => {
        const unidadeData = {
          nome: form.nome.value?.trim() || "",
          endereco: form.endereco.value?.trim() || "",
          telefone: form.telefone.value?.trim() || "",
          email: form.email.value?.trim() || "",
          site: form.site.value?.trim() || "",
        };

        try {
          if (id) {
            await this.service.atualizarUnidadeApi(id, unidadeData);
            alert("Unidade atualizada com sucesso!");
          } else {
            await this.service.adicionarUnidadeApi(unidadeData);
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

  async deleteUnidade(id) {
    await this.service.removerUnidadeApi(id);
    if (this._unidadesCache) {
      this._unidadesCache = this._unidadesCache.filter((u) => u.id !== id);
      const cbs = this._lastCallbacks || {};
      this.view.renderUnidadesPage(
        this._unidadesCache,
        cbs.onAdd || (() => {}),
        cbs.onEdit || (() => {}),
        cbs.onDelete || (() => {}),
        cbs.onView || (() => {})
      );
    } else {
      await this.showUnidadesPage(this._lastCallbacks || {});
    }
  }

  /* ───────────────────────────────
   * DETALHES DE LIVRO / UNIDADE
   * ─────────────────────────────── */
  async showLivroDetalhe(id) {
    try {
      const livro = await this.service.getLivroById(id);
      if (
        !this.initData.unidades.length ||
        !this.initData.generos.length ||
        !this.initData.tipo_obras.length
      ) {
        await this.fetchInitData();
      }

      const livroPronto = mapLivroWithRefs(livro, this.initData);
      this.view = this.view || new GestorView();
      this.view.renderLivroDetalhe(livroPronto);
    } catch (err) {
      console.error("Erro ao carregar detalhe do livro:", err);
      alert("Não foi possível abrir o detalhe do livro.");
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
