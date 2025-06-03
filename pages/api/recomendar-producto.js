import { OpenAIApi, Configuration } from "openai";
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Sólo POST permitido" });
  res.status(200).json({ sugerencias: "¡El endpoint funciona correctamente!" });
}

