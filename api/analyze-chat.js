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

  // ---------------- CHAT PARSING ----------------
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

  // ---------------- SCORE CALCULATIONS ----------------
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
      ? "you are driving most of the interaction. "
      : "a fairly balanced exchange between both sides. ";

  summary +=
    otherQuestions > otherMessages * 0.25
      ? "There are clear moments of curiosity and engagement from them. "
      : "Curiosity from the other person appears limited. ";

  summary +=
    shortReplies > otherMessages * 0.5
      ? "Frequent short replies may restrict emotional depth."
      : "Replies generally allow conversations to flow naturally.";

  // ---------------- DYNAMIC SIGNALS ----------------
  const green_reasons = [];
  const watch_reasons = [];
  const advice = [];

  // POSITIVE SIGNALS
  if (otherQuestions > 0) {
    green_reasons.push(
      `They asked ${otherQuestions} questions, showing moments of curiosity and engagement.`
    );
  }

  if (otherMessages >= userMessages * 0.8) {
    green_reasons.push(
      `Message contribution is relatively balanced (${otherMessages} from them vs ${userMessages} from you).`
    );
  }

  if (shortReplies < otherMessages * 0.4) {
    green_reasons.push(
      "Most replies contain enough detail to sustain the conversation."
    );
  }

  // THINGS TO WATCH
  if (otherQuestions === 0) {
    watch_reasons.push(
      "They did not ask questions, which may indicate limited curiosity or emotional investment."
    );
  }

  if (userMessages > otherMessages * 1.5) {
    watch_reasons.push(
      `You initiated significantly more messages (${userMessages} vs ${otherMessages}), creating an effort imbalance.`
    );
  }

  if (shortReplies > otherMessages * 0.5) {
    watch_reasons.push(
      "A high proportion of short replies can reduce emotional momentum."
    );
  }

  // FALLBACKS (never empty)
  if (green_reasons.length === 0) {
    green_reasons.push(
      "The conversation remains steady without strong positive or negative extremes."
    );
  }

  if (watch_reasons.length === 0) {
    watch_reasons.push(
      "No immediate warning signs were detected in the conversation patterns."
    );
  }

  // ---------------- CONTEXTUAL NEXT STEPS ----------------
  if (userMessages > otherMessages * 1.5) {
    advice.push(
      "Reduce over-initiating temporarily and observe whether they take initiative."
    );
  }

  if (otherQuestions === 0) {
    advice.push(
      "Try asking an open-ended personal question and see if they engage more deeply."
    );
  }

  if (shortReplies > otherMessages * 0.5) {
    advice.push(
      "Keep your messages concise to encourage reciprocal effort rather than filling gaps."
    );
  }

  if (advice.length === 0) {
    advice.push(
      "Maintain the current rhythm while gradually introducing more meaningful topics."
    );
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
    advice
  });
}
