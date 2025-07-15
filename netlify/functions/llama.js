const fetch = require("node-fetch"); // Make sure node-fetch@2 is installed

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

    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ API Error:", text);
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: `❌ API Error: ${text}` })
      };
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("❌ Response is not valid JSON:", text);
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "❌ Server error: Unable to parse model output." })
      };
    }

    const reply = result?.[0]?.generated_text || "⚠️ No response from model.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: `❌ Unexpected error: ${error.message}` })
    };
  }
};

module.exports = { handler };
