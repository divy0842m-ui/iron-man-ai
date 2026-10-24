// IRON MAN AI secure backend — Node.js 20+
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || true }));
app.use(express.json({ limit: "20kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", app: "IRON MAN AI" }));

app.post("/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) return res.status(400).json({ error: "Message is required." });
    if (message.length > 4000) return res.status(413).json({ error: "Message too long (max 4000 characters)." });

    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(500).json({ error: "Server API key is not configured. Add OPENAI_API_KEY in host environment variables." });

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: "You are IRON MAN AI, a helpful, safe, friendly assistant inspired by a futuristic Stark-style interface. Reply in natural Hindi/Hinglish when the user writes Hindi/Hinglish; otherwise follow their language. Be accurate and clear. For B.Pharm questions, explain educationally and structure exam answers when asked. Do not claim to control real devices or be Tony Stark.",
        input: message,
        max_output_tokens: 700
      })
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      const detail = data?.error?.message || `AI provider error (${upstream.status})`;
      return res.status(upstream.status === 429 ? 429 : 502).json({ error: detail });
    }
    const reply = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n").trim();
    if (!reply) return res.status(502).json({ error: "AI provider returned no text." });
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Unexpected backend error." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`IRON MAN AI backend listening on ${port}`));
