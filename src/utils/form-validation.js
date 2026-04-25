const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsCount(value = "") {
  return String(value).replace(/\D/g, "").length;
}

function alphaNumCount(value = "") {
  return String(value).replace(/[^0-9a-zA-Z]/g, "").length;
}

export function sanitizePayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.trim()];
      }
      return [key, value];
    })
  );
}

export function validatePayload(payload = {}, rules = {}) {
  const errors = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const value = payload[field];
    const label = rule.label || field;
    const isEmpty = value === undefined || value === null || value === "";

    if (rule.required && isEmpty) {
      errors[field] = `${label} é obrigatório.`;
      return;
    }

    if (isEmpty) return;

    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors[field] = `${label} deve ter no máximo ${rule.maxLength} caracteres.`;
      return;
    }

    if (rule.type === "email" && !EMAIL_REGEX.test(String(value))) {
      errors[field] = `${label} inválido.`;
      return;
    }

    if (rule.type === "url") {
      try {
        const parsed = new URL(String(value));
        if (!/^https?:$/.test(parsed.protocol)) {
          throw new Error("invalid protocol");
        }
      } catch {
        errors[field] = `${label} inválido.`;
        return;
      }
    }

    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors[field] = rule.patternMessage || `${label} inválido.`;
      return;
    }

    if (typeof rule.customValidate === "function") {
      const customError = rule.customValidate(value, payload);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }

    if (rule.type === "number") {
      const num = Number(value);
      if (Number.isNaN(num)) {
        errors[field] = `${label} inválido.`;
        return;
      }
      if (rule.min !== undefined && num < rule.min) {
        errors[field] = `${label} deve ser maior ou igual a ${rule.min}.`;
        return;
      }
      if (rule.max !== undefined && num > rule.max) {
        errors[field] = `${label} deve ser menor ou igual a ${rule.max}.`;
      }
    }
  });

  const firstError = Object.values(errors)[0] || "";
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
}

const livroRules = {
  titulo: { label: "Título", required: true, maxLength: 255 },
  autor: { label: "Autor", required: true, maxLength: 255 },
  isbn: {
    label: "ISBN",
    required: true,
    maxLength: 13,
    pattern: /^(?:\d{10}|\d{13}|\d{9}[\dXx])$/,
    patternMessage: "ISBN deve conter 10 ou 13 caracteres válidos.",
  },
  editora: { label: "Editora", maxLength: 255 },
  idioma: { label: "Idioma", maxLength: 50 },
  capa: { label: "URL da capa", type: "url", maxLength: 255 },
  paginas: { label: "Páginas", type: "number", min: 1, max: 100000 },
};

const unidadeRules = {
  nome: { label: "Nome", required: true, maxLength: 255 },
  endereco: { label: "Endereço", required: true, maxLength: 500 },
  telefone: {
    label: "Telefone",
    maxLength: 20,
    customValidate: (value) => {
      const count = digitsCount(value);
      if (count === 0) return "";
      if (count < 10 || count > 11) return "Telefone deve ter 10 ou 11 dígitos.";
      return "";
    },
  },
  email: { label: "E-mail", type: "email", maxLength: 254 },
  site: { label: "Site", type: "url", maxLength: 200 },
};

const usuarioRules = {
  nome: { label: "Nome", required: true, maxLength: 255 },
  email: { label: "E-mail", required: true, type: "email", maxLength: 254 },
  telefone: {
    label: "Telefone",
    maxLength: 20,
    customValidate: (value) => {
      const count = digitsCount(value);
      if (count === 0) return "";
      if (count < 10 || count > 11) return "Telefone deve ter 10 ou 11 dígitos.";
      return "";
    },
  },
  documento_tipo: {
    label: "Tipo de documento",
    customValidate: (value, payload) => {
      if (!payload.documento) return "";
      if (!value) return "Selecione o tipo do documento.";
      if (!["cpf", "rg", "cnh"].includes(String(value))) {
        return "Tipo de documento inválido.";
      }
      return "";
    },
  },
  documento: {
    label: "Documento",
    maxLength: 30,
    customValidate: (value, payload) => {
      const tipo = String(payload.documento_tipo || "");
      if (!value && !tipo) return "";
      if (!value && tipo) return "Documento é obrigatório para o tipo selecionado.";

      if (tipo === "cpf") {
        const count = digitsCount(value);
        if (count !== 11) return "CPF deve conter 11 dígitos.";
      }
      if (tipo === "cnh") {
        const count = digitsCount(value);
        if (count !== 11) return "CNH deve conter 11 dígitos.";
      }
      if (tipo === "rg") {
        const count = alphaNumCount(value);
        if (count < 7 || count > 9) {
          return "RG deve conter entre 7 e 9 caracteres alfanuméricos.";
        }
      }

      return "";
    },
  },
  observacoes: { label: "Observações", maxLength: 1000 },
};

export function validateLivroFormData(payload) {
  const cleanData = sanitizePayload(payload);
  const validation = validatePayload(cleanData, livroRules);
  return { cleanData, ...validation };
}

export function validateUnidadeFormData(payload) {
  const cleanData = sanitizePayload(payload);
  const validation = validatePayload(cleanData, unidadeRules);
  return { cleanData, ...validation };
}

export function validateUsuarioFormData(payload) {
  const cleanData = sanitizePayload(payload);
  const validation = validatePayload(cleanData, usuarioRules);
  return { cleanData, ...validation };
}
