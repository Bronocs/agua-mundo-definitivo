import OpenAI from "openai";
import fuzzysort from "fuzzysort";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = "asst_nrkvYYIR23vekIXMcNLv3FoF";

// Corrige solo subpalabras alfanuméricas que sean letras (no números ni símbolos)
function fuzzySoloLetrasAvanzado(consulta, keywordsProductos) {
  // Para máximo realismo: quitamos duplicados y ordenamos por longitud descendente
  const keywordsUnicas = Array.from(new Set(keywordsProductos)).sort((a, b) => b.length - a.length);

  // Divide cada palabra por espacios
  return consulta.split(/\s+/).map(fragmento => {
    // Separa en letras, números, y otros (ej: "vrida1" => ["vrida", "1"])
    const subpalabras = fragmento.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+|[0-9]+|[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9]+/g);
    if (!subpalabras) return fragmento;
    const corregido = subpalabras.map(sub => {
      if (/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+$/.test(sub)) {
        const r = fuzzysort.go(sub.toLowerCase(), keywordsUnicas, { threshold: -1000 });
        // El score depende del tamaño, -2 para palabras cortas y -4 para medianas/largas
        if (r.total > 0 && r[0].score >= -4) return r[0].target;
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

  // Armamos la lista de keywords con nombres de productos, en minúsculas y sin tildes
  const keywordsProductos = productos.map(p =>
    p.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  );

  // 1. Corrige la consulta SOLO las subpalabras de letras
  const consultaCorregida = fuzzySoloLetrasAvanzado(
    consulta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
    keywordsProductos
  );

  // Puedes loggear para verificar:
  console.log("Consulta original:", consulta);
  console.log("Consulta corregida:", consultaCorregida);

  // 2. Envía consulta corregida tal cual (sin sugerencias extra ni prompt largo)
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
