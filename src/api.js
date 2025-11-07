// src/api.js
const API_URL = (import.meta.env.VITE_API_URL ?? 'https://biblio-webapi.onrender.com/gestor')
  .replace(/\/$/, ''); // sem barra no final

export async function getLivros() {
  const res = await fetch(`${API_URL}/livros/`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Erro ao buscar livros');
  return res.json();
}

export async function getUnidades() {
  const res = await fetch(`${API_URL}/unidades/`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Erro ao buscar unidades');
  return res.json();
}

/* 🔽 ADICIONE ESTES */
export async function createUnidade(payload) {
  const res = await fetch(`${API_URL}/unidades/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Erro ao criar unidade: ${res.status} ${txt}`);
  }
  return res.json(); // retorna a unidade criada
}

export async function updateUnidade(id, payload) {
  const res = await fetch(`${API_URL}/unidades/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao atualizar unidade');
  return res.json();
}

export async function deleteUnidade(id) {
  const res = await fetch(`${API_URL}/unidades/${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir unidade');
  return true;
}
