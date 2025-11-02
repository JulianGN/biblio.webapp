// 📁 src/components/livro/livro-form.js
import "./livro-form.css";
import { BaseService } from "../../domains/base-service";

const api = new BaseService();

class LivroForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const isEdit = this.hasAttribute("edit");

    const getList = (nomeLista) =>
      window.gestorController &&
      window.gestorController.initData &&
      window.gestorController.initData[nomeLista];

    const unidades = this._unidadesDisponiveis || getList("unidades") || [];
    const tipoObras = this._tipoObrasDisponiveis || getList("tipo_obras") || [];

    // ---------- helpers ----------
    const mapUnidadesDetalheToState = (unidadesDetalhe = []) => {
      // Transforma o que veio do backend (unidades_detalhe) no formato usado na UI
      return unidadesDetalhe
        .filter((ud) => ud && ud.unidade && ud.unidade.id)
        .map((ud) => ({
          unidade: {
            id: Number(ud.unidade.id),
            nome: ud.unidade.nome || "",
            endereco: ud.unidade.endereco || "",
            telefone: ud.unidade.telefone || "",
            email: ud.unidade.email || "",
            site: ud.unidade.site || "",
          },
          exemplares: Number(ud.exemplares) || 1,
        }));
    };

    // Estado interno das unidades do livro
    this._livroUnidades =
      Array.isArray(this._livroUnidades) && this._livroUnidades.length > 0
        ? this._livroUnidades
        : [];

    // Se vierem unidades pré-selecionadas de fora, respeite
    if (isEdit && this._unidadesSelecionadas && this._unidadesSelecionadas.length > 0) {
      this._livroUnidades = [...this._unidadesSelecionadas];
    }

    // Hidratação automática a partir do livro selecionado (edição)
    if (isEdit && this._livroSelecionado && (!this._livroUnidades || this._livroUnidades.length === 0)) {
      const pre = mapUnidadesDetalheToState(this._livroSelecionado.unidades_detalhe || []);
      if (pre.length > 0) {
        this._livroUnidades = pre;
      }
    }

    // ---------- template ----------
    this.innerHTML = `
      <form id="livro-form">
        <div class="livro-form-header">
          <button type="button" id="voltar-btn" class="outline border-0">
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
          <input type="number" id="paginas" name="paginas">
        </div>
        <div>
          <label for="capa">URL da Capa:</label>
          <input type="url" id="capa" name="capa">
        </div>
        <div>
          <label for="idioma">Idioma:</label>
          <input type="text" id="idioma" name="idioma">
        </div>
        <div>
          <label for="genero">Gênero (ID):</label>
          <input type="number" id="genero" name="genero">
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
              ${unidades.map((u) => `<option value="${u.id}">${u.nome}</option>`).join("")}
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
          <button type="submit">Salvar Livro</button>
        </div>
      </form>
    `;

    // ---------- comportamento ----------
    setTimeout(() => {
      const voltarBtn = this.querySelector("#voltar-btn");
      const cancelarBtn = this.querySelector("#cancelar-btn");
      voltarBtn && (voltarBtn.onclick = (e) => { e.preventDefault(); window.navigate && window.navigate("/livros"); });
      cancelarBtn && (cancelarBtn.onclick = (e) => { e.preventDefault(); window.navigate && window.navigate("/livros"); });

      const unidadeSelect   = this.querySelector("#unidade-select");
      const exemplaresInput = this.querySelector("#exemplares-input");
      const addUnidadeBtn   = this.querySelector("#add-unidade-livro");
      const unidadesListDiv = this.querySelector("#livro-unidades-list");
      const form            = this.querySelector("#livro-form");

      const renderUnidadesList = () => {
        unidadesListDiv.innerHTML =
          this._livroUnidades.length > 0
            ? `<ul style="margin:0;padding-left:1.2em;">${
                this._livroUnidades
                  .map(
                    (u) => `<li>
                      <strong>${u.unidade.nome}:</strong> ${u.exemplares} exemplar(es)
                      <button type="button" class="remove-unidade-livro outline" data-id="${u.unidade.id}">Remover</button>
                    </li>`
                  )
                  .join("")
              }</ul>`
            : '<span style="color:#888;">Nenhuma unidade adicionada.</span>';

        unidadesListDiv.querySelectorAll(".remove-unidade-livro").forEach((btn) => {
          btn.onclick = (e) => {
            e.preventDefault();
            const id = Number(btn.dataset.id);
            this._livroUnidades = this._livroUnidades.filter((u) => u.unidade.id !== id);
            renderUnidadesList();
          };
        });
      };

      // Render inicial (já considera hidratação feita acima)
      renderUnidadesList();

      addUnidadeBtn.onclick = (e) => {
        e.preventDefault();
        const unidadeId = Number(unidadeSelect.value);
        const unidade = unidades.find((u) => u.id === unidadeId);
        const exemplares = Number(exemplaresInput.value) || 1;
        if (!unidadeId || !unidade) return;
        if (this._livroUnidades.some((u) => u.unidade.id === unidadeId)) return;
        this._livroUnidades.push({ unidade, exemplares });
        renderUnidadesList();
      };

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        // validação simples data/ISBN
        const dataPub = form.data_publicacao?.value;
        const isbn    = form.isbn?.value;
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

        // monta unidades -> payload do backend
        const unidadesPayload =
          (this._livroUnidades || []).map((u) => ({
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
          // envia null (não "null" string)
          capa:    (form.capa?.value?.trim() || "") || null,
          idioma:  form.idioma?.value?.trim() || "",
          genero:  form.genero?.value ? Number(form.genero.value) : null,
          tipo_obra: tipoObraSel ? Number(tipoObraSel) : null,
          // 🔥 apenas o campo esperado pelo backend
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
            window.navigate && window.navigate("/livros");
          } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || err?.message || "Erro ao salvar o livro.";
            alert(msg);
          } finally {
            if (submitBtn) submitBtn.textContent = originalText || "Salvar Livro";
          }
        })();
      });

      // Preenche campos na edição
      if (isEdit && this._livroSelecionado) {
        const livro = this._livroSelecionado;
        const f = this.querySelector("#livro-form");
        if (livro && f) {
          if (f.titulo)       f.titulo.value       = livro.titulo || "";
          if (f.autor)        f.autor.value        = livro.autor || "";
          if (f.editora)      f.editora.value      = livro.editora || "";
          if (f.data_publicacao) f.data_publicacao.value = livro.data_publicacao || "";
          if (f.isbn)         f.isbn.value         = livro.isbn || "";
          if (f.paginas)      f.paginas.value      = livro.paginas || "";
          if (f.capa)         f.capa.value         = livro.capa && livro.capa !== "null" ? livro.capa : "";
          if (f.idioma)       f.idioma.value       = livro.idioma || "";
          if (f.genero)       f.genero.value       = livro.genero || "";
          if (f.tipo_obra)    f.tipo_obra.value    = livro.tipo_obra || "";

          // Caso venha um novo livro selecionado com unidades, reidrata e rerenderiza
          const pre = mapUnidadesDetalheToState(livro.unidades_detalhe || []);
          if (pre.length > 0) {
            this._livroUnidades = pre;
            // refaz a lista
            const unidadesListDiv = this.querySelector("#livro-unidades-list");
            if (unidadesListDiv) {
              // reusa a função local:
              const evt = new Event("repaint");
              unidadesListDiv.dispatchEvent(evt);
            }
            // como a função está no escopo, chamamos diretamente:
            // (garantimos chamada após setTimeout inicial)
            // mas já renderizamos acima na criação, então:
            // só força novo render:
            const again = () => {
              const ul = this.querySelector("#livro-unidades-list");
              if (ul) {
                // reaproveita
              }
            };
          }
        }
      }
    }, 0);
  }
}

customElements.define("livro-form", LivroForm);

if (typeof window !== "undefined") {
  if (!window.gestorController && window.GestorController) {
    window.gestorController = new window.GestorController();
  }
}
