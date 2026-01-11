export function extractMetrics(messages, userName) {
  const participants = [...new Set(messages.map(m => m.sender))];
  const otherPerson = participants.find(p => p !== userName);

  const stats = {
    user: baseStats(),
    other: baseStats(),
    initiations: { user: 0, other: 0 }
  };

  let lastSender = null;
  let lastTime = null;

  messages.forEach(m => {
    const role = m.sender === userName ? "user" : "other";
    const text = m.message;

    stats[role].messages++;
    stats[role].totalLength += text.length;

    if (text.includes("?")) stats[role].questions++;
    if (/[😊😂😍❤️😉😅]/.test(text)) stats[role].emojis++;

    if (lastSender && lastSender !== m.sender) {
      const gap = m.timestamp.diff(lastTime, "minute");

      if (gap > 240) stats.initiations[role]++;
      stats[role].responseTimes.push(gap);
    }

    lastSender = m.sender;
    lastTime = m.timestamp;
  });

  finalize(stats);

  return { ...stats, otherPerson };
}

function baseStats() {
  return {
    messages: 0,
    totalLength: 0,
    questions: 0,
    emojis: 0,
    responseTimes: [],
    avgLength: 0,
    avgResponse: null
  };
}

function finalize(stats) {
  ["user", "other"].forEach(key => {
    const s = stats[key];
    s.avgLength = s.messages ? s.totalLength / s.messages : 0;
    s.avgResponse = s.responseTimes.length
      ? s.responseTimes.reduce((a, b) => a + b, 0) / s.responseTimes.length
      : null;
  });
}
