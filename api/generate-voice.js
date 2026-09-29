export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET = test endpoint
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "generate-voice",
      keyConfigured:
        !!process.env.ELEVENLABS_API_KEY
    });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST request is allowed"
    });
  }

  try {
    // -----------------------------
    // READ REQUEST BODY
    // -----------------------------

    let body = req.body || {};

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    // -----------------------------
    // VOICE ID
    // -----------------------------

    const voiceId =
      typeof body.voiceId === "string" &&
      body.voiceId.trim()
        ? body.voiceId.trim()
        : "JBFqnCBsd6RMkjVDRZzb";

    // -----------------------------
    // CHECK TEXT
    // -----------------------------

    if (!text) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    // -----------------------------
    // ELEVENLABS API KEY
    // -----------------------------

    const apiKey =
      process.env.ELEVENLABS_API_KEY;

    if (!apiKey || !apiKey.trim()) {
      return res.status(500).json({
        error:
          "ELEVENLABS_API_KEY is missing in Vercel",
        code: "API_KEY_MISSING"
      });
    }

    // -----------------------------
    // ELEVENLABS REQUEST
    // -----------------------------

    const url =
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "xi-api-key": apiKey.trim(),
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },

      body: JSON.stringify({
        text: text,

        model_id:
          "eleven_multilingual_v2",

        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    // -----------------------------
    // ELEVENLABS ERROR
    // -----------------------------

    if (!response.ok) {
      const raw =
        await response.text();

      let details =
        raw ||
        "Unknown ElevenLabs error";

      try {
        const data =
          JSON.parse(raw);

        if (
          typeof data.detail === "string"
        ) {
          details =
            data.detail;
        }

        else if (
          data.detail &&
          typeof data.detail === "object"
        ) {
          details =
            data.detail.message ||
            data.detail.status ||
            JSON.stringify(
              data.detail
            );
        }

        else if (data.message) {
          details =
            typeof data.message === "string"
              ? data.message
              : JSON.stringify(
                  data.message
                );
        }

        else {
          details =
            JSON.stringify(data);
        }

      } catch {
        // Raw response already stored
      }

      return res.status(response.status).json({
        error:
          "ElevenLabs error",

        status:
          response.status,

        details:
          String(details),

        voiceId:
          voiceId
      });
    }

    // -----------------------------
    // GET AUDIO
    // -----------------------------

    const arrayBuffer =
      await response.arrayBuffer();

    if (
      !arrayBuffer ||
      arrayBuffer.byteLength === 0
    ) {
      return res.status(500).json({
        error:
          "Empty audio received"
      });
    }

    // -----------------------------
    // SEND MP3
    // -----------------------------

    const audioBuffer =
      Buffer.from(arrayBuffer);

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
      "no-store"
    );

    return res
      .status(200)
      .send(audioBuffer);

  } catch (error) {

    // -----------------------------
    // SERVER ERROR
    // -----------------------------

    console.error(
      "VOICE ERROR:",
      error
    );

    let details =
      "Unknown server error";

    if (
      error &&
      typeof error.message === "string"
    ) {
      details =
        error.message;
    }

    else {
      try {
        details =
          JSON.stringify(error);
      } catch {
        details =
          String(error);
      }
    }

    return res.status(500).json({
      error:
        "Voice generation failed",

      details:
        String(details)
    });
  }
}
