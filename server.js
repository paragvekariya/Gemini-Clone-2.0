export async function handler() {
  const API_KEY = process.env.API_KEY; 

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "API key safely hidden & working"
    })
  };
}
