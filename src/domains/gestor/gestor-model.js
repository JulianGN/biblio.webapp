// Modelos do domínio Gestor
// Estrutura de dados para Livro e Unidade (Biblioteca)

export class Livro {
  constructor({
    id,
    titulo,
    autor,
    editora,
    data_publicacao,
    isbn,
    paginas,
    capa,
    idioma,
    genero,
    unidades = [], // [{ unidade: { id: 1, nome: Teste }, exemplares: 5 }],
  }) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.editora = editora;
    this.data_publicacao = data_publicacao;
    this.isbn = isbn;
    this.paginas = paginas;
    this.capa = capa;
    this.idioma = idioma;
    this.genero = genero;
    this.unidades = unidades;
  }
}

export class Unidade {
  constructor({ id, nome, endereco, telefone, email, site }) {
    this.id = id;
    this.nome = nome;
    this.endereco = endereco;
    this.telefone = telefone;
    this.email = email;
    this.site = site;
  }
}
