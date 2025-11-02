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

  // Patch parcial de livro (API)
  async atualizarLivroParcial(livroId, payload) {
    return this.patch(`/gestor/livros/${livroId}/`, payload);
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

  // === Métodos legados (agora redirecionam para a API) ===
  // Mantidos para não quebrar chamadas existentes e evitar duplicação via estado local

  // Cria unidade (API)
  async adicionarUnidade(unidadeData) {
    // Antes criava id local e fazia push no array (causava duplicação visual)
    // Agora faz POST real
    return this.adicionarUnidadeApi(unidadeData);
  }

  // Atualiza unidade (API)
  async atualizarUnidade(unidadeId, unidadeData) {
    // Antes mutava array local; agora faz PUT real
    return this.atualizarUnidadeApi(unidadeId, unidadeData);
  }

  // Remove unidade (API)
  async removerUnidade(unidadeId) {
    // Antes filtrava array local; agora faz DELETE real
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
