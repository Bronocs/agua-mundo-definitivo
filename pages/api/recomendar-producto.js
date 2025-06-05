import OpenAI from "openai";
import fuzzysort from "fuzzysort";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = "asst_nrkvYYIR23vekIXMcNLv3FoF";

// Pega aquí tu thread_id fijo (¡cámbialo por el tuyo!)
const THREAD_ID_FIJO = "thread_Kor3STm3MjF06U6aKGaHkQZo"; // <-- reemplaza por el tuyo

// ... tus funciones auxiliares (obtenerVocabulario, fuzzySoloLetrasAvanzado) ...

// Extrae todas las palabras posibles de los nombres de producto
function obtenerVocabulario(productos) {
  const vocab = new Set();
  productos.forEach(p => {
    (p.nombre || "").split(/\W+/).forEach(w => {
      if (w.length > 1) vocab.add(w.toLowerCase());
    });
  });
  return Array.from(vocab);
}

// Fuzzy sólo corrige subpalabras de letras usando vocabulario de todas las palabras del catálogo
function fuzzySoloLetrasAvanzado(consulta, vocabulario) {
  return consulta.split(/\s+/).map(fragmento => {
    const subpalabras = fragmento.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+|[0-9]+|[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9]+/g);
    if (!subpalabras) return fragmento;
    const corregido = subpalabras.map(sub => {
      if (/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+$/.test(sub)) {
        const r = fuzzysort.go(sub.toLowerCase(), vocabulario, { threshold: -1000 });
        if (r.total > 0 && r[0].score >= -3) return r[0].target;
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
  if (!consulta || !productos || !thread_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const vocabulario = obtenerVocabulario(productos);
  const consultaCorregida = fuzzySoloLetrasAvanzado(consulta, vocabulario);

  try {
    // Usa SIEMPRE el mismo thread_id
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: consultaCorregida
    });

    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: ASSISTANT_ID
    });

    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread_id, run.id);
      if (runStatus.status === "completed") break;
      await new Promise(res => setTimeout(res, 2000));
    } while (["queued", "in_progress"].includes(runStatus.status));

    if (runStatus.status !== "completed") {
      return res.status(500).json({ sugerencias: "No se pudo completar la consulta." });
    }

    const messages = await openai.beta.threads.messages.list(thread_id);
    const lastMessage = messages.data.reverse().find(m => m.role === "assistant");
    const respuesta = lastMessage ? lastMessage.content[0].text.value : "Sin respuesta";

    res.status(200).json({ sugerencias: respuesta });

  } catch (e) {
    console.error("Error con OpenAI Assistant:", e);
    res.status(500).json({ sugerencias: "No se pudo obtener respuesta. " + (e?.message || '') });
  }
}
