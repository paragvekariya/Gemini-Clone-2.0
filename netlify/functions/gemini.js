export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Gemini API key missing" }),
      };
    }

    const { prompt } = JSON.parse(event.body || "{}");

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}" +
      API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt || "Hello Gemini" }],
          },
        ],
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
