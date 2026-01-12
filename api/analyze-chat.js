export default async function handler(req, res) {
  // ---------------- CORS ----------------
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chatText, userName } = req.body;

  if (!chatText || !userName) {
    return res.status(400).json({ error: "Missing chatText or userName" });
  }

  // ---------------- BASIC CHAT PARSING ----------------
  const lines = chatText.split("\n").filter(Boolean);

  let userMessages = 0;
  let otherMessages = 0;
  let userQuestions = 0;
  let otherQuestions = 0;
  let shortReplies = 0;

  lines.forEach((line) => {
    if (!line.includes(":")) return;

    const isUser = line.includes(`${userName}:`);
    const message = line.split(":").slice(1).join(":").trim();

    if (!message) return;

    if (isUser) {
      userMessages++;
      if (message.includes("?")) userQuestions++;
    } else {
      otherMessages++;
      if (message.includes("?")) otherQuestions++;
      if (message.length < 15) shortReplies++;
    }
  });

  const totalMessages = userMessages + otherMessages || 1;

  // ---------------- PERCENTAGE METRICS ----------------
  const interestFromThemPercent = Math.min(
    100,
    Math.round(
      (otherQuestions / Math.max(otherMessages, 1)) * 50 +
      (otherMessages / totalMessages) * 50
    )
  );

  const interestFromYouPercent = Math.min(
    100,
    Math.round((userMessages / totalMessages) * 100)
  );

  const friendzoneRiskPercent = Math.min(
    100,
    Math.round(
      100 -
        interestFromThemPercent +
        (shortReplies / Math.max(otherMessages, 1)) * 30
    )
  );

  const vibePercent = Math.min(
    100,
    Math.round(
      interestFromThemPercent * 0.7 +
        (otherQuestions / Math.max(otherMessages, 1)) * 30
    )
  );

  // ---------------- LABEL HELPERS ----------------
  const level = (p) => (p >= 70 ? "High" : p >= 40 ? "Medium" : "Low");

  const interest_from_them = level(interestFromThemPercent);
  const interest_from_you = level(interestFromYouPercent);
  const friendzone_risk = level(friendzoneRiskPercent);

  const vibe =
    vibePercent >= 70 ? "Romantic" : vibePercent >= 40 ? "Mixed" : "Friendly";

  const trend =
    shortReplies > otherMessages * 0.6 ? "Declining" : "Stable";

  // ---------------- DYNAMIC SUMMARY ----------------
  let summary = "The conversation shows ";

  summary +=
    userMessages > otherMessages
      ? "uneven initiation, with you driving most interactions. "
      : "balanced participation from both sides. ";

  summary +=
    otherQuestions > otherMessages * 0.25
      ? "There are clear signs of curiosity and engagement. "
      : "Curiosity from the other person appears limited. ";

  summary +=
    shortReplies > otherMessages * 0.5
      ? "Replies are often brief, which may limit emotional depth."
      : "Replies generally show effort and allow conversations to develop.";

  // ---------------- SAFE REASONS (ALWAYS ARRAYS) ----------------
  const green_reasons = [];
  const watch_reasons = [];

  if (otherQuestions > otherMessages * 0.25) {
    green_reasons.push(
      "They ask follow-up questions, indicating genuine curiosity"
    );
  } else {
    watch_reasons.push(
      "They rarely ask questions or probe deeper into conversations"
    );
  }

  if (shortReplies <= otherMessages * 0.5) {
    green_reasons.push(
      "Replies usually contain enough detail to continue the conversation"
    );
  } else {
    watch_reasons.push(
      "Replies are often short or low-effort"
    );
  }

  if (userMessages <= otherMessages * 1.3) {
    green_reasons.push(
      "Initiation feels relatively balanced over time"
    );
  } else {
    watch_reasons.push(
      "You initiate most conversations"
    );
  }

  if (green_reasons.length === 0) {
    green_reasons.push("Conversation maintains basic continuity");
  }

  if (watch_reasons.length === 0) {
    watch_reasons.push("No major negative patterns detected so far");
  }

  // ---------------- RESPONSE ----------------
  return res.status(200).json({
    interest_from_them,
    interest_from_you,
    friendzone_risk,

    interest_from_them_percent: interestFromThemPercent,
    interest_from_you_percent: interestFromYouPercent,
    friendzone_risk_percent: friendzoneRiskPercent,
    vibe_percent: vibePercent,

    vibe,
    trend,
    summary,

    green_reasons,
    watch_reasons,

    advice:
      "Ease back slightly on initiation and observe whether they step forward. Gradually introduce more personal topics and note how engagement changes."
  });
}
