export default async function handler(req, res) {
  // 🔹 CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔹 Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🔹 Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chatText, userName } = req.body;

  if (!chatText || !userName) {
    return res.status(400).json({ error: "Missing data" });
  }

  // 🔹 TEMP SAMPLE RESPONSE (can be replaced with logic later)
  return res.status(200).json({
    interest_from_them: "Medium",
    interest_from_you: "High",
    friendzone_risk: "Medium",

    summary:
      "There are mixed signals in this interaction. Engagement exists, but initiative and emotional depth are not fully balanced yet.",

    // ✅ MORE DETAILED POSITIVE SIGNALS
    green_reasons: [
      "They respond with reasonable consistency rather than long unexplained gaps",
      "Conversations usually flow without feeling forced or one-sided",
      "There is some curiosity shown through follow-up questions or reactions",
      "Tone remains friendly and comfortable rather than cold or distant"
    ],

    // ✅ RENAMED IN UI AS “THINGS TO WATCH”
    watch_reasons: [
      "You may be initiating conversations more often than they do",
      "Depth of conversation varies and sometimes stays surface-level",
      "Romantic intent is not clearly expressed yet",
      "Momentum does not always build naturally over time"
    ],

    // ✅ ROMANTIC VS FRIENDLY VIBE
    vibe: "Mixed", // Romantic | Mixed | Friendly

    // ✅ TREND OVER TIME
    trend: "Stable", // Improving | Stable | Declining

    advice:
      "Try easing back slightly on initiation and see if they step forward. Gradually introduce more personal topics and observe how they respond."
  });
}
