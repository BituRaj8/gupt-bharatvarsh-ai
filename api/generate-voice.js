module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST request is allowed"
    });
  }

  try {
    const { text, voiceId } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    const selectedVoice =
      voiceId || "JBFqnCBsd6RMkjVDRZzb";

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "ELEVENLABS_API_KEY is missing in Vercel"
      });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",

        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },

        body: JSON.stringify({
          text: text.trim(),

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

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "ElevenLabs error",
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
    console.error(error);

    return res.status(500).json({
      error: "Voice generation failed",
      details: error.message
    });
  }
};
