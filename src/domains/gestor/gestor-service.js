// 📁 src/controllers/gestor-service.js
// Service do domínio Gestor
// Lógica de negócio relacionada ao gestor

import { Livro, Unidade } from "./gestor-model.js";
import { BaseService } from "../base-service.js";

const normalizeId = (v) => {
  if (v == null) return null;
  if (typeof v === "object" && "id" in v) return Number(v.id);
  return Number(v);
};

const asNumberOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export class GestorService extends BaseService {
  constructor() {
    super();
  }

  // CRUD de Livros
  async listarLivros(filters = {}) {
    let url = "gestor/livros/";
    const queryParams = new URLSearchParams();
    
    if (filters.titulo) queryParams.append('titulo', filters.titulo);
    if (filters.autor) queryParams.append('autor', filters.autor);
    if (filters.tipo_obra) queryParams.append('tipo_obra', filters.tipo_obra);
    if (filters.editora) queryParams.append('editora', filters.editora);
    if (filters.isbn) queryParams.append('isbn', filters.isbn);
    if (filters.unidades) {
      // Suporte tanto para valor único quanto array (para compatibilidade)
      if (Array.isArray(filters.unidades)) {
        queryParams.append('unidades', filters.unidades.join(','));
      } else {
        queryParams.append('unidades', filters.unidades);
      }
    }
    
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }
    
    return this.get(url);
  }

  // Utilitário: normaliza propriedade que pode vir como objeto ou id
  getObjectWithPropId(nomePropriedade, obj) {
    const id = normalizeId(obj?.[nomePropriedade]);
    return { [nomePropriedade]: id };
  }

  // Monta payload seguro para DRF
  buildLivroPayload(livroData = {}) {
    const getObjectId = (prop) => this.getObjectWithPropId(prop, livroData);

    return {
      titulo: (livroData.titulo ?? "").trim(),
      autor: (livroData.autor ?? "").trim(),
      editora: (livroData.editora ?? "").trim(),
      data_publicacao: livroData.data_publicacao || null,
      isbn: (livroData.isbn ?? "").trim(),
      paginas: asNumberOrNull(livroData.paginas),
      capa:
        livroData.capa && String(livroData.capa).toLowerCase() !== "null"
          ? String(livroData.capa).trim()
          : null,
      idioma: (livroData.idioma ?? "").trim(),
      ...getObjectId("genero"),
      ...getObjectId("tipo_obra"),
      unidades: (Array.isArray(livroData.unidades) ? livroData.unidades : []).map((u) => ({
        unidade: normalizeId(u?.unidade),
        exemplares: asNumberOrNull(u?.exemplares) ?? 1,
      })),
    };
  }

  // Cria livro (API)
  async adicionarLivro(livroData) {
    const payload = this.buildLivroPayload(livroData);
    return this.post("gestor/livros/", payload);
  }

  // Busca livro por id (API)
  async getLivroById(id) {
    return this.get(`gestor/livros/${id}/`);
  }

  // Atualiza livro (API)
  async atualizarLivro(livroId, livroData) {
    const payload = this.buildLivroPayload(livroData);
    return this.put(`gestor/livros/${livroId}/`, payload);
  }

  /**
   * Atualização parcial de exemplares/unidades
   * (reenvia o livro completo com novas unidades para compatibilidade DRF)
   */
  async atualizarLivroParcial(livroId, { unidades }) {
    const livroAtual = await this.getLivroById(livroId);

    const payload = {
      titulo: (livroAtual?.titulo ?? "").trim(),
      autor: (livroAtual?.autor ?? "").trim(),
      editora: (livroAtual?.editora ?? "").trim(),
      data_publicacao: livroAtual?.data_publicacao || null,
      isbn: (livroAtual?.isbn ?? "").trim(),
      paginas: asNumberOrNull(livroAtual?.paginas),
      capa:
        livroAtual?.capa && String(livroAtual.capa).toLowerCase() !== "null"
          ? String(livroAtual.capa).trim()
          : null,
      idioma: (livroAtual?.idioma ?? "").trim(),
      genero: normalizeId(livroAtual?.genero),
      tipo_obra: normalizeId(livroAtual?.tipo_obra),
      unidades: (Array.isArray(unidades) ? unidades : []).map((u) => ({
        unidade: normalizeId(u?.unidade),
        exemplares: asNumberOrNull(u?.exemplares) ?? 1,
      })),
    };

    // PUT completo para garantir compatibilidade com o DRF
    return this.put(`gestor/livros/${livroId}/`, payload);
  }

  // Remove livro (API)
  async removerLivro(livroId) {
    return this.delete(`gestor/livros/${livroId}/`);
  }

  /* ============================
   *          UNIDADES
   * ============================ */

  // Lista todas as unidades (API)
  async listarUnidades() {
    return this.get("gestor/unidades/");
  }

  // === Métodos legados (mantidos por compatibilidade) ===
  async adicionarUnidade(unidadeData) {
    return this.adicionarUnidadeApi(unidadeData);
  }

  async atualizarUnidade(unidadeId, unidadeData) {
    return this.atualizarUnidadeApi(unidadeId, unidadeData);
  }

  async removerUnidade(unidadeId) {
    return this.removerUnidadeApi(unidadeId);
  }
  // ------------------------------------------------------

  // Busca unidade por id (API)
  async getUnidadeById(id) {
    return this.get(`gestor/unidades/${id}/`);
  }

  // Atualiza unidade (API)
  async atualizarUnidadeApi(unidadeId, unidadeData) {
    const payload = {
      nome: (unidadeData?.nome ?? "").trim(),
      endereco: (unidadeData?.endereco ?? "").trim(),
      telefone: (unidadeData?.telefone ?? "").trim(),
      email: (unidadeData?.email ?? "").trim(),
      site: (unidadeData?.site ?? "").trim(),
    };
    return this.put(`gestor/unidades/${unidadeId}/`, payload);
  }

  // Remove unidade (API)
  async removerUnidadeApi(unidadeId) {
    return this.delete(`gestor/unidades/${unidadeId}/`);
  }

  // Cria unidade (API)
  async adicionarUnidadeApi(unidadeData) {
    const payload = {
      nome: (unidadeData?.nome ?? "").trim(),
      endereco: (unidadeData?.endereco ?? "").trim(),
      telefone: (unidadeData?.telefone ?? "").trim(),
      email: (unidadeData?.email ?? "").trim(),
      site: (unidadeData?.site ?? "").trim(),
    };
    return this.post(`gestor/unidades/`, payload);
  }
}
