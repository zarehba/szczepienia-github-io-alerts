import fetch from "node-fetch";

const notifyTelegram = async (message) => {
  const { result } = await getChatUpdates();
  const chatIds = [
    ...new Set(result.map((chatUpdate) => chatUpdate.message.chat.id)),
  ];
  // send the message to all chats
  chatIds.forEach((chatId) => sendTelegramMsg(message, chatId));
};

const sendTelegramMsg = async (message, chatId) => {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=html`,
    { method: "POST" }
  )
    .then(() => {
      console.log("Telegram notification sent");
    })
    .catch((err) => {
      console.error("Telegram notification error:", err);
    });
};

const getChatUpdates = async () =>
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getUpdates`,
    { method: "GET" }
  )
    .then((data) => data.json())
    .catch((err) => {
      console.error("Telegram notification error:", err);
    });

export default notifyTelegram;
