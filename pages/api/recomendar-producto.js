import OpenAI from "openai";
import fuzzysort from "fuzzysort";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = "asst_nrkvYYIR23vekIXMcNLv3FoF";

// Función avanzada de fuzzy solo para letras (palabras pegadas a números/símbolos también)
function fuzzySoloLetrasAvanzado(consulta, keywordsProductos) {
  return consulta.split(/\s+/).map(fragmento => {
    // Divide fragmento en sub-palabras: letras, números, otros
    // Ejemplo: "vrida1" -> ["vrida", "1"]
    const subpalabras = fragmento.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+|[0-9]+|[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9]+/g);
    if (!subpalabras) return fragmento;

    // Corrige solo la parte de letras
    const corregido = subpalabras.map(sub => {
      if (/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+$/.test(sub)) {
        const r = fuzzysort.go(sub.toLowerCase(), keywordsProductos, { threshold: -1000 });
        if (r.total > 0 && r[0].score > -4) return r[0].target;
      }
      return sub;
    }).join("");

    return corregido;
  }).join(" ");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sólo POST permitido" });
  }

  const { consulta, productos } = req.body;
  if (!consulta || !productos) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // 1. Armamos una lista de keywords solo con nombres de productos en minúsculas
  const keywordsProductos = productos.map(p => p.nombre.toLowerCase());

  // 2. Corregimos la consulta SOLO en las partes de letras
  const consultaCorregida = fuzzySoloLetrasAvanzado(consulta, keywordsProductos);

  // 3. Usamos fuzzysort sobre nombres completos para buscar sugerencias (como antes)
  const nombresProductos = productos.map(p => p.nombre);
  const resultados = fuzzysort.go(consultaCorregida, nombresProductos, { limit: 5, threshold: -1000 });
  const productosParecidos = resultados.map(r => productos.find(p => p.nombre === r.target));

  // 4. Armamos el mensaje para el Assistant (igual que antes)
  let mensajeParaAssistant = consultaCorregida;
  if (productosParecidos.length > 0) {
    mensajeParaAssistant = `
El usuario buscó: "${consultaCorregida}"
Coincidencias sugeridas:
${productosParecidos.map(
  p => `- ${p.nombre} (${p.codigo}, ${p.unidad})`
).join('\n')}
Si hay una coincidencia exacta, ponla primero.
Devuelve el resultado en formato JSON como te he indicado en tus instrucciones.
`.trim();
  }

  // Puedes loggear aquí para depurar
  console.log("Consulta original:", consulta);
  console.log("Consulta corregida:", consultaCorregida);
  console.log("Mensaje enviado a OpenAI:", mensajeParaAssistant);

  // --- Llamada al Assistant ---
  try {
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: mensajeParaAssistant
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
