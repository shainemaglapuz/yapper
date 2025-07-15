export async function handler(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);
    const HF_API_KEY = process.env.HF_API_KEY;

    const res = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
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

    console.log("🔍 Hugging Face raw response:", JSON.stringify(result, null, 2));

    const reply = result?.[0]?.generated_text;

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: reply && reply.trim() !== ""
          ? reply
          : "⚠️ Still no reply from the model. Try again with a different question."
      })
    };
  } catch (error) {
    console.error("❌ Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "❌ Server error: " + error.message })
    };
  }
}
