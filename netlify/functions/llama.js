export async function handler(event, context) {
  console.log("✅ Function triggered");

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const prompt = body.prompt;

    if (!prompt) {
      console.log("⚠️ No prompt received.");
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "⚠️ No prompt provided." })
      };
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      console.log("❌ Missing Hugging Face token.");
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "❌ Server error: missing API token." })
      };
    }

   const res = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${HF_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    inputs: prompt,
    parameters: {
      max_new_tokens: 200,
      temperature: 0.7
    }
  })
});

const rawText = await res.text();

if (!res.ok) {
  console.error("❌ Hugging Face API error:", rawText);
  return {
    statusCode: 500,
    body: JSON.stringify({ reply: `❌ API Error: ${rawText}` })
  };
}

let result;
try {
  result = JSON.parse(rawText);
} catch (e) {
  console.error("❌ JSON parse error:", rawText);
  return {
    statusCode: 500,
    body: JSON.stringify({ reply: "❌ Server error: Could not parse response." })
  };
}

const reply = result?.[0]?.generated_text;

return {
  statusCode: 200,
  body: JSON.stringify({
    reply: reply || "⚠️ Model did not return a response."
  })
};
