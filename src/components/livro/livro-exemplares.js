// 📄 src/components/livro/livro-exemplares.js
import { BaseService } from "../../domains/base-service.js"; // <- caminho corrigido1!

const api = new BaseService();

class LivroExemplaresPage extends HTMLElement {
  constructor() {
    super();
    this._livroId = null;
    this._livro = null;
    this._unidadesDisponiveis = [];
    this._unidadesSelecionadas = []; // [{unidade:{id,nome,...}, exemplares:Number}]
    this._dirty = false;
    this.onSalvar = null;    // callback opcional vindo do controller
    this.onCancelar = null;  // callback opcional vindo do controller
  }

  /* ===== Props públicas esperadas pelo controller ===== */
  set livroId(v) {
    this._livroId = Number(v) || null;
  }
  set livro(v) {
    this._livro = v || null;
  }
  set unidadesDisponiveis(v) {
    this._unidadesDisponiveis = Array.isArray(v) ? v : [];
  }
  set unidadesSelecionadas(v) {
    this._unidadesSelecionadas = Array.isArray(v) ? v : [];
  }

  connectedCallback() {
    this.renderSkeleton();
    this.bootstrap().catch((err) => {
      console.error("Erro ao carregar exemplares:", err);
      this.innerHTML = this.errorView("Não foi possível carregar os exemplares deste livro.");
      this.bindErrorActions();
    });
  }

  async bootstrap() {
    // Se controller já injetou tudo, só renderiza.
    if (this._livroId && this._livro && this._unidadesDisponiveis.length) {
      if (!this._unidadesSelecionadas.length) {
        // tenta mapear do payload do livro (caso o controller tenha enviado só livro)
        this._unidadesSelecionadas = (this._livro.unidades || []).map((u) => ({
          unidade:
            this._unidadesDisponiveis.find(
              (uni) => uni.id === (u.unidade?.id || u.unidade)
            ) || { id: u.unidade?.id || u.unidade, nome: `Unidade ${u.unidade?.id || u.unidade}` },
          exemplares: Number(u.exemplares) || 1,
        }));
      }
      this.render();
      return;
    }

    // Fallback: obter id da URL e buscar tudo pela API
    const urlId = this.getLivroIdFromUrl();
    this._livroId = this._livroId || urlId;

    if (!this._livroId) throw new Error("ID do livro não encontrado.");

    const [livro, relacoes, initData] = await Promise.all([
      api.get(`/gestor/livros/${this._livroId}/`),                      // detalhe do livro
      api.get(`/gestor/livro-unidades/?livro=${this._livroId}`),        // vínculos livro<->unidade
      api.get(`/gestor/dados-iniciais/`),                               // para nomes das unidades
    ]);

    this._livro = livro || null;
    this._unidadesDisponiveis = (initData?.unidades || []);
    const itens = Array.isArray(relacoes) ? relacoes : [];

    this._unidadesSelecionadas = itens.map((it) => ({
      unidade:
        this._unidadesDisponiveis.find((u) => u.id === (it.unidade?.id || it.unidade)) ||
        { id: it.unidade?.id || it.unidade, nome: it.unidade?.nome || `Unidade ${it.unidade?.id || it.unidade}` },
      exemplares: Number(it.exemplares) || 1,
    }));

    this.render();
  }

  getLivroIdFromUrl() {
    const path = window.location.pathname || "";
    const m = path.match(/\/livros\/(\d+)\/exemplares/);
    return m && m[1] ? Number(m[1]) : null;
  }

  /* ===== RENDER ===== */
  renderSkeleton() {
    this.innerHTML = `
      <section class="container">
        <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
          <span class="outline" style="opacity:.5"><i class="fa-solid fa-arrow-left"></i></span>
          <h2 style="margin:0">Exemplares por Unidade</h2>
        </div>
        <div style="color:#777">Carregando…</div>
      </section>
    `;
  }

  totalExemplares() {
    return (this._unidadesSelecionadas || []).reduce((acc, u) => acc + (Number(u.exemplares) || 0), 0);
  }

  render() {
    const livro = this._livro;
    const total = this.totalExemplares();

    this.innerHTML = `
      <section class="container">
        <div class="livro-form-header" style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
          <button type="button" id="voltar-btn" class="outline border-0" title="Voltar">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2 style="margin:0">Exemplares por Unidade</h2>
        </div>

        <div style="margin:8px 0 16px 0;color:#555">
          ${livro ? `<div><strong>Livro:</strong> ${livro.titulo}</div>` : ""}
          <div><strong>Total de exemplares:</strong> <span id="total-exemplares">${total}</span></div>
        </div>

        <div style="display:flex;gap:.75rem;align-items:flex-end;flex-wrap:wrap;margin:12px 0 16px;">
          <div>
            <label for="unidade-select"><strong>Unidade</strong></label>
            <select id="unidade-select">
              <option value="">Selecione a unidade</option>
              ${(this._unidadesDisponiveis || [])
                .map((u) => `<option value="${u.id}">${u.nome}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label for="exemplares-input"><strong>Exemplares</strong></label>
            <input type="number" id="exemplares-input" min="1" value="1" />
          </div>
          <button type="button" id="add-unidade" class="outline">Adicionar</button>
        </div>

        <div id="lista-unidades">
          ${this._unidadesSelecionadas.length === 0
            ? `<div style="color:#777">Nenhuma unidade vinculada a este livro.</div>`
            : `
              <ul style="list-style:none;padding:0;margin:0;display:grid;gap:.75rem">
                ${this._unidadesSelecionadas
                  .map(
                    (it) => `
                  <li style="border:1px solid #eee;border-radius:12px;padding:12px 14px">
                    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
                      <div>
                        <div style="font-weight:600">${it.unidade?.nome ?? "—"}</div>
                        <div style="font-size:.9rem;color:#666">
                          ${[it.unidade?.endereco, it.unidade?.telefone, it.unidade?.email]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:.5rem">
                        <label style="font-size:.9rem;color:#666" for="ex-${it.unidade.id}">Exemplares</label>
                        <input type="number" min="1" value="${it.exemplares ?? 1}" id="ex-${it.unidade.id}" data-id="${it.unidade.id}" style="width:90px" />
                        <button type="button" class="rem-unidade outline" data-id="${it.unidade.id}" title="Remover">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </li>`
                  )
                  .join("")}
              </ul>
            `}
        </div>

        <div style="display:flex;gap:.75rem;margin-top:20px">
          <button type="button" id="cancelar-btn" class="outline">Cancelar</button>
          <button type="button" id="salvar-btn" ${this._dirty ? "" : "disabled"}>Salvar</button>
        </div>
      </section>
    `;

    this.bindActions();
  }

  bindActions() {
    // Voltar / Cancelar
    const goBack = () => {
      if (this.onCancelar) return this.onCancelar();
      if (window.navigate) return window.navigate("/livros");
      window.location.href = "/livros";
    };
    this.querySelector("#voltar-btn")?.addEventListener("click", goBack);
    this.querySelector("#cancelar-btn")?.addEventListener("click", goBack);

    // Adicionar unidade
    this.querySelector("#add-unidade")?.addEventListener("click", (e) => {
      e.preventDefault();
      const sel = this.querySelector("#unidade-select");
      const qty = this.querySelector("#exemplares-input");
      const unidadeId = Number(sel?.value);
      const exemplares = Math.max(1, Number(qty?.value || 1));
      if (!unidadeId) return;

      const unidade =
        (this._unidadesDisponiveis || []).find((u) => u.id === unidadeId) ||
        null;
      if (!unidade) return;

      // evita duplicar: se já existe, só atualiza a quantidade
      const idx = this._unidadesSelecionadas.findIndex((u) => u.unidade.id === unidadeId);
      if (idx >= 0) {
        this._unidadesSelecionadas[idx].exemplares =
          Number(this._unidadesSelecionadas[idx].exemplares || 1) + exemplares;
      } else {
        this._unidadesSelecionadas.push({ unidade, exemplares });
      }
      this._dirty = true;
      this.render();
    });

    // Remover unidade
    this.querySelectorAll(".rem-unidade").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        this._unidadesSelecionadas = this._unidadesSelecionadas.filter(
          (u) => u.unidade.id !== id
        );
        this._dirty = true;
        this.render();
      });
    });

    // Alterar quantidades in place
    this.querySelectorAll('input[id^="ex-"]').forEach((inp) => {
      inp.addEventListener("input", () => {
        const id = Number(inp.dataset.id);
        const v = Math.max(1, Number(inp.value || 1));
        const item = this._unidadesSelecionadas.find((u) => u.unidade.id === id);
        if (item) {
          item.exemplares = v;
          this._dirty = true;
          // atualiza total sem rerender completo
          const elTotal = this.querySelector("#total-exemplares");
          if (elTotal) elTotal.textContent = String(this.totalExemplares());
          // habilita salvar
          const save = this.querySelector("#salvar-btn");
          if (save) save.disabled = false;
        }
      });
    });

    // Salvar
    this.querySelector("#salvar-btn")?.addEventListener("click", async () => {
      const payload = {
        unidades: (this._unidadesSelecionadas || []).map((u) => ({
          unidade: u.unidade.id,
          exemplares: Number(u.exemplares) || 1,
        })),
      };

      try {
        if (typeof this.onSalvar === "function") {
          await this.onSalvar(payload);
        } else {
          // fallback direto na API (PATCH parcial)
          await api.patch(`/gestor/livros/${this._livroId}/`, payload);
        }
        alert("Exemplares atualizados com sucesso!");
        this._dirty = false;
        if (this.onCancelar) this.onCancelar();
        else if (window.navigate) window.navigate("/livros");
        else window.location.href = "/livros";
      } catch (err) {
        console.error(err);
        alert("Erro ao salvar exemplares. Tente novamente.");
      }
    });
  }

  errorView(msg) {
    return `
      <section class="container">
        <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
          <button type="button" id="voltar-btn" class="outline border-0">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2 style="margin:0">Exemplares por Unidade</h2>
        </div>
        <div style="color:#b00020">${msg}</div>
        <div style="margin-top:12px">
          <button type="button" id="cancelar-btn" class="outline">Voltar</button>
        </div>
      </section>
    `;
  }

  bindErrorActions() {
    this.querySelector("#voltar-btn")?.addEventListener("click", () => {
      if (this.onCancelar) return this.onCancelar();
      if (window.navigate) return window.navigate("/livros");
      window.location.href = "/livros";
    });
    this.querySelector("#cancelar-btn")?.addEventListener("click", () => {
      if (this.onCancelar) return this.onCancelar();
      if (window.navigate) return window.navigate("/livros");
      window.location.href = "/livros";
    });
  }
}

customElements.define("livro-exemplares-page", LivroExemplaresPage);
export default LivroExemplaresPage;
