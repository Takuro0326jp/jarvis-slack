import 'dotenv/config'
import pkg from "@slack/bolt"
import OpenAI from "openai"

const { App, ExpressReceiver } = pkg

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

receiver.router.post("/slack/events", (req, res, next) => {
  if (req.body.type === "url_verification") {
    return res.json({ challenge: req.body.challenge })
  }
  next()
})

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.event("app_mention", async ({ event, say }) => {

  const text = event.text.replace(/<@.*?>/, "").trim()

  const ai = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "user", content: text }
    ]
  })

  await say(ai.choices[0].message.content)

})

await app.start(3333)

console.log("⚡ Jarvis running")