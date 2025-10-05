// 📁 src/components/unidade/unidade-form.js 
import "./unidade-form.css";
import { BaseService } from "../../domains/base-service";

// Instância única de API para este módulo
const api = new BaseService();

// Web Component para o formulário de unidade (biblioteca)
class UnidadeForm extends HTMLElement {
  connectedCallback() {
    const isEdit = this.hasAttribute("edit");

    this.innerHTML = `
      <form id="unidade-form">
        <div class="unidade-form-header">
          <button type="button" id="voltar-unidade-btn" class="outline border-0">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2 style="margin: 0;">${isEdit ? "Editar Unidade" : "Adicionar Unidade"}</h2>
        </div>

        <div>
          <label for="nome">Nome:</label>
          <input type="text" id="nome" name="nome" required />
        </div>
        <div>
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" name="endereco" required />
        </div>
        <div>
          <label for="telefone">Telefone:</label>
          <input type="text" id="telefone" name="telefone" />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label for="site">Site:</label>
          <input type="url" id="site" name="site" />
        </div>

        <div class="unidade-form-footer">
          <button type="button" id="cancelar-unidade-btn" class="outline">Cancelar</button>
          <button type="submit">Salvar Unidade</button>
        </div>
      </form>
    `;

    setTimeout(() => {
      const form = this.querySelector("#unidade-form");
      const voltarBtn = this.querySelector("#voltar-unidade-btn");
      const cancelarBtn = this.querySelector("#cancelar-unidade-btn");

      if (voltarBtn) {
        voltarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/unidades");
        };
      }
      if (cancelarBtn) {
        cancelarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/unidades");
        };
      }

      // Pré-preencher campos quando estiver editando
      if (isEdit && this._unidadeSelecionada && form) {
        const u = this._unidadeSelecionada;
        if (form.nome) form.nome.value = u.nome || "";
        if (form.endereco) form.endereco.value = u.endereco || "";
        if (form.telefone) form.telefone.value = u.telefone || "";
        if (form.email) form.email.value = u.email || "";
        if (form.site) form.site.value = u.site || "";
      }

      // Submit via API (POST/PUT)
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Validação simples de obrigatórios
        if (!form.nome?.value?.trim() || !form.endereco?.value?.trim()) {
          alert("Preencha os campos obrigatórios: Nome e Endereço.");
          return;
        }

        // Monta payload
        const payload = {
          nome: form.nome?.value?.trim() || "",
          endereco: form.endereco?.value?.trim() || "",
          telefone: form.telefone?.value?.trim() || "",
          email: form.email?.value?.trim() || "",
          site: form.site?.value?.trim() || "",
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        if (submitBtn) {
          submitBtn.textContent = isEdit ? "Salvando..." : "Criando...";
          submitBtn.disabled = true;
        }

        // Descobre ID em edição (ajuste a chave se seu objeto usar outro nome)
        const unidadeId = this._unidadeSelecionada?.id || this._unidadeSelecionada?.unidade_id;

        try {
          if (isEdit && unidadeId) {
            // PUT em /gestor/unidades/{id}/
            await api.put(`gestor/unidades/${unidadeId}/`, payload);
            alert("Unidade atualizada com sucesso!");
          } else {
            // POST em /gestor/unidades/
            await api.post("gestor/unidades/", payload);
            alert("Unidade criada com sucesso!");
          }
          window.navigate && window.navigate("/unidades");
        } catch (err) {
          console.error(err);
          const msg = err?.response?.data?.message || err?.message || "Erro ao salvar a unidade.";
          alert(msg);
        } finally {
          if (submitBtn) {
            submitBtn.textContent = originalText || "Salvar Unidade";
            submitBtn.disabled = false;
          }
        }
      });
    }, 0);
  }
}

customElements.define("unidade-form", UnidadeForm);
