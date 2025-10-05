// src/domains/api.js
const API_URL = import.meta.env.VITE_API_URL;

export async function getLivros() {
  try {
    const res = await fetch(`${API_URL}/livros/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Erro ao buscar livros");
    return await res.json();
  } catch (error) {
    console.error("❌ Erro em getLivros:", error);
    throw error;
  }
}

export async function getUnidades() {
  try {
    const res = await fetch(`${API_URL}/unidades/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Erro ao buscar unidades");
    return await res.json();
  } catch (error) {
    console.error("❌ Erro em getUnidades:", error);
    throw error;
  }
}
