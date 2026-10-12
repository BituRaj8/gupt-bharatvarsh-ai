
import { EdgeTTS } from "edge-tts-universal";

const VOICES = new Set([
  "hi-IN-MadhurNeural",
  "hi-IN-AaravNeural",
  "hi-IN-KunalNeural",
  "hi-IN-SwaraNeural",
  "hi-IN-AnanyaNeural",
  "hi-IN-AartiNeural",

  "en-IN-PrabhatNeural",
  "en-IN-NeerjaNeural",
  "bn-IN-BashkarNeural",
  "bn-IN-TanishaaNeural",
  "ta-IN-ValluvarNeural",
  "ta-IN-PallaviNeural",
  "te-IN-MohanNeural",
  "te-IN-ShrutiNeural",
  "ur-IN-SalmanNeural",
  "ur-IN-GulNeural",
  "gu-IN-NiranjanNeural",
  "gu-IN-DhwaniNeural",
  "mr-IN-ManoharNeural",
  "mr-IN-AarohiNeural",
  "kn-IN-GaganNeural",
  "kn-IN-SapnaNeural",
  "ml-IN-MidhunNeural",
  "ml-IN-SobhanaNeural",

  "es-ES-AlvaroNeural",
  "es-ES-ElviraNeural",
  "fr-FR-HenriNeural",
  "fr-FR-DeniseNeural",
  "de-DE-ConradNeural",
  "de-DE-KatjaNeural",
  "ja-JP-KeitaNeural",
  "ja-JP-NanamiNeural",
  "zh-CN-YunxiNeural",
  "zh-CN-XiaoxiaoNeural",
  "pt-BR-AntonioNeural",
  "pt-BR-FranciscaNeural"
]);

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      provider: "Edge TTS",
      configured: true
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { text, voiceId } = req.body || {};

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    if (text.length > 5000) {
      return res.status(413).json({
        error: "Text too long. Maximum 5000 characters."
      });
    }

    const voice = VOICES.has(voiceId)
      ? voiceId
      : "hi-IN-MadhurNeural";

    const tts = new EdgeTTS(
      text.trim(),
      voice,
      {
        rate: "-5%",
        volume: "+0%",
        pitch: "+0Hz"
      }
    );

    const result = await tts.synthesize();
    const audio = Buffer.from(
      await result.audio.arrayBuffer()
    );

    if (!audio.length) {
      throw new Error("No audio was generated");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audio.length));
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(audio);
  } catch (error) {
    console.error("Edge TTS error:", error);

    return res.status(500).json({
      error: "Voice generation failed",
      message: error?.message || String(error)
    });
  }
}
