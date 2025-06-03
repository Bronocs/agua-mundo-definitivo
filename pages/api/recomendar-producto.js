import { OpenAIApi, Configuration } from "openai";
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Recibe el término de búsqueda y la lista de productos
  const { consulta, productos } = req.body;
  if (!consulta || !productos) return res.status(400).json({ error: "Datos faltantes" });

  // Crea un prompt personalizado para ChatGPT
  const prompt = `
El usuario busca: "${consulta}"
Lista de productos disponibles:
${productos.map(p => `- ${p.nombre} (${p.unidad})`).join('\n')}
Sugiere los productos más parecidos, corregidos o relacionados (máximo 3).
Si encuentras una coincidencia exacta, ponla primero.
Solo responde la lista de sugerencias.
  `.trim();

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 120,
    temperature: 0.2
  });

  res.status(200).json({
    sugerencias: completion.data.choices[0].message.content.trim()
  });
}
