# szczepienia-github-io-alerts
Webscraping https://szczepienia.github.io/ for data then sending alerts with new data meeting filter criteria.

Filter criteria can be set in [index.js](index.js) file.

Alerts are send using Telegram API.
In order to send Telegram alerts, a TELEGRAM_TOKEN environment variable has to be set in .env file.
Setting up a Telegram chat bot takes under a minute, see: https://core.telegram.org/bots
