import "./app-header.css";

// Web Component para o header compartilhado
class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /* html */ `
      <header id="main-header" class="header">
        <img src="/assets/imgs/logotipo.png" alt="Logo Bibliotecas Conectadas" class="logo" id="logo-bibliotecas" />
        <nav role="group">
            <a href="#" id="nav-livros-btn" role="button">Livros</a>
            <a href="#" id="nav-unidades-btn" role="button">Unidades</a>
        </nav>
      </header>
    `;
    this.querySelector("#nav-livros-btn").onclick = (e) => {
      e.preventDefault();
      window.navigate && window.navigate("/livros");
    };
    this.querySelector("#nav-unidades-btn").onclick = (e) => {
      e.preventDefault();
      window.navigate && window.navigate("/unidades");
    };
    this.querySelector("#logo-bibliotecas").onclick = (e) => {
      e.preventDefault();
      window.navigate && window.navigate("/livros");
    };
  }
}
customElements.define("app-header", AppHeader);
