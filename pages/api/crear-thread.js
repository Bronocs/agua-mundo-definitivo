// pages/api/crear-thread.js
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sólo POST permitido" });
  }
  const thread = await openai.beta.threads.create();
  res.status(200).json({ thread_id: thread.id });
}
