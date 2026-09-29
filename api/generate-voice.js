export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        service: "generate-voice",
        keyConfigured: !!process.env.ELEVENLABS_API_KEY
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "ELEVENLABS_API_KEY is missing"
      });
    }

    const { text, voiceId } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    if (!voiceId) {
      return res.status(400).json({
        error: "Voice ID is required"
      });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey.trim(),
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "ElevenLabs API Error",
        details: errorText
      });
    }

    const audioBuffer = Buffer.from(
      await response.arrayBuffer()
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(audioBuffer);

  } catch (error) {
    console.error("generate-voice error:", error);

    return res.status(500).json({
      error: "Server Error",
      message: error?.message || String(error)
    });
  }
}
