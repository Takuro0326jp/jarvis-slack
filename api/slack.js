import OpenAI from "openai"

export default async function handler(req, res) {

  const body = typeof req.body === "string"
    ? JSON.parse(req.body)
    : req.body

  // Slack challenge
  if (body?.type === "url_verification") {
    return res.status(200).json({
      challenge: body.challenge
    })
  }

  // Slackイベント
  if (body?.event?.type === "app_mention") {

    const text = body.event.text.replace(/<@.*?>/, "").trim()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const ai = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: text }]
    })

    // Slackに投稿
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({
        channel: body.event.channel,
        text: ai.choices[0].message.content
      })
    })

    return res.status(200).send("ok")
  }

  return res.status(200).send("ok")
}