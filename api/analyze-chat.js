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
    return res.status(400).json({ error: "Missing data" });
  }

  // ---------------- PARSING ----------------
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

  // ---------------- METRICS (0–100) ----------------
  const interestFromThemPercent = Math.min(
    100,
    Math.round(
      (otherQuestions / Math.max(otherMessages, 1)) * 50 +
      ((otherMessages / totalMessages) * 50)
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

  // ---------------- LABELS ----------------
  const label = (p) => (p >= 70 ? "High" : p >= 40 ? "Medium" : "Low");

  const interest_from_them = label(interestFromThemPercent);
  const interest_from_you = label(interestFromYouPercent);
  const friendzone_risk = label(friendzoneRiskPercent);

  const vibe =
    vibePercent >= 70 ? "Romantic" : vibePercent >= 40 ? "Mixed" : "Friendly";

  const trend =
    shortReplies > otherMessages * 0.6 ? "Declining" : "Stable";

  // ---------------- SUMMARY ----------------
  let summary = "The conversation shows ";

  summary +=
    userMessages > otherMessages
      ? "uneven initiation, with you driving most interactions. "
      : "balanced participation between both sides. ";

  summary +=
    otherQuestions > otherMessages * 0.25
      ? "There are clear signs of curiosity and engagement. "
      : "Curiosity from the other person appears limited. ";

  summary +=
    shortReplies > otherMessages * 0.5
      ? "Replies are often brief, which may restrict emotional depth."
      : "Replies generally show effort and allow conversations to develop.";

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

    green_reasons: [
      otherQuestions > otherMessages * 0.25
        ? "They ask follow-up questions, indicating curiosity"
        : "They maintain consistent replies",
      shortReplies <= otherMessages * 0.5
        ? "Replies show reasonable effort"
        : "Conversation continuity is maintained",
      userMessages <= otherMessages * 1.3
        ? "Initiation feels reasonably balanced"
        : "You actively keep the conversation going",
    ],

    watch_reasons: [
      userMessages > otherMessages * 1.3
        ? "You initiate most conversations"
        : "Initiation patterns fluctuate",
      shortReplies > otherMessages * 0.5
        ? "Replies are often short or low-effort"
        : "Depth varies by topic",
      otherQuestions <= otherMessages * 0.25
        ? "Limited curiosity shown through questions"
        : "Curiosity is inconsistent",
    ],

    advice:
      "Ease back slightly on initiation and observe if effort increases. Introduce more personal topics gradually and note how engagement changes."
  });
}
