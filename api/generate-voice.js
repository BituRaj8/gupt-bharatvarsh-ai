export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        service: "free-voice",
        provider: "AI4Bharat Indic-TTS"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const {
      text,
      language = "hi",
      speaker = "male"
    } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    /*
      IMPORTANT:
      FREE_TTS_SERVER_URL will point to your
      separate AI4Bharat TTS server.

      Example:
      https://your-free-tts-server.example.com
    */

    const serverUrl =
      process.env.FREE_TTS_SERVER_URL;

    if (!serverUrl) {
      return res.status(500).json({
        error: "FREE_TTS_SERVER_URL is not configured",
        message:
          "Free TTS server URL Vercel Environment Variables me add karo."
      });
    }

    const response = await fetch(
      `${serverUrl.replace(/\/$/, "")}/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          text: text.trim(),
          language,
          speaker
        })
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      return res.status(response.status).json({
        error: "Free TTS server error",
        details: errorText
      });
    }

    const audioBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    res.setHeader(
      "Content-Type",
      "audio/wav"
    );

    res.setHeader(
      "Content-Length",
      audioBuffer.length
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res
      .status(200)
      .send(audioBuffer);

  } catch (error) {

    console.error(
      "free-voice error:",
      error
    );

    return res.status(500).json({
      error: "Free Voice Server Error",
      message:
        error?.message ||
        String(error)
    });
  }
}
