export async function handler(event, context) {
  const { prompt } = JSON.parse(event.body);
  const HF_API_KEY = process.env.HF_API_KEY;

  const res = await fetch("https://api-inference.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7
    })
  });

const result = await res.json();

const reply = result?.choices?.[0]?.message?.content;

return {
  statusCode: 200,
  body: JSON.stringify({
    reply: reply && reply.trim() !== ""
      ? reply
      : "⚠️ Sorry, I couldn't generate a proper response. Please try rephrasing your question."
  })
};

    })
  };
}
