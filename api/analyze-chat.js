import { parseWhatsappChat } from "../lib/parseWhatsapp";
import { extractMetrics } from "../lib/extractMetrics";
import { analyzeSignals } from "../lib/ruleEngine";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { chatText, userName } = req.body;

    if (!chatText || !userName) {
      return res.status(400).json({ error: "Missing input" });
    }

    res.setHeader("Cache-Control", "no-store");

    const messages = parseWhatsappChat(chatText);
    const metrics = extractMetrics(messages, userName);
    const analysis = analyzeSignals(metrics);

    res.json({
      ...analysis,
      meta: {
        messages_analyzed: messages.length,
        other_person: metrics.otherPerson
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Analysis failed" });
  }
}
