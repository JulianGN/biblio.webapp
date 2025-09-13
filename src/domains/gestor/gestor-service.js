// Service do domínio Gestor
// Lógica de negócio relacionada ao gestor
import { Livro, Unidade } from "./gestor-model.js";
import { BaseService } from "../base-service.js";

export class GestorService extends BaseService {
  constructor() {
    super();
  }

  // CRUD de Livros
  async listarLivros() {
    return this.get("gestor/livros/");
  }

  obterObjetoComPropId(nomePropriedade, livroData) {
    return {
      [nomePropriedade]: typeof livroData[nomePropriedade] === "object"
        ? livroData[nomePropriedade].id
        : livroData[nomePropriedade]
    };
  }

  async adicionarLivro(livroData) {
    const obterObjetoId = (nomePropriedade) => this.obterObjetoComPropId(nomePropriedade, livroData);
    const payload = {
      ...livroData,
      ...obterObjetoId("genero"),
      ...obterObjetoId("tipo_obra"),
      unidades: (livroData.unidades || []).map((u) => ({
        ...obterObjetoId("unidade"),
        exemplares: u.exemplares,
      })),
    };
    return this.post("gestor/livros/", payload);
  }

  async getLivroById(id) {
    return this.get(`gestor/livros/${id}/`);
  }

  async atualizarLivro(livroId, livroData) {
    const obterObjetoId = (nomePropriedade) => this.obterObjetoComPropId(nomePropriedade, livroData);
    const payload = {
      ...livroData,
      ...obterObjetoId("genero"),
      ...obterObjetoId("tipo_obra"),
      unidades: (livroData.unidades || []).map((u) => ({
        ...obterObjetoId("unidade"),
        exemplares: u.exemplares,
      })),
    };
    return this.put(`gestor/livros/${livroId}/`, payload);
  }

  async atualizarLivroParcial(livroId, payload) {
    return this.patch(`gestor/livros/${livroId}/`, payload);
  }

  async removerLivro(livroId) {
    const response = await fetch(this.baseUrl + `gestor/livros/${livroId}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Erro ${response.status}`);
    }
    return true;
  }

  // CRUD de Unidades
  async listarUnidades() {
    return this.get("gestor/unidades/");
  }

  adicionarUnidade(unidadeData) {
    const newId =
      this.unidades.length > 0
        ? Math.max(...this.unidades.map((u) => u.id)) + 1
        : 1;
    const unidade = new Unidade({ ...unidadeData, id: newId });
    this.unidades.push(unidade);
    return unidade;
  }

  atualizarUnidade(unidadeId, unidadeData) {
    const index = this.unidades.findIndex((u) => u.id === unidadeId);
    if (index !== -1) {
      this.unidades[index] = {
        ...this.unidades[index],
        ...unidadeData,
        id: unidadeId,
      };
      return this.unidades[index];
    }
    return null;
  }

  removerUnidade(unidadeId) {
    this.unidades = this.unidades.filter((u) => u.id !== unidadeId);
  }

  async getUnidadeById(id) {
    return this.get(`gestor/unidades/${id}/`);
  }

  async atualizarUnidadeApi(unidadeId, unidadeData) {
    const payload = { ...unidadeData };
    return this.put(`gestor/unidades/${unidadeId}/`, payload);
  }

  async removerUnidadeApi(unidadeId) {
    const response = await fetch(
      this.baseUrl + `gestor/unidades/${unidadeId}/`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Erro ${response.status}`);
    }
    return true;
  }

  async adicionarUnidadeApi(unidadeData) {
    const payload = { ...unidadeData };
    return this.post("gestor/unidades/", payload);
  }
}
