// 📁 src/domains/gestor-models.js
// Modelos do domínio Gestor
// Estrutura de dados para Livro e Unidade (Biblioteca)

export class Livro {
  constructor({
    id = null,
    titulo = "",
    autor = "",
    editora = "",
    data_publicacao = "",
    isbn = "",
    paginas = 0,
    capa = "",
    idioma = "",
    genero = null,
    tipo_obra = null,
    unidades = [], // [{ unidade: { id: 1, nome: "Central" }, exemplares: 5 }]
  } = {}) {
    this.id = Number(id) || null;
    this.titulo = titulo?.trim() || "";
    this.autor = autor?.trim() || "";
    this.editora = editora?.trim() || "";
    this.data_publicacao = data_publicacao || "";
    this.isbn = isbn?.trim() || "";
    this.paginas = Number(paginas) || 0;
    this.capa = capa?.trim() || "";
    this.idioma = idioma?.trim() || "";
    this.genero = genero;
    this.tipo_obra = tipo_obra;
    this.unidades = Array.isArray(unidades) ? unidades : [];
  }

  /** Retorna texto curto para debug/UI */
  toString() {
    return `${this.titulo} — ${this.autor}`;
  }

  /** Retorna lista normalizada de unidades */
  getUnidadesResumo() {
    return (this.unidades || []).map((u) => ({
      unidade: u?.unidade?.nome || `Unidade ${u?.unidade?.id || "?"}`,
      exemplares: Number(u?.exemplares || 0),
    }));
  }
}

export class Unidade {
  constructor({
    id = null,
    nome = "",
    endereco = "",
    telefone = "",
    email = "",
    site = "",
  } = {}) {
    this.id = Number(id) || null;
    this.nome = nome?.trim() || "";
    this.endereco = endereco?.trim() || "";
    this.telefone = telefone?.trim() || "";
    this.email = email?.trim() || "";
    this.site = site?.trim() || "";
  }

  toString() {
    return this.nome || `Unidade ${this.id || ""}`;
  }
}
