// src/api.js
const API_URL = (import.meta.env.VITE_API_URL ?? 'https://biblio-webapi.onrender.com/gestor')
  .replace(/\/$/, ''); // remove barra final se vier

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
