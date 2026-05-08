import "./emprestimo-form.css";
import "./livro-autocomplete.js";
import { validateEmprestimoFormData } from "../../utils/form-validation.js";

class EmprestimoForm extends HTMLElement {
  connectedCallback() {
    const isEdit = this.hasAttribute("edit");
    this.innerHTML = /* html */ `
      <section class="form-container">
        <form id="emprestimo-form">
          <page-header title="${isEdit ? "Editar Empréstimo" : "Novo Empréstimo"}" back-button-id="voltar-emprestimo-btn"></page-header>

          <livro-autocomplete id="livro-autocomplete"></livro-autocomplete>

          <div>
            <label for="unidade">Unidade:</label>
            <select id="unidade" name="unidade" required></select>
          </div>

          <div>
            <label for="usuario">Usuário:</label>
            <select id="usuario" name="usuario" required></select>
          </div>

          <div>
            <label for="data_emprestimo">Data de Empréstimo:</label>
            <input type="date" id="data_emprestimo" name="data_emprestimo" required />
          </div>

          <div>
            <label for="data_prevista_devolucao">Data Prevista de Devolução:</label>
            <input type="date" id="data_prevista_devolucao" name="data_prevista_devolucao" />
          </div>

          <div>
            <label for="status">Status:</label>
            <select id="status" name="status" required>
              <option value="aberto">Aberto</option>
              <option value="devolvido">Devolvido</option>
            </select>
          </div>

          <div>
            <label for="data_devolucao">Data de Devolução:</label>
            <input type="date" id="data_devolucao" name="data_devolucao" />
          </div>

          <div>
            <label for="observacoes">Observações:</label>
            <textarea id="observacoes" name="observacoes" rows="4" maxlength="1000"></textarea>
          </div>

          <small id="emprestimo-form-feedback" class="app-inline-feedback" aria-live="polite"></small>

          <div class="emprestimo-form-footer">
            <button type="button" id="cancelar-emprestimo-btn" class="outline">Cancelar</button>
            <button type="submit">Salvar Empréstimo</button>
          </div>
        </form>
      </section>
    `;

    this._bindEvents();
    this._syncOptions();
    this._syncFormData();
  }

  set livros(value) {
    this._livros = Array.isArray(value) ? value : [];
    this._syncOptions();
    this._syncFormData();
  }

  set usuarios(value) {
    this._usuarios = Array.isArray(value) ? value : [];
    this._syncOptions();
    this._syncFormData();
  }

  set unidades(value) {
    this._unidades = Array.isArray(value) ? value : [];
    this._syncOptions();
    this._syncFormData();
  }

  set emprestimo(value) {
    this._emprestimo = value;
    this._syncFormData();
  }

  set formOptions(value) {
    this._formOptions = value && typeof value === "object" ? value : {};
    this._didApplyLivroPrefill = false;
    this._syncFormData();
  }

  set onSubmit(value) {
    this._onSubmit = value;
  }

  set onBack(value) {
    this._onBack = value;
  }

  _syncOptions() {
    const livroAutocomplete = this.querySelector("livro-autocomplete");
    const unidadeSelect = this.querySelector("#unidade");
    const usuarioSelect = this.querySelector("#usuario");
    if (!livroAutocomplete || !usuarioSelect || !unidadeSelect) return;

    const livros = Array.isArray(this._livros) ? this._livros : [];
    const usuarios = Array.isArray(this._usuarios) ? this._usuarios : [];
    const unidades = Array.isArray(this._unidades) ? this._unidades : [];

    livroAutocomplete.livros = livros;

    usuarioSelect.innerHTML = `
      <option value="">Selecione um usuário</option>
      ${usuarios.map((usuario) => `<option value="${usuario.id}">${usuario.nome}</option>`).join("")}
    `;

    const selectedLivroId = Number(livroAutocomplete.value || 0);
    const livroSelecionado = livros.find((l) => Number(l.id) === selectedLivroId);
    const unidadesDetalhe = Array.isArray(livroSelecionado?.unidades_detalhe)
      ? livroSelecionado.unidades_detalhe
      : [];
    const unidadeIdsComExemplares = unidadesDetalhe
      .filter((ud) => Number(ud.exemplares || 0) > 0)
      .map((ud) => Number(ud.unidade?.id));

    let unidadesDisponiveis = unidades;
    if (selectedLivroId && unidadeIdsComExemplares.length > 0) {
      unidadesDisponiveis = unidades.filter((u) => unidadeIdsComExemplares.includes(Number(u.id)));
    }

    const selectedUnidadeAtual = unidadeSelect.value;
    unidadeSelect.innerHTML = `
      <option value="">Selecione uma unidade</option>
      ${unidadesDisponiveis.map((unidade) => `<option value="${unidade.id}">${unidade.nome}</option>`).join("")}
    `;
    if (selectedUnidadeAtual) {
      unidadeSelect.value = selectedUnidadeAtual;
    }
  }

  _syncFormData() {
    const form = this.querySelector("#emprestimo-form");
    const livroAutocomplete = this.querySelector("livro-autocomplete");
    if (!form) return;
    if (!this._emprestimo) {
      if (!form.data_emprestimo.value) {
        const today = new Date().toISOString().slice(0, 10);
        form.data_emprestimo.value = today;
      }
      if (!form.status.value) form.status.value = "aberto";
      this._applyLivroPrefillIfNeeded(form);
      return;
    }

    if (livroAutocomplete) {
      livroAutocomplete.value = this._emprestimo.livro || "";
      livroAutocomplete.disabled = false;
    }
    this._syncOptions();
    form.unidade.value = this._emprestimo.unidade || "";
    form.usuario.value = this._emprestimo.usuario || "";
    form.data_emprestimo.value = this._emprestimo.data_emprestimo || "";
    form.data_prevista_devolucao.value = this._emprestimo.data_prevista_devolucao || "";
    form.status.value = this._emprestimo.status || "aberto";
    form.data_devolucao.value = this._emprestimo.data_devolucao || "";
    form.observacoes.value = this._emprestimo.observacoes || "";
  }

  _applyLivroPrefillIfNeeded(form) {
    if (this._didApplyLivroPrefill) return;

    const livroId = Number(this._formOptions?.livroId || 0);
    if (!Number.isFinite(livroId) || livroId <= 0) return;

    const livros = Array.isArray(this._livros) ? this._livros : [];
    const hasLivro = livros.some((livro) => Number(livro.id) === livroId);
    if (!hasLivro) return;

    const livroAutocomplete = this.querySelector("livro-autocomplete");
    if (livroAutocomplete) {
      livroAutocomplete.value = String(livroId);
      livroAutocomplete.disabled = true;
    }
    this._didApplyLivroPrefill = true;
    this._syncOptions();
  }

  _bindEvents() {
    const form = this.querySelector("#emprestimo-form");
    const livroAutocomplete = this.querySelector("livro-autocomplete");
    const voltarBtn = this.querySelector("#voltar-emprestimo-btn");
    const cancelarBtn = this.querySelector("#cancelar-emprestimo-btn");

    if (livroAutocomplete) {
      livroAutocomplete.addEventListener("change", () => this._syncOptions());
    }

    const goBack = () => {
      if (this._onBack) {
        this._onBack();
        return;
      }
      if (window.navigate) window.navigate("/emprestimos");
    };

    if (voltarBtn) {
      voltarBtn.onclick = (e) => {
        e.preventDefault();
        goBack();
      };
    }

    if (cancelarBtn) {
      cancelarBtn.onclick = (e) => {
        e.preventDefault();
        goBack();
      };
    }

    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : "Salvar Empréstimo";
      const feedbackEl = form.querySelector("#emprestimo-form-feedback");
      const livroInput = form.querySelector('input[name="livro"]');

      const payload = {
        livro: livroInput ? livroInput.value : "",
        unidade: form.unidade.value,
        usuario: form.usuario.value,
        data_emprestimo: form.data_emprestimo.value,
        data_prevista_devolucao: form.data_prevista_devolucao.value,
        status: form.status.value,
        data_devolucao: form.data_devolucao.value,
        observacoes: form.observacoes.value,
      };

      const validation = validateEmprestimoFormData(payload);
      if (!validation.isValid) {
        if (feedbackEl) {
          feedbackEl.textContent = validation.firstError;
          feedbackEl.classList.remove("is-loading", "is-success");
          feedbackEl.classList.add("is-error");
        }
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Salvando...";
      }

      if (feedbackEl) {
        feedbackEl.textContent = "Salvando dados do empréstimo...";
        feedbackEl.classList.remove("is-error", "is-success");
        feedbackEl.classList.add("is-loading");
      }

      Promise.resolve(this._onSubmit ? this._onSubmit(validation.cleanData) : null)
        .catch((err) => {
          if (feedbackEl) {
            feedbackEl.textContent =
              (err && err.message) || "Não foi possível salvar o empréstimo.";
            feedbackEl.classList.remove("is-loading", "is-success");
            feedbackEl.classList.add("is-error");
          }
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || "Salvar Empréstimo";
          }
        });
    });
  }
}

customElements.define("emprestimo-form", EmprestimoForm);
