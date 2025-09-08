const axios = require("axios");

const loading = (userId) => {
  return axios({
    method: "post",
    url: "https://api.line.me/v2/bot/chat/loading/start",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
    },
    data: { chatId: userId },
  });
};

module.exports = { loading };
