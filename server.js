
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "IRON MAN AI", mode: "gemini" });
});

app.post("/chat", async (req, res) => {
  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message) {
    return res.status(400).json({
      error: "Please enter a question."
    });
  }

  if (message.length > 4000) {
    return res.status(413).json({
      error: "Question is too long. Please shorten it."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is missing in server settings."
    });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are IRON MAN AI, a helpful B.Pharm study assistant.
Answer questions about B.Pharm subjects, including Human Anatomy and Physiology, Pharmaceutics, Pharmaceutical Chemistry, Pharmaceutical Analysis, Pharmacology, Pharmacognosy, Biochemistry, Pharmaceutical Microbiology and other pharmacy subjects.

Give accurate, structured, exam-oriented answers.
If the user requests 2, 5 or 10 marks, adjust the answer length accordingly.
Include definitions, headings, examples, tables and stepwise calculations when useful.
Explain difficult concepts in simple Hindi or Hinglish when asked.
Write exam answers in clear English when requested.
Never invent textbook references or pretend to know the user's exact syllabus.
For medical or medicine-related questions, provide educational information, explain important safety limits, and do not replace a qualified healthcare professional.
If unsure, say so clearly.`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1400
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status);

      if (response.status === 429) {
        return res.status(429).json({
          error: "Gemini limit reached. Please wait and try again later."
        });
      }

      return res.status(502).json({
        error: "Gemini could not answer. Check API access and model availability."
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({
        error: "No answer received. Please try again."
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("Gemini connection failed:", error.message);

    return res.status(502).json({
      error: "Could not connect to Gemini. Please try again."
    });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`IRON MAN AI running on port ${port}`);
});
