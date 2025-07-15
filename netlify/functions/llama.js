const fetch = require("node-fetch");
//redeploy
const handler = async (event, context) => {
  console.log("✅ Function triggered");

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "⚠️ No prompt provided." })
      };
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "❌ Server error: missing API token." })
      };
    }

    const response = await fetch("https://api-inference.huggingface.co/models/bigscience/bloom-560m", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error("❌ API Error:", raw);
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: `❌ API Error: ${raw}` })
      };
    }

    let result;
    try {
      result = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON parse error:", raw);
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "❌ Server error: Invalid JSON response from model." })
      };
    }

    const reply = result?.[0]?.generated_text || "⚠️ No response from model.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error("❌ Server error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: `❌ Unexpected error: ${error.message}` })
    };
  }
};

module.exports = { handler };
