export default async function handler(req, res) {
  // ---------------- CORS ----------------
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chatText, userName } = req.body;
  if (!chatText || !userName) {
    return res.status(400).json({ error: "Missing chatText or userName" });
  }

  // ---------------- HELPERS ----------------
  const safeLower = (s) => (s || "").toString().toLowerCase();

  const romanticEmojis = ["🧡", "😍", "😘", "💋", "💖", "🥰", "❣", "💕", "💞", "💓", "💘", "💝"];

  const meetKeywords = [
    "meet", "coffee", "hang out", "hangout", "see you", "come over", "plan",
    "milte", "milna", "chal", "chale", "चल", "मिलते", "मिलना", "plan kare", "plan karte"
  ];

  const followUpPhrases = [
    "tell me more", "how did that make you feel", "what happened next",
    "aur bata", "aur batao", "phir kya hua", "fir kya hua"
  ];

  const validatePhrases = [
    "that makes sense", "i understand", "i get it", "i can understand",
    "samajh aaya", "samajh gaya", "makes sense", "i hear you"
  ];

  const futurePhrases = [
    "next time", "we should", "i'd love to", "we will", "soon we",
    "kal", "phir", "fir", "next", "plan karte"
  ];

  const teasingPhrases = ["haha", "lol", "lmao", "😂", "🤣", "😄", "😆"];

  const friendLabels = ["buddy", "pal", "bro", "friend", "bestie", "bhai", "yaar"];

  // ---------------- PARSING ----------------
  const lines = chatText.split("\n").filter(Boolean);

  let userMessages = 0;
  let otherMessages = 0;
  let userQuestions = 0;
  let otherQuestions = 0;
  let shortReplies = 0;

  let romanticEmojiOther = 0;
  let romanticEmojiUser = 0;

  let meetMentionsOther = 0;
  let meetMentionsUser = 0;

  let followUpsOther = 0;
  let followUpsUser = 0;

  let validationsOther = 0;
  let validationsUser = 0;

  let futureTalkOther = 0;
  let futureTalkUser = 0;

  let humorOther = 0;
  let humorUser = 0;

  let friendLabelOther = 0;

  lines.forEach((line) => {
    if (!line.includes(":")) return;

    const isUser = line.includes(`${userName}:`);
    const msg = line.split(":").slice(1).join(":").trim();
    if (!msg) return;

    const msgLower = safeLower(msg);

    // message counts
    if (isUser) {
      userMessages++;
      if (msg.includes("?")) userQuestions++;
    } else {
      otherMessages++;
      if (msg.includes("?")) otherQuestions++;
      if (msg.length < 15) shortReplies++;
    }

    // emoji signals
    romanticEmojis.forEach((e) => {
      if (msg.includes(e)) {
        if (isUser) romanticEmojiUser++;
        else romanticEmojiOther++;
      }
    });

    // meet mentions
    meetKeywords.forEach((k) => {
      if (msgLower.includes(k)) {
        if (isUser) meetMentionsUser++;
        else meetMentionsOther++;
      }
    });

    // follow-up questions / active listening phrases
    followUpPhrases.forEach((p) => {
      if (msgLower.includes(p)) {
        if (isUser) followUpsUser++;
        else followUpsOther++;
      }
    });

    // validation / empathy
    validatePhrases.forEach((p) => {
      if (msgLower.includes(p)) {
        if (isUser) validationsUser++;
        else validationsOther++;
      }
    });

    // future language
    futurePhrases.forEach((p) => {
      if (msgLower.includes(p)) {
        if (isUser) futureTalkUser++;
        else futureTalkOther++;
      }
    });

    // humor style
    teasingPhrases.forEach((p) => {
      if (msgLower.includes(p)) {
        if (isUser) humorUser++;
        else humorOther++;
      }
    });

    // friend-zone labels from OTHER
    if (!isUser) {
      friendLabels.forEach((p) => {
        if (msgLower.includes(p)) friendLabelOther++;
      });
    }
  });

  const totalMessages = userMessages + otherMessages || 1;

  // ---------------- PERCENTAGES ----------------
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
        (shortReplies / Math.max(otherMessages, 1)) * 30 +
        (friendLabelOther > 0 ? 10 : 0)
    )
  );

  const vibePercent = Math.min(
    100,
    Math.round(
      interestFromThemPercent * 0.55 +
        Math.min(25, romanticEmojiOther * 6) +
        Math.min(20, meetMentionsOther * 5)
    )
  );

  const level = (p) => (p >= 70 ? "High" : p >= 40 ? "Medium" : "Low");

  const interest_from_them = level(interestFromThemPercent);
  const interest_from_you = level(interestFromYouPercent);
  const friendzone_risk = level(friendzoneRiskPercent);

  const vibe =
    vibePercent >= 70 ? "Romantic" : vibePercent >= 40 ? "Mixed" : "Friendly";

  const trend = shortReplies > otherMessages * 0.6 ? "Declining" : "Stable";

  // ---------------- SUMMARY (DYNAMIC) ----------------
  let summary = "The conversation shows ";

  summary +=
    userMessages > otherMessages
      ? "you are putting in more effort to keep the chat moving. "
      : "a relatively balanced exchange of effort. ";

  summary +=
    otherQuestions > 0 || followUpsOther > 0
      ? "There are signs of curiosity and active listening from them. "
      : "their curiosity feels limited in the current flow. ";

  summary +=
    romanticEmojiOther > 0 || meetMentionsOther > 0
      ? "There are hints of warmth and possible romantic interest. "
      : "the tone feels more neutral/friendly overall. ";

  summary +=
    shortReplies > otherMessages * 0.5
      ? "Some replies feel brief, which can reduce depth."
      : "responses generally allow the conversation to build naturally.";

  // ---------------- NEW INDICATORS (DETECTED) ----------------

  // ✅ GREEN FLAGS
  const green_flags_detected = [];

  // Communication Patterns
  if (otherQuestions > 0 || followUpsOther > 0) {
    green_flags_detected.push("Asks follow-up questions (shows genuine interest and active listening)");
  }
  if (otherMessages >= userMessages * 0.8) {
    green_flags_detected.push("Balanced initiation (mutual effort and non-needy dynamic)");
  }

  // Emotional Intelligence
  if (validationsOther > 0) {
    green_flags_detected.push("Validates feelings (emotional safety and empathy)");
  }

  // Investment & Intention
  if (futureTalkOther > 0) {
    green_flags_detected.push("Future-oriented language (shows planning mindset and potential intent)");
  }
  if (meetMentionsOther > 0) {
    green_flags_detected.push("Initiates meet/hangout plans (real-world intention signal)");
  }

  // Value Alignment
  if (humorOther > 0 && humorUser > 0) {
    green_flags_detected.push("Shared humor style (compatibility and comfort indicator)");
  }

  if (green_flags_detected.length === 0) {
    green_flags_detected.push("No strong green flags detected yet (interaction still neutral/early-stage)");
  }

  // ✅ RED FLAGS
  const red_flags_detected = [];

  // Communication Red Flags
  if (otherQuestions === 0 && followUpsOther === 0) {
    red_flags_detected.push("Consistently avoids questions (low curiosity / evasive pattern)");
  }
  if (userMessages > otherMessages * 1.7) {
    red_flags_detected.push("Monopolizing conversation (effort imbalance / one-sided dynamic)");
  }
  if (shortReplies > otherMessages * 0.55) {
    red_flags_detected.push("Low-effort replies (reduces emotional depth and momentum)");
  }

  // Value/Respect Red Flags (light-weight detection)
  // (No harsh assumptions; only text-pattern level)
  const disrespectHints = ["shut up", "stupid", "pagal", "idiot", "dum", "bakwas"];
  const hasDisrespect = lines.some((l) => {
    const msg = safeLower(l.split(":").slice(1).join(":").trim());
    return disrespectHints.some((w) => msg.includes(w));
  });
  if (hasDisrespect) {
    red_flags_detected.push("Disrespectful language (can harm emotional safety)");
  }

  if (red_flags_detected.length === 0) {
    red_flags_detected.push("No major red flags detected in the current chat patterns");
  }

  // ✅ FRIENDZONE RISK INDICATORS
  const friendzone_risk_indicators = [];

  if (romanticEmojiOther === 0 && vibe === "Friendly") {
    friendzone_risk_indicators.push("Zero flirtation (tone stays platonic)");
  }
  if (friendLabelOther > 0) {
    friendzone_risk_indicators.push("Platonic labels used (may indicate friend-framing)");
  }
  if (meetMentionsOther === 0 && meetMentionsUser > 0) {
    friendzone_risk_indicators.push("Meeting initiative is one-sided (they don’t actively suggest one-on-one plans)");
  }

  if (friendzone_risk_indicators.length === 0) {
    friendzone_risk_indicators.push("No strong friendzone indicators detected right now");
  }

  // ✅ COMPATIBILITY SIGNALS
  const compatibility_signals = [];

  if (humorOther > 0 && humorUser > 0) {
    compatibility_signals.push("Similar humor patterns (comfortable dynamic)");
  }
  if (otherQuestions > 0 || followUpsOther > 0) {
    compatibility_signals.push("Matching communication depth (conversation develops beyond basics)");
  }
  if (futureTalkOther > 0) {
    compatibility_signals.push("Shared values / future mindset appears possible (planning language shows alignment potential)");
  }

  if (compatibility_signals.length === 0) {
    compatibility_signals.push("Compatibility signals are unclear at this stage (need more data over time)");
  }

  // ---------------- OLD LISTS (KEEP) ----------------
  // We keep these so your existing UI doesn't break.
  // But now they are derived from the new indicators (and vary per chat).
  const green_reasons = green_flags_detected.slice(0, 4);
  const watch_reasons = red_flags_detected.slice(0, 4);

  // ✅ Remove suggested next steps: we return an empty array for safety
  const advice = [];

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

    // Existing arrays used in UI
    green_reasons,
    watch_reasons,
    advice,

    // NEW indicator groups (more detailed)
    green_flags_detected,
    red_flags_detected,
    friendzone_risk_indicators,
    compatibility_signals
  });
}
