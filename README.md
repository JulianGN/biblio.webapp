# Bibliotecas Conectadas

Este projeto implementa um sistema de gerenciamento de biblioteca com funcionalidades de CRUD (Criar, Ler, Editar, Excluir) para Livros e Bibliotecas (Unidades). Foi desenvolvido utilizando HTML, CSS, JavaScript vanilla, Web Components e Vite.

## Funcionalidades

O sistema permite:

- **Gerenciamento de Bibliotecas:**
  - Listar todas as bibliotecas cadastradas.
  - Adicionar novas bibliotecas com informações como nome, endereço, telefone, e-mail e site.
  - Editar informações de bibliotecas existentes.
  - Excluir bibliotecas.
- **Gerenciamento de Livros:**
  - Listar todos os livros cadastrados.
  - Adicionar novos livros com informações como título, autor, editora, data de publicação, ISBN, número de páginas, URL da capa, idioma e gênero.
  - Editar informações de livros existentes.
  - Excluir livros.

## Estrutura do Projeto

O projeto está estruturado da seguinte forma:

```
biblioteca-crud/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── biblioteca/
│   │   │   ├── biblioteca-form.js  # Web Component do formulário de biblioteca
│   │   │   └── biblioteca-list.js  # Web Component da lista de bibliotecas
│   │   └── livro/
│   │       ├── livro-form.js       # Web Component do formulário de livro
│   │       └── livro-list.js       # Web Component da lista de livros
│   ├── css/
│   │   └── style.css             # Arquivo CSS principal (vazio por padrão no Vite vanilla)
│   ├── main.js                   # Ponto de entrada principal da aplicação
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

- **`public/`**: Contém arquivos estáticos que são servidos diretamente.
- **`src/`**: Contém o código fonte da aplicação.
  - **`components/`**: Contém os Web Components reutilizáveis.
    - **`biblioteca/`**: Componentes relacionados ao CRUD de bibliotecas.
    - **`livro/`**: Componentes relacionados ao CRUD de livros.
  - **`css/`**: Contém os arquivos de estilo (atualmente, os estilos principais estão em `main.js` para simplificação).
  - **`main.js`**: Arquivo principal que inicializa a aplicação, importa os componentes e gerencia a lógica dos CRUDs e dados mockados.
- **`index.html`**: Arquivo HTML principal da aplicação.
- **`package.json`**: Define as dependências e scripts do projeto.
- **`vite.config.js`**: Arquivo de configuração do Vite.

## Como Executar o Projeto Localmente

Para executar o projeto em seu ambiente local, siga os passos abaixo:

1.  **Clone o repositório (ou descompacte os arquivos do projeto em uma pasta).**

2.  **Instale as dependências:**
    Navegue até o diretório raiz do projeto (`biblioteca-crud`) pelo terminal e execute o comando:

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    Após a instalação das dependências, execute o comando:
    ```bash
    npm run dev
    ```
    Este comando iniciará o servidor de desenvolvimento do Vite. A aplicação estará acessível em `http://localhost:5173` (ou outra porta, caso a 5173 esteja em uso).

## Tecnologias Utilizadas

- **HTML5**
- **CSS3** (estilos básicos inline no `main.js` e placeholders nos componentes)
- **JavaScript (ES6+)** (vanilla)
- **Web Components** (para criar componentes de UI reutilizáveis para formulários e listas)
- **Vite** (como ferramenta de build e servidor de desenvolvimento rápido)

## Validações

Foram implementadas validações simples nos formulários:

- **Bibliotecas:**
  - Nome: Obrigatório.
  - Endereço: Obrigatório.
  - Email: Deve ser um formato de e-mail válido (se preenchido).
- **Livros:**
  - Título: Obrigatório.
  - Autor: Obrigatório.
  - Páginas: Deve ser um número positivo (se preenchido).
  - Gênero (ID): Deve ser um número não negativo (se preenchido).

## Próximos Passos (Sugestões)

- Implementar persistência de dados (ex: `localStorage`, API backend).
- Melhorar a interface do usuário e a estilização.
- Adicionar um componente dedicado para o campo "unidades" do livro.
- Implementar paginação para as listas.
- Adicionar funcionalidades de busca e filtro.
- Refatorar os estilos para arquivos CSS dedicados.
