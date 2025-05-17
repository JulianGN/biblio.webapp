// Service do domínio Gestor
// Lógica de negócio relacionada ao gestor
import { Livro, Unidade } from "./gestor-model.js";

export class GestorService {
  constructor() {
    this.livros = [
      {
        id: 1,
        titulo: "O Senhor dos Anéis",
        autor: "J.R.R. Tolkien",
        editora: "HarperCollins",
        data_publicacao: "1954-07-29",
        isbn: "978-0618260274",
        paginas: 1216,
        capa: "",
        idioma: "Inglês",
        genero: 1,
        unidades: [{ unidade: 1, exemplares: 5 }],
      },
      {
        id: 2,
        titulo: "Dom Quixote",
        autor: "Miguel de Cervantes",
        editora: "Penguin Classics",
        data_publicacao: "1605-01-16",
        isbn: "978-0142437230",
        paginas: 1056,
        capa: "",
        idioma: "Espanhol",
        genero: 2,
        unidades: [{ unidade: 2, exemplares: 3 }],
      },
    ];
    this.unidades = [
      {
        id: 1,
        nome: "Biblioteca Central",
        endereco: "Rua Principal, 123",
        telefone: "1111-1111",
        email: "central@example.com",
        site: "http://central.example.com",
      },
      {
        id: 2,
        nome: "Biblioteca Municipal",
        endereco: "Avenida Secundária, 456",
        telefone: "2222-2222",
        email: "municipal@example.com",
        site: "http://municipal.example.com",
      },
    ];
  }

  // CRUD de Livros
  listarLivros() {
    return this.livros;
  }

  adicionarLivro(livroData) {
    const newId =
      this.livros.length > 0
        ? Math.max(...this.livros.map((l) => l.id)) + 1
        : 1;
    const livro = new Livro({ ...livroData, id: newId });
    this.livros.push(livro);
    return livro;
  }

  atualizarLivro(livroId, livroData) {
    const index = this.livros.findIndex((l) => l.id === livroId);
    if (index !== -1) {
      this.livros[index] = { ...this.livros[index], ...livroData, id: livroId };
      return this.livros[index];
    }
    return null;
  }

  removerLivro(livroId) {
    this.livros = this.livros.filter((l) => l.id !== livroId);
  }

  // CRUD de Unidades
  listarUnidades() {
    return this.unidades;
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

  // Outros métodos de negócio podem ser adicionados aqui
}
