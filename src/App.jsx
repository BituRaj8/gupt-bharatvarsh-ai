import React, { useMemo, useState } from "react";
import "./App.css";

const VOICES = [
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    description: "Natural Documentary",
  },
  {
    id: "CwhRBWXzGAHq8TQ4Fs17",
    name: "Roger",
    description: "Deep Documentary",
  },
];

const STYLES = [
  {
    id: "mystery",
    name: "Cinematic Mystery",
    prompt:
      "ancient Indian mystery, cinematic atmosphere, dramatic fog, realistic stone architecture, volumetric lighting, mysterious mood, highly detailed",
  },
  {
    id: "history",
    name: "Historical Documentary",
    prompt:
      "ancient Indian historical documentary, realistic architecture, archaeological atmosphere, natural cinematic lighting, highly detailed",
  },
  {
    id: "dark",
    name: "Dark Mystery",
    prompt:
      "dark ancient mystery, dramatic shadows, moody cinematic lighting, atmospheric fog, realistic textures, deep contrast",
  },
  {
    id: "nature",
    name: "Nature Documentary",
    prompt:
      "Indian landscape, mountains, ancient environment, cinematic natural lighting, realistic documentary photography, atmospheric depth",
  },
];

const DEFAULT_SCRIPT = `महाराष्ट्र की एलोरा गुफाओं में मौजूद कैलाश मंदिर को देखकर आज भी लोग हैरान रह जाते हैं।

क्योंकि यह मंदिर किसी सामान्य तरीके से बनाया नहीं गया था।

इसे पहाड़ के ऊपर से नीचे की ओर काटकर तैयार किया गया था।

इतने विशाल पत्थर को हटाकर एक पूरा मंदिर बनाया गया, लेकिन आज भी यह सवाल बना हुआ है कि प्राचीन भारतीय इंजीनियरिंग इतनी उन्नत कैसे थी।

कैलाश मंदिर की विशालता, इसकी नक्काशी और इसकी संरचना आज भी इतिहासकारों और स्थापत्यविदों के लिए एक रहस्य बनी हुई है।

क्या प्राचीन भारतीय इंजीनियरिंग हमारी कल्पना से कहीं ज्यादा उन्नत थी?

या इस मंदिर के निर्माण से जुड़ा कोई ऐसा रहस्य है जिसे हम आज तक पूरी तरह समझ नहीं पाए हैं?`;

function splitIntoScenes(script) {
  return script
    .replace(/\r/g, "")
    .split(/(?<=[।!?])/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function createCinematicPrompt(text, style) {
  const selectedStyle = STYLES.find((item) => item.id === style) || STYLES[0];

  return `${text}

Cinematic documentary visual.
${selectedStyle.prompt}.

Photorealistic cinematic scene, realistic environment, natural human proportions,
cinematic composition, dramatic lighting, volumetric light, atmospheric depth,
realistic shadows, subtle film grain, depth of field, professional documentary
cinematography, slow cinematic camera movement, establishing shot,
smooth camera motion, realistic lens, high detail, 16:9 aspect ratio,
no text, no subtitles, no logo, no watermark.`;
}

function getVoiceConfig(voiceId) {
  const normalized = String(voiceId || "").toLowerCase();

  if (normalized.includes("cwh")) {
    return { speaker: "male", label: "Roger" };
  }

  return { speaker: "male", label: "George" };
}

export default function App() {
  const [title, setTitle] = useState("कैलाश मंदिर का रहस्य");
  const [script, setScript] = useState(DEFAULT_SCRIPT);

  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [style, setStyle] = useState("mystery");

  const [sceneDuration, setSceneDuration] = useState(9);
  const [totalLength, setTotalLength] = useState(60);

  const [scenes, setScenes] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [finalVideo, setFinalVideo] = useState(null);

  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [generatingVoice, setGeneratingVoice] = useState(false);

  const selectedVoice = useMemo(
    () => VOICES.find((voice) => voice.id === voiceId),
    [voiceId]
  );

  const selectedStyle = useMemo(
    () => STYLES.find((item) => item.id === style),
    [style]
  );

  function generateScenes() {
    setError("");
    setFinalVideo(null);
    setGeneratingScenes(true);
    setStatus("Scenes generate हो रहे हैं...");

    try {
      const parts = splitIntoScenes(script);

      if (!parts.length) {
        throw new Error("Script खाली है।");
      }

      const sceneCount = Math.max(
        1,
        Math.ceil(Number(totalLength) / Number(sceneDuration))
      );

      const generated = [];

      for (let i = 0; i < sceneCount; i++) {
        const text = parts[i % parts.length];

        generated.push({
          id: i + 1,
          text,
          duration: Number(sceneDuration),
          prompt: createCinematicPrompt(text, style),
        });
      }

      setScenes(generated);
      setStatus(`${generated.length} cinematic scenes तैयार हैं`);
    } catch (err) {
      setError(err.message || "Scenes generate नहीं हो पाए।");
      setStatus("Error");
    } finally {
      setGeneratingScenes(false);
    }
  }

  async function generateVoice() {
    setError("");
    setGeneratingVoice(true);
    setStatus("AI voice generate हो रही है...");

    try {
      if (!script.trim()) {
        throw new Error("पहले script लिखें।");
      }

      const voiceConfig = getVoiceConfig(voiceId);

      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          voiceId,
          speaker: voiceConfig.speaker,
          language: "hi",
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let message = `Voice API error: ${response.status}`;

        if (contentType.includes("application/json")) {
          const data = await response.json();
          message = data.error || message;
        } else {
          const text = await response.text();

          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      if (contentType.includes("audio")) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        setAudioUrl(url);
        setStatus("AI voice तैयार है");
        return;
      }

      const data = await response.json().catch(() => null);

      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        setStatus("AI voice तैयार है");
        return;
      }

      throw new Error("API ने audio file नहीं भेजी।");
    } catch (err) {
      setError(err.message || "Voice generation failed.");
      setStatus("Voice Error");
    } finally {
      setGeneratingVoice(false);
    }
  }

  function generateDocumentary() {
    setError("");

    if (!title.trim()) {
      setError("Documentary title लिखें।");
      return;
    }

    if (!script.trim()) {
      setError("Script खाली है।");
      return;
    }

    generateScenes();
  }

  async function createFinalVideo() {
    setError("");

    if (!scenes.length) {
      setError("पहले cinematic scenes generate करें��");
      return;
    }

    if (!audioUrl) {
      setError("पहले AI voice generate करें।");
      return;
    }

    setStatus("Final cinematic video तैयार किया जा रहा है...");

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          style: selectedStyle?.id || style,
          duration: sceneDuration,
          scenes: scenes.map((scene) => ({
            narration: scene.text,
            text: scene.text,
            prompt: scene.prompt,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Video generation failed.");
      }

      const data = await response.json();
      setFinalVideo(data);
      setStatus("Final cinematic video तैयार है");
    } catch (err) {
      setError(err.message || "Final video generation failed.");
      setStatus("MP4 Engine Waiting");
    }
  }

  const totalSceneSeconds = scenes.reduce(
    (sum, scene) => sum + Number(scene.duration),
    0
  );

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>GUPT BHARATVARSH AI</h1>
          <p>AI Documentary Script → Cinematic Scenes → Voice → MP4</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          {status}
        </div>
      </header>

      <main className="container">
        <section className="card">
          <h2>🎬 Cinematic Documentary</h2>

          <label>Documentary Title</label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Documentary title"
          />

          <label>Documentary Script</label>

          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={14}
            placeholder="अपनी Hindi documentary script यहाँ लिखें..."
          />

          <div className="grid">
            <div>
              <label>🎙️ Documentary Voice</label>

              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
              >
                {VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} — {voice.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>🎥 Cinematic Style</label>

              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {STYLES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label>⏱️ Scene Duration</label>

          <div className="radio-row">
            {[5, 7, 9, 12].map((value) => (
              <label key={value} className="radio-card">
                <input
                  type="radio"
                  name="sceneDuration"
                  checked={sceneDuration === value}
                  onChange={() => setSceneDuration(value)}
                />

                <span>{value} sec</span>
              </label>
            ))}
          </div>

          <label>🕐 Total Video Length</label>

          <select
            value={totalLength}
            onChange={(e) => setTotalLength(Number(e.target.value))}
          >
            <option value={60}>1 Minute</option>
            <option value={300}>5 Minutes</option>
            <option value={600}>10 Minutes</option>
            <option value={900}>15 Minutes</option>
          </select>

          <div className="cinematic-badge">
            🎬 CINEMATIC DOCUMENTARY MODE
          </div>

          <button
            className="primary"
            onClick={generateDocumentary}
            disabled={generatingScenes}
          >
            {generatingScenes
              ? "🎬 Generating Cinematic Scenes..."
              : "✨ Generate Cinematic Documentary"}
          </button>
        </section>

        {error && (
          <section className="error-box">
            ⚠️ {error}
          </section>
        )}

        <section className="card">
          <div className="section-title">
            <h2>🎞️ Cinematic Scenes</h2>

            <span>
              {scenes.length} scenes · {sceneDuration}s each
            </span>
          </div>

          {scenes.length === 0 ? (
            <div className="empty">
              Generate Cinematic Documentary दबाने के बाद scenes यहाँ
              दिखाई देंगे।
            </div>
          ) : (
            <div className="scene-list">
              {scenes.map((scene) => (
                <article className="scene" key={scene.id}>
                  <div className="scene-number">
                    {String(scene.id).padStart(2, "0")}
                  </div>

                  <div className="scene-content">
                    <h3>Scene {scene.id}</h3>

                    <p>{scene.text}</p>

                    <div className="scene-meta">
                      <span>⏱ {scene.duration}s</span>
                      <span>🎬 Cinematic</span>
                      <span>{selectedStyle?.name}</span>
                    </div>

                    <details>
                      <summary>🎥 Cinematic Visual Prompt</summary>

                      <p className="prompt">{scene.prompt}</p>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-title">
            <h2>🎙️ AI Documentary Voice</h2>

            <span>{selectedVoice?.name}</span>
          </div>

          <p className="muted">
            Selected voice से पूरी documentary narration generate होगी।
          </p>

          <button
            className="secondary"
            onClick={generateVoice}
            disabled={generatingVoice}
          >
            {generatingVoice
              ? "🎙️ Generating Voice..."
              : "🎙️ Generate AI Voice"}
          </button>

          {audioUrl && (
            <div className="audio-box">
              <audio controls src={audioUrl} />

              <a
                className="download"
                href={audioUrl}
                download="gupt-bharatvarsh-voice.mp3"
              >
                ⬇️ Download Voice
              </a>
            </div>
          )}
        </section>

        <section className="card final-card">
          <h2>🎬 Final Cinematic Video</h2>

          <div className="pipeline">
            <div className={scenes.length ? "done" : ""}>
              <b>1</b>
              <span>Cinematic Scenes</span>
            </div>

            <div className={audioUrl ? "done" : ""}>
              <b>2</b>
              <span>AI Voice</span>
            </div>

            <div className={scenes.length ? "done" : ""}>
              <b>3</b>
              <span>Camera Animation</span>
            </div>

            <div>
              <b>4</b>
              <span>MP4</span>
            </div>
          </div>

          {scenes.length > 0 && (
            <div className="video-info">
              🎬 {scenes.length} cinematic scenes · {Math.round(totalSceneSeconds)} seconds planned
            </div>
          )}

          {finalVideo && (
            <div className="video-info">
              ✅ API response: {finalVideo.status || "ready"} · {finalVideo.sceneCount || scenes.length} scenes prepared
            </div>
          )}

          <button
            className="primary final-button"
            onClick={createFinalVideo}
            disabled={!scenes.length || !audioUrl}
          >
            🎥 Create Final Cinematic Video
          </button>

          <p className="muted center">
            Scenes + AI Voice तैयार होने के बाद cinematic MP4 rendering शुरू
            होगी।
          </p>
        </section>
      </main>
    </div>
  );
}
