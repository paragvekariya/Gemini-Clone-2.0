export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const { prompt } = JSON.parse(event.body || "{}");

  if (!prompt) {
    return {
      statusCode: 400,
      body: "Prompt missing"
    };
  }

  const API_KEY = process.env.API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
    })
  };
}
