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
  { id: "mystery", name: "Cinematic Mystery" },
  { id: "history", name: "Historical Documentary" },
  { id: "dark", name: "Dark Mystery" },
  { id: "nature", name: "Nature Documentary" },
];

const DEFAULT_SCRIPT = `महाराष्ट्र की एलोरा गुफाओं में मौजूद कैलाश मंदिर को देखकर आज भी लोग हैरान रह जाते हैं।

क्योंकि यह मंदिर किसी सामान्य तरीके से बनाया नहीं गया था।

इसे पहाड़ के ऊपर से नीचे की ओर काटकर तैयार किया गया था।

इतने विशाल पत्थर को हटाकर एक पूरा मंदिर बनाया गया, लेकिन आज भी यह सवाल रहस्य बना हुआ है कि उस समय इतनी सटीक इंजीनियरिंग आखिर कैसे संभव हुई।

कैलाश मंदिर की विशालता, इसकी नक्काशी और इसकी संरचना आज भी इतिहासकारों और शोधकर्ताओं को आकर्षित करती है।

क्या प्राचीन भारतीय इंजीनियरिंग हमारी कल्पना से कहीं ज्यादा उन्नत थी?

या इस मंदिर के निर्माण से जुड़ा कोई ऐसा रहस्य है जिसे हम आज तक पूरी तरह समझ नहीं पाए हैं?`;

function splitIntoScenes(script) {
  return script
    .replace(/\r/g, "")
    .split(/(?<=[।!?])/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function getStylePrompt(style) {
  const prompts = {
    mystery:
      "ancient Indian mystery, cinematic atmosphere, dramatic fog, realistic stone architecture, volumetric lighting, mysterious mood, highly detailed",
    history:
      "ancient Indian historical documentary, realistic architecture, archaeological atmosphere, natural cinematic lighting, highly detailed",
    dark:
      "dark ancient temple mystery, dramatic shadows, moody cinematic lighting, atmospheric fog, realistic stone textures",
    nature:
      "Indian landscape, mountains, ancient environment, cinematic natural lighting, realistic documentary photography",
  };

  return prompts[style] || prompts.mystery;
}

function createScenePrompt(text, style, mode) {
  const base = getStylePrompt(style);

  if (mode === "2d") {
    return `${text}. 2D documentary animation, ${base}, illustrated cinematic movement, layered depth, parallax effect, smooth camera movement, 16:9, no text, no watermark`;
  }

  return `${text}. ${base}, cinematic documentary shot, realistic camera movement, depth of field, 16:9, no text, no watermark`;
}

export default function App() {
  const [title, setTitle] = useState("कैलाश मंदिर का रहस्य");
  const [script, setScript] = useState(DEFAULT_SCRIPT);

  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [style, setStyle] = useState("mystery");

  const [sceneDuration, setSceneDuration] = useState(9);
  const [totalLength, setTotalLength] = useState(60);
  const [videoType, setVideoType] = useState("normal");

  const [scenes, setScenes] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");

  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [generatingVoice, setGeneratingVoice] = useState(false);

  const selectedVoice = useMemo(
    () => VOICES.find((v) => v.id === voiceId),
    [voiceId]
  );

  function generateScenes() {
    setError("");
    setGeneratingScenes(true);

    try {
      const parts = splitIntoScenes(script);

      if (!parts.length) {
        throw new Error("Script खाली है।");
      }

      const maxScenes = Math.max(
        1,
        Math.ceil(Number(totalLength) / Number(sceneDuration))
      );

      const selectedParts = [];

      for (let i = 0; i < maxScenes; i++) {
        selectedParts.push(parts[i % parts.length]);
      }

      const generated = selectedParts.map((text, index) => ({
        id: index + 1,
        text,
        duration: Number(sceneDuration),
        prompt: createScenePrompt(text, style, videoType),
      }));

      setScenes(generated);
      setStatus(`${generated.length} scenes तैयार हैं`);
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
    setStatus("Voice generate हो रही है...");

    try {
      if (!script.trim()) {
        throw new Error("पहले script लिखें।");
      }

      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          voiceId,
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
          if (text) message = text;
        }

        throw new Error(message);
      }

      if (!contentType.includes("audio")) {
        const data = await response.json().catch(() => null);

        if (data?.audioUrl) {
          setAudioUrl(data.audioUrl);
          setStatus("Voice तैयार है");
          return;
        }

        throw new Error("API ने audio file नहीं भेजी।");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setStatus("Voice तैयार है");
    } catch (err) {
      setError(err.message || "Voice generation failed.");
      setStatus("Voice Error");
    } finally {
      setGeneratingVoice(false);
    }
  }

  function generateDocumentary() {
    setError("");

    if (!script.trim()) {
      setError("Script खाली है।");
      return;
    }

    generateScenes();
  }

  function createFinalVideo() {
    setError(
      "Scene और voice तैयार हैं। अगला step MP4 rendering engine जोड़ना है।"
    );
    setStatus("Rendering engine waiting");
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>GUPT BHARATVARSH AI</h1>
          <p>AI Documentary Script → Scenes → Voice → Video</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          {status}
        </div>
      </header>

      <main className="container">
        <section className="card">
          <h2>🎬 Documentary Project</h2>

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
            rows={12}
            placeholder="अपनी Hindi documentary script यहाँ लिखें..."
          />

          <div className="grid">
            <div>
              <label>Voice</label>
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
              <label>Visual Style</label>
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

          <label>Scene Duration</label>

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

          <label>Total Video Length</label>

          <select
            value={totalLength}
            onChange={(e) => setTotalLength(Number(e.target.value))}
          >
            <option value={60}>1 Minute</option>
            <option value={300}>5 Minutes</option>
            <option value={600}>10 Minutes</option>
            <option value={900}>15 Minutes</option>
          </select>

          <label>Video Type</label>

          <div className="radio-row">
            <label className="radio-card large">
              <input
                type="radio"
                name="videoType"
                checked={videoType === "normal"}
                onChange={() => setVideoType("normal")}
              />
              <span>🎥 Normal Documentary</span>
            </label>

            <label className="radio-card large">
              <input
                type="radio"
                name="videoType"
                checked={videoType === "2d"}
                onChange={() => setVideoType("2d")}
              />
              <span>🎨 2D Animation</span>
            </label>
          </div>

          <button
            className="primary"
            onClick={generateDocumentary}
            disabled={generatingScenes}
          >
            {generatingScenes
              ? "Generating Scenes..."
              : "✨ Generate Documentary"}
          </button>
        </section>

        {error && (
          <section className="error-box">
            ⚠️ {error}
          </section>
        )}

        <section className="card">
          <div className="section-title">
            <h2>🎞️ Scenes</h2>

            <span>
              {scenes.length} scenes · {sceneDuration}s each
            </span>
          </div>

          {scenes.length === 0 ? (
            <div className="empty">
              Generate Documentary दबाने के बाद scenes यहाँ दिखाई देंगे।
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
                      <span>
                        {videoType === "2d"
                          ? "🎨 2D Animation"
                          : "🎥 Normal"}
                      </span>
                    </div>

                    <details>
                      <summary>Visual Prompt</summary>
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
            <h2>🎙️ AI Voice</h2>
            <span>{selectedVoice?.name}</span>
          </div>

          <p className="muted">
            ElevenLabs API के जरिए selected documentary voice generate होगी।
          </p>

          <button
            className="secondary"
            onClick={generateVoice}
            disabled={generatingVoice}
          >
            {generatingVoice ? "Generating Voice..." : "🎙️ Generate AI Voice"}
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
          <h2>🎬 Final Video</h2>

          <div className="pipeline">
            <div className={scenes.length ? "done" : ""}>
              <b>1</b>
              <span>Scenes</span>
            </div>

            <div className={audioUrl ? "done" : ""}>
              <b>2</b>
              <span>Voice</span>
            </div>

            <div>
              <b>3</b>
              <span>Animation</span>
            </div>

            <div>
              <b>4</b>
              <span>MP4</span>
            </div>
          </div>

          <button
            className="primary final-button"
            onClick={createFinalVideo}
            disabled={!scenes.length || !audioUrl}
          >
            🎥 Create Final Video
          </button>

          <p className="muted center">
            पहले Scenes और Voice तैयार करें। उसके बाद Final Video rendering
            engine काम करेगा।
          </p>
        </section>
      </main>
    </div>
  );
                  }
