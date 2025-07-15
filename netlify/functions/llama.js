const fetch = require("node-fetch");

const handler = async (event) => {
  const HF_API_KEY = process.env.HF_API_KEY;
  const body = JSON.parse(event.body || "{}");
  const prompt = body.prompt;

  if (!HF_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "❌ Server error: Missing Hugging Face API key." }),
    };
  }

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: "⚠️ No prompt provided." }),
    };
  }

  try {
    const response = await fetch("https://api-inference.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: `❌ API Error: ${raw}` }),
      };
    }

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "❌ Could not parse model response." }),
      };
    }

    const reply = result?.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: reply && reply.trim() !== ""
          ? reply
          : "⚠️ Model did not return a response."
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: `❌ Unexpected error: ${error.message}` }),
    };
  }
};

module.exports = { handler };
