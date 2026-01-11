export function analyzeSignals(data) {
  const { user, other, initiations } = data;

  const totalInitiations =
    initiations.user + initiations.other || 1;

  const otherInitiationRatio = initiations.other / totalInitiations;
  const otherQuestionRatio =
    other.questions / (other.messages || 1);

  let interestScore = 0;
  let friendzoneScore = 0;

  // Interest from them
  if (otherInitiationRatio >= 0.45) interestScore += 2;
  if (otherInitiationRatio <= 0.3) interestScore -= 2;

  if (other.avgResponse !== null && other.avgResponse < 60)
    interestScore += 2;
  if (other.avgResponse !== null && other.avgResponse > 240)
    interestScore -= 2;

  if (otherQuestionRatio >= 0.2) interestScore += 1;
  if (otherQuestionRatio < 0.1) interestScore -= 1;

  if (other.avgLength >= user.avgLength * 0.8)
    interestScore += 1;

  if (other.emojis > 0) interestScore += 1;

  // Friendzone risk
  if (initiations.user / totalInitiations > 0.7)
    friendzoneScore += 2;

  if (other.avgResponse && other.avgResponse > 240)
    friendzoneScore += 2;

  if (otherQuestionRatio < 0.1)
    friendzoneScore += 1;

  if (initiations.other === 0)
    friendzoneScore += 2;

  return {
    interest_from_them: bucketInterest(interestScore),
    interest_from_you: bucketInterest(-interestScore),
    friendzone_risk: bucketFriendzone(friendzoneScore),
    summary: summaryText(interestScore, friendzoneScore),
    green_flags: greenFlags(other, otherInitiationRatio, otherQuestionRatio),
    red_flags: redFlags(other, otherInitiationRatio, otherQuestionRatio),
    advice: adviceText(interestScore, friendzoneScore)
  };
}

function bucketInterest(score) {
  if (score >= 4) return "High";
  if (score >= 1) return "Medium";
  return "Low";
}

function bucketFriendzone(score) {
  if (score >= 5) return "Elevated";
  if (score >= 3) return "Medium";
  return "Low";
}

function greenFlags(other, initRatio, qRatio) {
  const flags = [];
  if (initRatio >= 0.4) flags.push("They initiate conversations");
  if (qRatio >= 0.2) flags.push("They ask follow-up questions");
  if (other.avgResponse && other.avgResponse < 120)
    flags.push("They respond within reasonable time");
  if (other.emojis > 0)
    flags.push("They use expressive language");
  return flags;
}

function redFlags(other, initRatio, qRatio) {
  const flags = [];
  if (initRatio < 0.3)
    flags.push("You initiate most conversations");
  if (other.avgResponse && other.avgResponse > 240)
    flags.push("Replies often come after long gaps");
  if (qRatio < 0.1)
    flags.push("Personal curiosity appears limited");
  if (other.avgLength < 15)
    flags.push("Replies are often brief");
  return flags;
}

function summaryText(interest, friendzone) {
  if (friendzone >= 5)
    return "Engagement appears one-sided with limited initiative from them.";
  if (interest >= 4)
    return "There are strong engagement signals and balanced interaction.";
  return "There are mixed signals with uneven participation over time.";
}

function adviceText(interest, friendzone) {
  if (friendzone >= 5)
    return "Consider easing back slightly and observe whether initiative becomes more balanced.";
  if (interest >= 4)
    return "Maintain the current balance and allow the connection to develop naturally.";
  return "Observe consistency over time rather than relying on isolated interactions.";
}
