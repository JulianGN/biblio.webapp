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

  /* ============================
   *           LIVROS
   * ============================ */

  // Lista todos os livros (API)
  async listarLivros() {
    // sem "/" inicial para manter padrão com gestor/dados-iniciais/
    return this.get("gestor/livros/");
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
