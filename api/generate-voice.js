module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST request is allowed"
    });
  }

  try {
    const body = req.body || {};

    const text = typeof body.text === "string"
      ? body.text.trim()
      : "";

    const voiceId = typeof body.voiceId === "string"
      ? body.voiceId.trim()
      : "";

    // Check text
    if (!text) {
      return res.status(400).json({
        error: "Text is required",
        code: "TEXT_MISSING"
      });
    }

    // Check API key
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey || !apiKey.trim()) {
      return res.status(500).json({
        error: "ELEVENLABS_API_KEY is missing in Vercel",
        code: "API_KEY_MISSING"
      });
    }

    // Verified ElevenLabs documentation example voice:
    // George
    const selectedVoice =
      voiceId || "JBFqnCBsd6RMkjVDRZzb";

    // ElevenLabs TTS
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",

        headers: {
          "xi-api-key": apiKey.trim(),
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },

        body: JSON.stringify({
          text: text,

          model_id: "eleven_multilingual_v2",

          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.20,
            use_speaker_boost: true
          }
        })
      }
    );

    // ElevenLabs error
    if (!elevenResponse.ok) {

      const errorText = await elevenResponse.text();

      let parsedError = null;

      try {
        parsedError = JSON.parse(errorText);
      } catch (e) {
        parsedError = null;
      }

      return res.status(elevenResponse.status).json({
        error: "ElevenLabs error",
        status: elevenResponse.status,
        code:
          parsedError?.detail?.status ||
          parsedError?.detail?.code ||
          "ELEVENLABS_ERROR",
        details:
          parsedError?.detail?.message ||
          errorText ||
          "Unknown ElevenLabs error"
      });
    }

    // Convert audio
    const audioBuffer = Buffer.from(
      await elevenResponse.arrayBuffer()
    );

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(500).json({
        error: "ElevenLabs returned empty audio",
        code: "EMPTY_AUDIO"
      });
    }

    // Audio response
    res.statusCode = 200;

    res.setHeader(
      "Content-Type",
      "audio/mpeg"
    );

    res.setHeader(
      "Content-Length",
      audioBuffer.length
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return res.end(audioBuffer);

  } catch (error) {

    console.error(
      "GUPT BHARATVARSH VOICE ERROR:",
      error
    );

    return res.status(500).json({
      error: "Voice generation failed",
      code: "SERVER_ERROR",
      details: error?.message || "Unknown server error"
    });
  }
};
