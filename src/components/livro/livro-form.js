// 📁 src/components/livro/livro-form.js
import "./livro-form.css";
import { BaseService } from "../../domains/base-service.js";

const api = new BaseService();

class LivroForm extends HTMLElement {
  constructor() {
    super();
    this._livroUnidades = [];
  }

  connectedCallback() {
    const isEdit = this.hasAttribute("edit");

    /* ---------------- Helpers & dados base ---------------- */
    const getList = (nomeLista) =>
      window.gestorController?.initData?.[nomeLista];

    const unidadesDisponiveis =
      this._unidadesDisponiveis || getList("unidades") || [];
    const tipoObras =
      this._tipoObrasDisponiveis || getList("tipo_obras") || [];

    const normalizeId = (v) => {
      if (v == null) return null;
      if (typeof v === "object" && "id" in v) return Number(v.id);
      return Number(v);
    };

    const findUnidadeObj = (id) =>
      unidadesDisponiveis.find((u) => Number(u.id) === Number(id)) ||
      (id != null ? { id: Number(id), nome: `Unidade ${id}` } : null);

    // Converte qualquer shape vindo do backend para [{unidade:{id,nome,...}, exemplares}]
    const mapQualquerUnidadesParaState = (arr = []) =>
      (Array.isArray(arr) ? arr : [])
        .map((u) => {
          const rawId = normalizeId(u?.unidade ?? u?.unidade_id);
          const unidade = findUnidadeObj(rawId);
          const exemplares = Number(u?.exemplares ?? u?.qtd ?? u?.quantidade ?? 0) || 0;
          if (!unidade) return null;
          return { unidade, exemplares };
        })
        .filter(Boolean);

    /* ---------------- Estado inicial de unidades ---------------- */
    // 1) Se o controller/parent injetou unidades pré-selecionadas, prioriza
    if (Array.isArray(this._unidadesSelecionadas) && this._unidadesSelecionadas.length) {
      // Aceita [{unidade:obj/id, exemplares}]
      this._livroUnidades = (this._unidadesSelecionadas || []).map((u) => {
        const id = normalizeId(u?.unidade);
        const unidade = typeof u?.unidade === "object" ? u.unidade : findUnidadeObj(id);
        return { unidade, exemplares: Number(u?.exemplares) || 0 };
      }).filter((u) => u?.unidade?.id != null);
    }

    // 2) Se está em edição e ainda não possuímos estado, hidrata do livro selecionado
    if (
      isEdit &&
      (!Array.isArray(this._livroUnidades) || this._livroUnidades.length === 0) &&
      this._livroSelecionado
    ) {
      const raw = Array.isArray(this._livroSelecionado?.unidades_detalhe) && this._livroSelecionado.unidades_detalhe.length
        ? this._livroSelecionado.unidades_detalhe
        : (this._livroSelecionado?.unidades || []);
      const pre = mapQualquerUnidadesParaState(raw);
      if (pre.length) this._livroUnidades = pre;
    }

    /* ---------------- Template ---------------- */
    this.innerHTML = `
      <form id="livro-form">
        <div class="livro-form-header">
          <button type="button" id="voltar-btn" class="outline border-0" aria-label="Voltar">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2 style="margin:0;">${isEdit ? "Editar Livro" : "Adicionar Livro"}</h2>
        </div>

        <div>
          <label for="titulo">Título:</label>
          <input type="text" id="titulo" name="titulo" required>
        </div>

        <div>
          <label for="autor">Autor:</label>
          <input type="text" id="autor" name="autor" required>
        </div>

        <div>
          <label for="editora">Editora:</label>
          <input type="text" id="editora" name="editora">
        </div>

        <div>
          <label for="data_publicacao">Data de Publicação:</label>
          <input type="date" id="data_publicacao" name="data_publicacao">
        </div>

        <div>
          <label for="isbn">ISBN:</label>
          <input type="text" id="isbn" name="isbn">
        </div>

        <div>
          <label for="paginas">Páginas:</label>
          <input type="number" id="paginas" name="paginas" min="0">
        </div>

        <div>
          <label for="capa">URL da Capa:</label>
          <input type="url" id="capa" name="capa">
        </div>

        <div>
          <label for="idioma">Idioma:</label>
          <input type="text" id="idioma" name="idioma">
        </div>

        <!-- Mantendo input numérico para gênero (compat) -->
        <div>
          <label for="genero">Gênero (ID):</label>
          <input type="number" id="genero" name="genero" min="0">
        </div>

        <div>
          <label for="tipo_obra">Tipo de Obra:</label>
          <select id="tipo_obra" name="tipo_obra">
            <option value="">Selecione o tipo de obra</option>
            ${tipoObras.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("")}
          </select>
        </div>

        <div class="livro-unidade-header">
          <div class="livro-unidade">
            <label for="unidade-select">Unidade:</label>
            <select id="unidade-select">
              <option value="">Selecione a unidade</option>
              ${unidadesDisponiveis.map((u) => `<option value="${u.id}">${u.nome}</option>`).join("")}
            </select>
          </div>

          <div class="livro-unidade">
            <label for="exemplares-input">Exemplares:</label>
            <input type="number" id="exemplares-input" min="1" value="1">
          </div>

          <button type="button" id="add-unidade-livro" class="outline">Adicionar Unidade</button>
        </div>

        <div id="livro-unidades-list" style="margin:8px 0 16px;"></div>

        <div class="livro-form-footer">
          <button type="button" id="cancelar-btn" class="outline">Cancelar</button>
          <button type="submit">${isEdit ? "Salvar Livro" : "Criar Livro"}</button>
        </div>
      </form>
    `;

    /* ---------------- Comportamento ---------------- */
    const voltarBtn = this.querySelector("#voltar-btn");
    const cancelarBtn = this.querySelector("#cancelar-btn");
    voltarBtn && (voltarBtn.onclick = (e) => { e.preventDefault(); window.navigate?.("/livros"); });
    cancelarBtn && (cancelarBtn.onclick = (e) => { e.preventDefault(); window.navigate?.("/livros"); });

    const unidadeSelect   = this.querySelector("#unidade-select");
    const exemplaresInput = this.querySelector("#exemplares-input");
    const addUnidadeBtn   = this.querySelector("#add-unidade-livro");
    const unidadesListDiv = this.querySelector("#livro-unidades-list");
    const form            = this.querySelector("#livro-form");

    this._renderUnidadesList = () => {
      unidadesListDiv.innerHTML =
        this._livroUnidades.length > 0
          ? `<ul style="margin:0;padding-left:1.2em;">${
              this._livroUnidades
                .map(
                  (u) => `
                    <li>
                      <strong>${u.unidade?.nome ?? "—"}:</strong> ${Number(u.exemplares) || 0} exemplar(es)
                      <button type="button" class="remove-unidade-livro outline" data-id="${u.unidade.id}">Remover</button>
                    </li>
                  `
                )
                .join("")
            }</ul>`
          : '<span style="color:#888;">Nenhuma unidade adicionada.</span>';

      unidadesListDiv.querySelectorAll(".remove-unidade-livro").forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          const id = Number(btn.dataset.id);
          this._livroUnidades = this._livroUnidades.filter((u) => Number(u.unidade.id) !== id);
          this._renderUnidadesList();
        };
      });
    };

    // Render inicial
    this._renderUnidadesList();

    addUnidadeBtn.onclick = (e) => {
      e.preventDefault();
      const unidadeId = Number(unidadeSelect.value);
      const unidade = findUnidadeObj(unidadeId);
      const exemplares = Math.max(1, Number(exemplaresInput.value) || 1);
      if (!unidadeId || !unidade) return;

      // Evita duplicatas
      if (this._livroUnidades.some((u) => Number(u.unidade.id) === unidadeId)) return;

      this._livroUnidades.push({ unidade, exemplares });
      this._renderUnidadesList();
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      // validação simples: data do futuro só se tiver ISBN (mesma regra que você já usava)
      const dataPub = form.data_publicacao?.value;
      const isbn = form.isbn?.value;
      let dataInvalida = false;
      if (dataPub) {
        const d = new Date(dataPub);
        const today = new Date();
        if (isNaN(d.getTime()) || d > today) dataInvalida = true;
      }
      if ((dataInvalida || !dataPub) && (!isbn || isbn.trim() === "")) {
        alert("Informe uma data de publicação válida ou um ISBN.");
        return false;
      }

      // monta unidades para o backend
      const unidadesPayload = (this._livroUnidades || []).map((u) => ({
        unidade: Number(u.unidade.id),
        exemplares: Number(u.exemplares) || 1,
      }));

      const tipoObraSel = form.querySelector('[name="tipo_obra"]')?.value || null;

      const payload = {
        titulo:  form.titulo?.value?.trim()  || "",
        autor:   form.autor?.value?.trim()   || "",
        editora: form.editora?.value?.trim() || "",
        data_publicacao: form.data_publicacao?.value || null,
        isbn:    form.isbn?.value?.trim()    || "",
        paginas: form.paginas?.value ? Number(form.paginas.value) : null,
        // envia null quando vazio (não a string "null")
        capa:    (form.capa?.value?.trim() || "") || null,
        idioma:  form.idioma?.value?.trim() || "",
        genero:  form.genero?.value ? Number(form.genero.value) : null,
        tipo_obra: tipoObraSel ? Number(tipoObraSel) : null,
        unidades: unidadesPayload,
      };

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      if (submitBtn) submitBtn.textContent = isEdit ? "Salvando..." : "Criando...";

      const livroId = this._livroSelecionado?.id || this._livroSelecionado?.livro_id;

      (async () => {
        try {
          if (isEdit && livroId) {
            await api.put(`/gestor/livros/${livroId}/`, payload);
            alert("Livro atualizado com sucesso!");
          } else {
            await api.post("/gestor/livros/", payload);
            alert("Livro criado com sucesso!");
          }
          window.navigate?.("/livros");
        } catch (err) {
          console.error(err);
          const msg = err?.response?.data?.message || err?.message || "Erro ao salvar o livro.";
          alert(msg);
        } finally {
          if (submitBtn) submitBtn.textContent = originalText || (isEdit ? "Salvar Livro" : "Criar Livro");
        }
      })();
    });

    // Preenche campos básicos quando em edição
    if (isEdit && this._livroSelecionado) {
      const livro = this._livroSelecionado;
      const f = this.querySelector("#livro-form");
      if (f) {
        f.titulo && (f.titulo.value = livro.titulo || "");
        f.autor && (f.autor.value = livro.autor || "");
        f.editora && (f.editora.value = livro.editora || "");
        f.data_publicacao && (f.data_publicacao.value = livro.data_publicacao || "");
        f.isbn && (f.isbn.value = livro.isbn || "");
        f.paginas && (f.paginas.value = livro.paginas || "");
        f.capa && (f.capa.value = livro.capa && livro.capa !== "null" ? livro.capa : "");
        f.idioma && (f.idioma.value = livro.idioma || "");
        f.genero && (f.genero.value = (typeof livro.genero === "object" ? livro.genero?.id : livro.genero) || "");
        f.tipo_obra && (f.tipo_obra.value = (typeof livro.tipo_obra === "object" ? livro.tipo_obra?.id : livro.tipo_obra) || "");
      }

      // Se o controller atualizar _livroSelecionado dinamicamente, reidrate chamando:
      this._renderUnidadesList();
    }
  }
}

customElements.define("livro-form", LivroForm);

// Fallback opcional para expor controller no window (só se não existir)
if (typeof window !== "undefined") {
  if (!window.gestorController && window.GestorController) {
    window.gestorController = new window.GestorController();
  }
}
