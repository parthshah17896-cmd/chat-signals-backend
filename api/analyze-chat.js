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

  // 🔹 TEMP SAMPLE RESPONSE (replace with real logic later)
  return res.status(200).json({
    interest_from_them: "Medium",
    interest_from_you: "High",
    friendzone_risk: "Medium",
    summary: "Sample analysis response",
    green_flags: ["Replies consistently"],
    red_flags: ["Low initiative"],
    advice: "Take it slow"
  });
}
