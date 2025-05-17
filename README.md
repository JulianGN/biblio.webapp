# Bibliotecas Conectadas

Este projeto implementa um sistema de gerenciamento de unidades (bibliotecas) e livros, com funcionalidades de CRUD (Criar, Ler, Editar, Excluir) para ambos. Desenvolvido utilizando HTML, CSS, JavaScript vanilla, Web Components e Vite.

## Funcionalidades

O sistema permite:

- **Gerenciamento de Unidades (Bibliotecas):**
  - Listar todas as unidades cadastradas.
  - Adicionar novas unidades com informações como nome, endereço, telefone, e-mail e site.
  - Editar informações de unidades existentes.
  - Excluir unidades.
- **Gerenciamento de Livros:**
  - Listar todos os livros cadastrados.
  - Adicionar novos livros com informações como título, autor, editora, data de publicação, ISBN, número de páginas, URL da capa, idioma e gênero.
  - Editar informações de livros existentes.
  - Excluir livros.

## Estrutura do Projeto

```
bibliotecas-conectadas/
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── imgs/
│           ├── icone.png
│           ├── logo.png
│           └── logotipo.png
├── src/
│   ├── components/
│   │   ├── app-header.js
│   │   ├── app-header.css
│   │   ├── livro/
│   │   │   ├── livro-form.js
│   │   │   ├── livro-form.css
│   │   │   └── livro-list.js
│   │   └── unidade/
│   │       ├── unidade-form.js
│   │       ├── unidade-form.css
│   │       ├── unidade-list.js
│   │       └── unidade-list.css
│   ├── css/
│   │   ├── pico.min.css
│   │   └── style.css
│   ├── domains/
│   │   ├── gestor/
│   │   │   ├── gestor-controller.js
│   │   │   ├── gestor-model.js
│   │   │   ├── gestor-service.js
│   │   │   └── gestor-view.js
│   │   └── auth/
│   │       ├── auth-controller.js
│   │       └── auth-view.js
│   └── main.js
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

- **`public/`**: Arquivos estáticos e imagens.
- **`src/components/`**: Web Components reutilizáveis para livros, unidades e header.
- **`src/domains/gestor/`**: Lógica de negócio, models, controllers e views para livros e unidades.
- **`src/domains/auth/`**: Autenticação.
- **`src/css/`**: Estilos globais e tema customizado.
- **`src/main.js`**: Ponto de entrada principal da aplicação.

## Observações

- Todos os arquivos relacionados a "biblioteca" foram migrados para "unidade".
- Utilize as rotas /livros e /unidades para acessar as funcionalidades principais.
