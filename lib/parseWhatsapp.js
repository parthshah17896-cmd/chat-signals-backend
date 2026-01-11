import dayjs from "dayjs";

export function parseWhatsappChat(text) {
  const lines = text.split("\n");
  const messages = [];

  const regex =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2})\s?(am|pm)? - (.*?): (.*)$/i;

  for (const line of lines) {
    const match = line.match(regex);
    if (!match) continue;

    const [, date, time, meridian, sender, message] = match;

    messages.push({
      sender: sender.trim(),
      message: message.trim(),
      timestamp: dayjs(`${date} ${time} ${meridian || ""}`)
    });
  }

  return messages;
}
