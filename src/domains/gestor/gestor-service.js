// 📁 src/controllers/gestor-service.js
// Service do domínio Gestor
// Lógica de negócio relacionada ao gestor

import { Livro, Unidade } from "./gestor-model.js";
import { BaseService } from "../base-service.js";

export class GestorService extends BaseService {
  constructor() {
    super();
  }

  /* ============================
   *           LIVROS
   * ============================ */

  // Lista todos os livros (API)
  async listarLivros() {
    return this.get("/gestor/livros/");
  }

  // Utilitário: normaliza propriedade que pode vir como objeto ou id
  getObjectWithPropId(nomePropriedade, livroData) {
    return {
      [nomePropriedade]:
        typeof livroData[nomePropriedade] === "object"
          ? livroData[nomePropriedade].id
          : livroData[nomePropriedade],
    };
  }

  // Cria livro (API)
  async adicionarLivro(livroData) {
    const getObjectId = (nomePropriedade) =>
      this.getObjectWithPropId(nomePropriedade, livroData);

    const payload = {
      ...livroData,
      ...getObjectId("genero"),
      ...getObjectId("tipo_obra"),
      unidades: (livroData.unidades || []).map((u) => ({
        ...this.getObjectWithPropId("unidade", u),
        exemplares: u.exemplares,
      })),
    };

    return this.post("/gestor/livros/", payload);
  }

  // Busca livro por id (API)
  async getLivroById(id) {
    return this.get(`/gestor/livros/${id}/`);
  }

  // Atualiza livro (API)
  async atualizarLivro(livroId, livroData) {
    const getObjectId = (nomePropriedade) =>
      this.getObjectWithPropId(nomePropriedade, livroData);

    const payload = {
      ...livroData,
      ...getObjectId("genero"),
      ...getObjectId("tipo_obra"),
      unidades: (livroData.unidades || []).map((u) => ({
        ...this.getObjectWithPropId("unidade", u),
        exemplares: u.exemplares,
      })),
    };

    return this.put(`/gestor/livros/${livroId}/`, payload);
  }

  /**
   * Atualização parcial de exemplares/unidades
   * (reenvia o livro completo com novas unidades)
   */
  async atualizarLivroParcial(livroId, { unidades }) {
    // Busca o livro atual para montar payload completo
    const livroAtual = await this.getLivroById(livroId);

    const payload = {
      titulo: livroAtual.titulo || "",
      autor: livroAtual.autor || "",
      editora: livroAtual.editora || "",
      data_publicacao: livroAtual.data_publicacao || null,
      isbn: livroAtual.isbn || "",
      paginas: livroAtual.paginas ?? null,
      capa:
        livroAtual.capa && livroAtual.capa !== "null"
          ? livroAtual.capa
          : null,
      idioma: livroAtual.idioma || "",
      genero:
        typeof livroAtual.genero === "object"
          ? livroAtual.genero.id
          : livroAtual.genero,
      tipo_obra:
        typeof livroAtual.tipo_obra === "object"
          ? livroAtual.tipo_obra.id
          : livroAtual.tipo_obra,
      unidades: (unidades || []).map((u) => ({
        unidade:
          typeof u.unidade === "object" ? u.unidade.id : Number(u.unidade),
        exemplares: Number(u.exemplares) || 1,
      })),
    };

    // PUT completo para garantir compatibilidade com o DRF
    return this.put(`/gestor/livros/${livroId}/`, payload);
  }

  // Remove livro (API)
  async removerLivro(livroId) {
    return this.delete(`/gestor/livros/${livroId}/`);
  }

  /* ============================
   *          UNIDADES
   * ============================ */

  // Lista todas as unidades (API)
  async listarUnidades() {
    return this.get("/gestor/unidades/");
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
    return this.get(`/gestor/unidades/${id}/`);
  }

  // Atualiza unidade (API)
  async atualizarUnidadeApi(unidadeId, unidadeData) {
    const payload = { ...unidadeData };
    return this.put(`/gestor/unidades/${unidadeId}/`, payload);
  }

  // Remove unidade (API)
  async removerUnidadeApi(unidadeId) {
    return this.delete(`/gestor/unidades/${unidadeId}/`);
  }

  // Cria unidade (API)
  async adicionarUnidadeApi(unidadeData) {
    const payload = { ...unidadeData };
    return this.post(`/gestor/unidades/`, payload);
  }
}
