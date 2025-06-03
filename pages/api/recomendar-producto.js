// pages/api/recomendar-producto.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sólo POST permitido" });
  }

  const { consulta, productos } = req.body;
  if (!consulta || !productos) {
    return res.status(400).json({ error: "Datos faltantes" });
  }

  const prompt = `
El usuario busca: "${consulta}"
Lista de productos disponibles:
${productos.map(p => `- ${p.nombre} (${p.unidad})`).join('\n')}
Sugiere los productos más parecidos, corregidos o relacionados (máximo 3).
Si encuentras una coincidencia exacta, ponla primero.
Solo responde la lista de sugerencias.
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0.2
    });

    res.status(200).json({
      sugerencias: completion.choices[0].message.content.trim()
    });
  } catch (e) {
    console.error("Error con OpenAI:", e);
    res.status(500).json({ sugerencias: "No se pudo obtener sugerencias." });
  }
}
