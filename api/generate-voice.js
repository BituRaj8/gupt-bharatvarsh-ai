module.exports = async (req, res) => {

  // ==============================
  // CORS
  // ==============================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  // ==============================
  // OPTIONS
  // ==============================

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }


  // ==============================
  // ONLY POST
  // ==============================

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Only POST request is allowed"
    });

  }


  try {

    // ==============================
    // READ BODY
    // ==============================

    let body = req.body || {};

    if (typeof body === "string") {

      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }

    }


    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";


    const voiceId =
      typeof body.voiceId === "string"
        ? body.voiceId.trim()
        : "";


    // ==============================
    // CHECK TEXT
    // ==============================

    if (!text) {

      return res.status(400).json({
        error: "Text is required",
        code: "TEXT_MISSING"
      });

    }


    // ==============================
    // CHECK API KEY
    // ==============================

    const apiKey =
      process.env.ELEVENLABS_API_KEY;


    if (!apiKey || !apiKey.trim()) {

      return res.status(500).json({
        error:
          "ELEVENLABS_API_KEY is missing in Vercel",
        code:
          "API_KEY_MISSING"
      });

    }


    // ==============================
    // DEFAULT VOICE
    // ==============================

    const selectedVoice =
      voiceId ||
      "JBFqnCBsd6RMkjVDRZzb";


    // ==============================
    // ELEVENLABS REQUEST
    // ==============================

    const elevenResponse =
      await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
        {

          method: "POST",

          headers: {

            "xi-api-key":
              apiKey.trim(),

            "Content-Type":
              "application/json",

            "Accept":
              "audio/mpeg"

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

        }
      );


    // ==============================
    // ELEVENLABS ERROR
    // ==============================

    if (!elevenResponse.ok) {

      const rawError =
        await elevenResponse.text();


      let errorMessage =
        rawError ||
        "Unknown ElevenLabs error";


      try {

        const parsed =
          JSON.parse(rawError);


        /*
          ElevenLabs कभी detail को
          object के रूप में भेज सकता है।
        */

        if (
          parsed &&
          parsed.detail
        ) {

          if (
            typeof parsed.detail ===
            "string"
          ) {

            errorMessage =
              parsed.detail;

          }

          else if (
            typeof parsed.detail ===
            "object"
          ) {

            errorMessage =
              parsed.detail.message ||
              parsed.detail.status ||
              JSON.stringify(
                parsed.detail
              );

          }

        }

        else if (
          parsed &&
          parsed.message
        ) {

          errorMessage =
            typeof parsed.message ===
            "string"
              ? parsed.message
              : JSON.stringify(
                  parsed.message
                );

        }

        else {

          errorMessage =
            JSON.stringify(parsed);

        }

      }
      catch (e) {

        /*
          अगर JSON नहीं है,
          तो raw error दिखाएँ
        */

        errorMessage =
          rawError ||
          "Unknown ElevenLabs error";

      }


      return res.status(
        elevenResponse.status
      ).json({

        error:
          "ElevenLabs error",

        status:
          elevenResponse.status,

        details:
          errorMessage,

        voiceId:
          selectedVoice

      });

    }


    // ==============================
    // AUDIO
    // ==============================

    const audioArrayBuffer =
      await elevenResponse.arrayBuffer();


    if (
      !audioArrayBuffer ||
      audioArrayBuffer.byteLength === 0
    ) {

      return res.status(500).json({

        error:
          "ElevenLabs returned empty audio",

        code:
          "EMPTY_AUDIO"

      });

    }


    const audioBuffer =
      Buffer.from(
        audioArrayBuffer
      );


    // ==============================
    // AUDIO RESPONSE
    // ==============================

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


    return res.status(200).send(
      audioBuffer
    );


  }

  catch (error) {

    console.error(
      "GUPT BHARATVARSH VOICE ERROR:",
      error
    );


    let message =
      "Unknown server error";


    if (
      error &&
      typeof error.message ===
      "string"
    ) {

      message =
        error.message;

    }

    else if (
      error &&
      typeof error ===
      "object"
    ) {

      try {

        message =
          JSON.stringify(
            error
          );

      } catch (e) {

        message =
          String(error);

      }

    }


    return res.status(500).json({

      error:
        "Voice generation failed",

      code:
        "SERVER_ERROR",

      details:
        message

    });

  }

};
