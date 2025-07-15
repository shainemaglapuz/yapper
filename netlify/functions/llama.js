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

    const result = await res.json();

    console.log("🔍 Hugging Face response:", JSON.stringify(result, null, 2));

    const reply = result?.[0]?.generated_text;

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: reply || "⚠️ No reply from model."
      })
    };
  } catch (error) {
    console.error("❌ Server error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "❌ Server error: " + error.message })
    };
  }
}
