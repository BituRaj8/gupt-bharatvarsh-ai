export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        service: "generate-video",
        status: "ready"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const {
      scenes = [],
      duration = 5,
      style = "normal",
      title = "GUPT BHARATVARSH AI"
    } = req.body || {};

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({
        error: "Scenes are required"
      });
    }

    const sceneDuration = Number(duration);

    if (![5, 7, 9, 12].includes(sceneDuration)) {
      return res.status(400).json({
        error: "Scene duration must be 5, 7, 9 or 12 seconds"
      });
    }

    if (!["normal", "2d"].includes(style)) {
      return res.status(400).json({
        error: "Video style must be normal or 2d"
      });
    }

    const renderScenes = scenes.map((scene, index) => {
      const narration =
        typeof scene === "string"
          ? scene
          : scene?.narration ||
            scene?.text ||
            "";

      const originalPrompt =
        typeof scene === "string"
          ? ""
          : scene?.prompt ||
            scene?.visualPrompt ||
            "";

      const visualPrompt =
        style === "2d"
          ? `
2D cinematic animated documentary scene.
Consistent characters and environment.
Smooth character animation.
Parallax background.
Cinematic camera movement.
Detailed illustrated backgrounds.
Dramatic lighting.
Professional documentary animation.
16:9 widescreen.
No text.
No watermark.

Scene:
${originalPrompt || narration}
`
          : `
Ultra realistic cinematic documentary video.
Natural realistic environment.
Professional film lighting.
Slow cinematic camera movement.
Realistic depth and atmosphere.
High detail.
Historical documentary style.
16:9 widescreen.
No text.
No watermark.

Scene:
${originalPrompt || narration}
`;

      return {
        sceneNumber: index + 1,
        duration: sceneDuration,
        type: style,
        narration,
        prompt: visualPrompt.trim(),
        aspectRatio: "16:9",
        resolution: "1280x720"
      };
    });

    return res.status(200).json({
      ok: true,
      status: "ready",
      title,
      style,
      sceneDuration,
      sceneCount: renderScenes.length,
      scenes: renderScenes
    });

  } catch (error) {
    console.error("generate-video error:", error);

    return res.status(500).json({
      error: "Server Error",
      message: error?.message || String(error)
    });
  }
}
