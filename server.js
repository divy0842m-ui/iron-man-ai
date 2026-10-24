import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "IRON MAN AI", mode: "free" });
});

function getReply(message) {
  const m = message.toLowerCase();

  if (/^(hi|hello|hey|namaste|hii)\b/.test(m)) {
    return "Namaste! Main IRON MAN AI hoon. Aap Hindi mein mujhse baat kar sakte hain. Main basic questions aur B.Pharm study topics mein help kar sakta hoon.";
  }

  if (m.includes("who are you") || m.includes("tum kaun")) {
    return "Main IRON MAN AI hoon, ek assistant jo aapki help ke liye bana hai. Main Hindi mein jawab de sakta hoon aur B.Pharm ke basic study topics samjha sakta hoon.";
  }

  if (m.includes("preservative") || m.includes("microbial spoilage")) {
    return "Pharmaceutical preservatives microbial growth ko rokne ya kam karne mein madad karte hain. Examples: methylparaben, propylparaben, benzalkonium chloride aur benzoic acid. Selection formulation, concentration, pH aur safety par depend karta hai. Exam ke liye definition, types, examples aur uses likhein.";
  }

  if (m.includes("microbiology")) {
    return "Pharmaceutical Microbiology mein microorganisms, sterilization, disinfection, microbial contamination aur preservation jaise topics aate hain. Apna specific topic bhejo, main basic explanation de sakta hoon.";
  }

  if (m.includes("pharmaceutics")) {
    return "Pharmaceutics medicines ki formulation, preparation aur dosage forms ka study hai. Apna specific topic batao, main uske notes banane mein help karunga.";
  }

  if (m.includes("biochemistry")) {
    return "Biochemistry living organisms mein hone wale chemical processes ka study hai. Important topics mein carbohydrates, proteins, lipids, enzymes aur metabolism shamil hain. Kaunsa topic padhna hai?";
  }

  if (m.includes("thank")) {
    return "You're welcome! Aur koi basic question hai toh poochho.";
  }

  return "Bhai, main abhi free preset mode mein hoon. Mere paas full generative AI ya live internet access nahi hai. Apna question thoda specific likho—main supported topics par help karne ki koshish karunga.";
}

app.post("/chat", (req, res) => {
  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (message.length > 4000) {
    return res.status(413).json({ error: "Message too long." });
  }

  res.json({ reply: getReply(message) });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`IRON MAN AI running on port ${port}`);
});
