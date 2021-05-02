import fs from "fs";
import fetch from "node-fetch";
const jsonPath = "./logs/chatIds.json";

const notifyTelegram = async (message) => {
  // bot subscribers so far
  const savedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  // get new bot subscribers from last 24hours
  const { result } = await getChatUpdates();

  const chatIds = [
    ...new Set(
      savedData.concat(result.map((chatUpdate) => chatUpdate.message.chat.id))
    ),
  ];

  // save updated list of bot subscibers
  fs.writeFileSync(jsonPath, JSON.stringify(chatIds));
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
