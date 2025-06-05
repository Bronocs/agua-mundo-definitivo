import OpenAI from "openai";
import fuzzysort from "fuzzysort";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = "asst_nrkvYYIR23vekIXMcNLv3FoF";

// ... tu handler ...
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sólo POST permitido" });
  }

  const { consulta, productos } = req.body; // <-- aquí ya recibes productos desde tu frontend/backend
  if (!consulta || !productos) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // 1. Armamos una lista solo con los nombres de producto
  const nombresProductos = productos.map(p => p.nombre);

  // 2. Usamos fuzzysort para buscar los 3-5 nombres más parecidos a la consulta
  const resultados = fuzzysort.go(consulta, nombresProductos, { limit: 5, threshold: -1000 });

  // 3. Obtenemos los objetos completos de producto coincidente
  const productosParecidos = resultados.map(r => productos.find(p => p.nombre === r.target));

  // 4. Armamos un texto con los productos encontrados (puedes armarlo como quieras)
  let consultaCorregida = consulta;
  if (productosParecidos.length > 0) {
    // Si hay buenos matches, generamos la consulta para el Assistant
    consultaCorregida = `
El usuario buscó: "${consulta}"
Coincidencias sugeridas:
${productosParecidos.map(
  p => `- ${p.nombre} (${p.codigo}, ${p.unidad})`
).join('\n')}
Si hay una coincidencia exacta, ponla primero.
Devuelve el resultado en formato JSON como te he indicado en tus instrucciones.
`.trim();
  }

  // --- Llamada al Assistant ---
  try {
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: consultaCorregida
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (runStatus.status === "completed") break;
      await new Promise(res => setTimeout(res, 2000));
    } while (["queued", "in_progress"].includes(runStatus.status));

    if (runStatus.status !== "completed") {
      return res.status(500).json({ sugerencias: "No se pudo completar la consulta." });
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.reverse().find(m => m.role === "assistant");
    const respuesta = lastMessage ? lastMessage.content[0].text.value : "Sin respuesta";

    res.status(200).json({ sugerencias: respuesta });
  } catch (e) {
    console.error("Error con OpenAI Assistant:", e);
    res.status(500).json({ sugerencias: "No se pudo obtener respuesta. " + (e?.message || '') });
  }
}
