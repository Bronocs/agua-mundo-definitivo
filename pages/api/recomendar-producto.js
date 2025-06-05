import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ASSISTANT_ID = "asst_nrkvYYIR23vekIXMcNLv3FoF"; // tu assistant de Agua Mundo IA

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sólo POST permitido" });
  }

  const { consulta } = req.body;
  if (!consulta) {
    return res.status(400).json({ error: "Falta la consulta" });
  }

  try {
    // 1. Crear un nuevo thread (hilo de conversación)
    const thread = await openai.beta.threads.create();

    // 2. Agregar el mensaje del usuario (la consulta)
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: consulta
    });

    // 3. Ejecutar un run con tu assistant configurado
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // 4. Esperar a que el run termine (polling)
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (runStatus.status === "completed") break;
      await new Promise(res => setTimeout(res, 2000)); // espera 2s
    } while (["queued", "in_progress"].includes(runStatus.status));

    if (runStatus.status !== "completed") {
      return res.status(500).json({ sugerencias: "No se pudo completar la consulta." });
    }

    // 5. Recuperar el mensaje de respuesta
    const messages = await openai.beta.threads.messages.list(thread.id);
    // La última respuesta es la del assistant
    const lastMessage = messages.data.reverse().find(m => m.role === "assistant");
    const respuesta = lastMessage ? lastMessage.content[0].text.value : "Sin respuesta";

    res.status(200).json({ sugerencias: respuesta });
  } catch (e) {
    console.error("Error con OpenAI Assistant:", e);
    res.status(500).json({ sugerencias: "No se pudo obtener respuesta. " + (e?.message || '') });
  }
}
