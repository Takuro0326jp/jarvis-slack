import OpenAI from "openai"

export default async function handler(req, res) {

  try {

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body

    // Slack URL verification
    if (body?.type === "url_verification") {
      return res.status(200).json({
        challenge: body.challenge
      })
    }

    // Slackイベント
    if (body?.event?.type === "app_mention") {

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })

      const text = body.event.text.replace(/<@.*?>/, "").trim()

      const ai = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "user", content: text }
        ]
      })

      return res.status(200).json({
        text: ai.choices[0].message.content
      })
    }

    return res.status(200).send("ok")

  } catch (err) {

    console.error(err)

    return res.status(200).send("ok")

  }

}