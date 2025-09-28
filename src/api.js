const API_URL = import.meta.env.VITE_API_URL;

export async function getLivros() {
  const res = await fetch(`${API_URL}/livros`);
  if (!res.ok) throw new Error('Erro ao buscar livros');
  return res.json();
}
