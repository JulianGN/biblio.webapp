import "./css/style.css";
import "./components/biblioteca/biblioteca-form.js";
import "./components/biblioteca/biblioteca-list.js";
import "./components/livro/livro-form.js";
import "./components/livro/livro-list.js";

document.querySelector("#app").innerHTML = `
  <div>
    <h1>Bibliotecas Conectadas</h1>
    <div class="container">
      <div class="form-container">
        <h2>Bibliotecas</h2>
        <biblioteca-form></biblioteca-form>
        <biblioteca-list></biblioteca-list>
      </div>
      <div class="form-container">
        <h2>Livros</h2>
        <livro-form></livro-form>
        <livro-list></livro-list>
      </div>
    </div>
  </div>
`;

// Mock data for libraries
let bibliotecas = [
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

// Mock data for books
let livros = [
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

const bibliotecaListComponent = document.querySelector("biblioteca-list");
const bibliotecaFormComponent = document.querySelector("biblioteca-form");
const livroListComponent = document.querySelector("livro-list");
const livroFormComponent = document.querySelector("livro-form");

// --- Validation Helper --- //
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function clearFormErrors(form) {
  form.querySelectorAll(".error-message").forEach((el) => el.remove());
  form
    .querySelectorAll("input.invalid")
    .forEach((el) => el.classList.remove("invalid"));
}

function displayFieldError(inputElement, message) {
  inputElement.classList.add("invalid");
  const errorElement = document.createElement("p");
  errorElement.classList.add("error-message");
  errorElement.style.color = "red";
  errorElement.style.fontSize = "0.9em";
  errorElement.textContent = message;
  inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
}

// --- Bibliotecas CRUD --- //
function renderBibliotecas() {
  if (bibliotecaListComponent) {
    bibliotecaListComponent.render(bibliotecas);
    addEventListenersToBibliotecaButtons();
  }
}

function addEventListenersToBibliotecaButtons() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.removeEventListener("click", handleEditBiblioteca);
    button.addEventListener("click", handleEditBiblioteca);
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.removeEventListener("click", handleDeleteBiblioteca);
    button.addEventListener("click", handleDeleteBiblioteca);
  });
}

function handleEditBiblioteca(event) {
  const bibliotecaId = parseInt(event.target.dataset.id);
  const biblioteca = bibliotecas.find((b) => b.id === bibliotecaId);
  if (biblioteca && bibliotecaFormComponent) {
    const form = bibliotecaFormComponent.querySelector("#bibliotecaForm");
    clearFormErrors(form);
    form.nome.value = biblioteca.nome;
    form.endereco.value = biblioteca.endereco;
    form.telefone.value = biblioteca.telefone || "";
    form.email.value = biblioteca.email || "";
    form.site.value = biblioteca.site || "";
    if (!form.querySelector("#bibliotecaId")) {
      const hiddenIdInput = document.createElement("input");
      hiddenIdInput.type = "hidden";
      hiddenIdInput.id = "bibliotecaId";
      form.appendChild(hiddenIdInput);
    }
    form.querySelector("#bibliotecaId").value = biblioteca.id;
    form.querySelector('button[type="submit"]').textContent = "Atualizar";
  }
}

function handleDeleteBiblioteca(event) {
  const bibliotecaId = parseInt(event.target.dataset.id);
  bibliotecas = bibliotecas.filter((b) => b.id !== bibliotecaId);
  renderBibliotecas();
}

if (bibliotecaFormComponent) {
  const form = bibliotecaFormComponent.querySelector("#bibliotecaForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormErrors(form);
    let isValid = true;

    const formData = new FormData(form);
    const nome = formData.get("nome");
    const endereco = formData.get("endereco");
    const telefone = formData.get("telefone");
    const email = formData.get("email");
    const site = formData.get("site");

    if (!nome) {
      displayFieldError(form.nome, "Nome é obrigatório.");
      isValid = false;
    }
    if (!endereco) {
      displayFieldError(form.endereco, "Endereço é obrigatório.");
      isValid = false;
    }
    if (email && !validateEmail(email)) {
      displayFieldError(form.email, "Formato de e-mail inválido.");
      isValid = false;
    }

    if (!isValid) return;

    const bibliotecaIdInput = form.querySelector("#bibliotecaId");
    const bibliotecaId = bibliotecaIdInput
      ? parseInt(bibliotecaIdInput.value)
      : null;

    if (bibliotecaId) {
      const index = bibliotecas.findIndex((b) => b.id === bibliotecaId);
      if (index !== -1) {
        bibliotecas[index] = {
          id: bibliotecaId,
          nome,
          endereco,
          telefone,
          email,
          site,
        };
      }
      if (bibliotecaIdInput) bibliotecaIdInput.remove();
      form.querySelector('button[type="submit"]').textContent = "Salvar";
    } else {
      const newId =
        bibliotecas.length > 0
          ? Math.max(...bibliotecas.map((b) => b.id)) + 1
          : 1;
      bibliotecas.push({ id: newId, nome, endereco, telefone, email, site });
    }
    form.reset();
    renderBibliotecas();
  });
}

// --- Livros CRUD --- //
function renderLivros() {
  if (livroListComponent) {
    livroListComponent.render(livros);
    addEventListenersToLivroButtons();
  }
}

function addEventListenersToLivroButtons() {
  document.querySelectorAll(".edit-livro-btn").forEach((button) => {
    button.removeEventListener("click", handleEditLivro);
    button.addEventListener("click", handleEditLivro);
  });

  document.querySelectorAll(".delete-livro-btn").forEach((button) => {
    button.removeEventListener("click", handleDeleteLivro);
    button.addEventListener("click", handleDeleteLivro);
  });
}

function handleEditLivro(event) {
  const livroId = parseInt(event.target.dataset.id);
  const livro = livros.find((l) => l.id === livroId);
  if (livro && livroFormComponent) {
    const form = livroFormComponent.querySelector("#livroForm");
    clearFormErrors(form);
    form.titulo.value = livro.titulo;
    form.autor.value = livro.autor;
    form.editora.value = livro.editora || "";
    form.data_publicacao.value = livro.data_publicacao || "";
    form.isbn.value = livro.isbn || "";
    form.paginas.value = livro.paginas || "";
    form.capa.value = livro.capa || "";
    form.idioma.value = livro.idioma || "";
    form.genero.value = livro.genero || "";

    if (!form.querySelector("#livroId")) {
      const hiddenIdInput = document.createElement("input");
      hiddenIdInput.type = "hidden";
      hiddenIdInput.id = "livroId";
      form.appendChild(hiddenIdInput);
    }
    form.querySelector("#livroId").value = livro.id;
    form.querySelector('button[type="submit"]').textContent = "Atualizar Livro";
  }
}

function handleDeleteLivro(event) {
  const livroId = parseInt(event.target.dataset.id);
  livros = livros.filter((l) => l.id !== livroId);
  renderLivros();
}

if (livroFormComponent) {
  const form = livroFormComponent.querySelector("#livroForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormErrors(form);
    let isValid = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.titulo) {
      displayFieldError(form.titulo, "Título é obrigatório.");
      isValid = false;
    }
    if (!data.autor) {
      displayFieldError(form.autor, "Autor é obrigatório.");
      isValid = false;
    }
    if (
      data.paginas &&
      (isNaN(parseInt(data.paginas)) || parseInt(data.paginas) <= 0)
    ) {
      displayFieldError(
        form.paginas,
        "Número de páginas deve ser um número positivo."
      );
      isValid = false;
    }
    if (
      data.genero &&
      (isNaN(parseInt(data.genero)) || parseInt(data.genero) < 0)
    ) {
      // Gênero ID pode ser 0
      displayFieldError(
        form.genero,
        "Gênero (ID) deve ser um número não negativo."
      );
      isValid = false;
    }

    if (!isValid) return;

    const livroIdInput = form.querySelector("#livroId");
    const livroId = livroIdInput ? parseInt(livroIdInput.value) : null;
    const unidades = [{ unidade: 0, exemplares: 1 }];

    const livroData = {
      titulo: data.titulo,
      autor: data.autor,
      editora: data.editora,
      data_publicacao: data.data_publicacao,
      isbn: data.isbn,
      paginas: parseInt(data.paginas) || 0,
      capa: data.capa,
      idioma: data.idioma,
      genero: parseInt(data.genero) || 0,
      unidades: unidades,
    };

    if (livroId) {
      const index = livros.findIndex((l) => l.id === livroId);
      if (index !== -1) {
        livros[index] = { ...livros[index], ...livroData, id: livroId };
      }
      if (livroIdInput) livroIdInput.remove();
      form.querySelector('button[type="submit"]').textContent = "Salvar Livro";
    } else {
      const newId =
        livros.length > 0 ? Math.max(...livros.map((l) => l.id)) + 1 : 1;
      livros.push({ ...livroData, id: newId });
    }
    form.reset();
    renderLivros();
  });
}

// Renderizar as listas iniciais
renderBibliotecas();
renderLivros();

// Adicionar estilos básicos e de validação
const style = document.createElement("style");
style.textContent = `
    body {
        font-family: sans-serif;
        margin: 20px;
        background-color: #f4f4f4;
    }
    h1, h2 {
        color: #333;
    }
    .container {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
    }
    .form-container, .list-container {
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        flex: 1;
        min-width: 300px;
    }
    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    input[type="text"],
    input[type="email"],
    input[type="url"],
    input[type="date"],
    input[type="number"] {
        width: calc(100% - 22px);
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    input.invalid {
        border-color: red;
    }
    .error-message {
        color: red;
        font-size: 0.9em;
        margin-top: -5px;
        margin-bottom: 10px;
    }
    button {
        background-color: #007bff;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
    }
    button:hover {
        background-color: #0056b3;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f0f0f0;
    }
    .edit-btn, .delete-btn, .edit-livro-btn, .delete-livro-btn {
        margin-right: 5px;
        padding: 5px 8px;
        font-size: 0.9em;
    }
    .delete-btn, .delete-livro-btn {
        background-color: #dc3545;
    }
    .delete-btn:hover, .delete-livro-btn:hover {
        background-color: #c82333;
    }
`;
document.head.appendChild(style);
