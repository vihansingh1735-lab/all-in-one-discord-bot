const express = require("express");
const app = express();

const Discord = require("discord.js");
const chalk = require("chalk");
require("dotenv").config();
const axios = require("axios");

const webhook = require("./config/webhooks.json");
const config = require("./config/bot.js");

const webHooksArray = [
  "startLogs", "shardLogs", "errorLogs", "dmLogs", "voiceLogs",
  "serverLogs", "serverLogs2", "commandLogs", "consoleLogs",
  "warnLogs", "voiceErrorLogs", "creditLogs", "evalLogs", "interactionLogs"
];

// ENV webhook override
if (process.env.WEBHOOK_ID && process.env.WEBHOOK_TOKEN) {
  for (const webhookName of webHooksArray) {
    webhook[webhookName].id = process.env.WEBHOOK_ID;
    webhook[webhookName].token = process.env.WEBHOOK_TOKEN;
  }
}

console.clear();
console.log(chalk.blue.bold("System"), ">>", chalk.green("Starting up..."));
console.log(chalk.blue.bold("System"), ">>", chalk.red(`Version ${require("../package.json").version}`), "loaded");

// ===== EXPRESS (ONLY ONE) =====
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("OK");
});

// ===== START BOT ONCE =====
require("./bot");

// ===== START SERVER ONCE =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ===== WEBHOOK CLIENTS =====
const consoleLogs = new Discord.WebhookClient({
  id: webhook.consoleLogs.id,
  token: webhook.consoleLogs.token,
});

const warnLogs = new Discord.WebhookClient({
  id: webhook.warnLogs.id,
  token: webhook.warnLogs.token,
});

// ===== ERROR HANDLING =====
process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);

  if (!error?.stack) return;

  const embed = new Discord.EmbedBuilder()
    .setTitle("🚨・Unhandled promise rejection")
    .addFields(
      { name: "Error", value: Discord.codeBlock(String(error).slice(0, 950)) },
      { name: "Stack", value: Discord.codeBlock(error.stack.slice(0, 950)) }
    );

  consoleLogs.send({ embeds: [embed] }).catch(() => {});
});

process.on("warning", warn => {
  const embed = new Discord.EmbedBuilder()
    .setTitle("🚨・Warning")
    .addFields({ name: "Warn", value: Discord.codeBlock(String(warn)) });

  warnLogs.send({ embeds: [embed] }).catch(() => {});
});
