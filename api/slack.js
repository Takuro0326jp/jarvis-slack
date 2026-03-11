import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req, res) {

  const body = req.body

  // Slack URL verification
  if (body.type === "url_verification") {
    return res.status(200).send(body.challenge)
  }

  if (body.event && body.event.type === "app_mention") {

    const text = body.event.text.replace(/<@.*?>/, "").trim()

    const ai = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: text }]
    })

    return res.status(200).json({
      text: ai.choices[0].message.content
    })

  }

  return res.status(200).send("ok")
}