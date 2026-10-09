export default async function handler(req, res) {
  try {
    // Health check
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        service: "generate-video",
        status: "online",
        rendererConnected: false,
        message:
          "API is online, but the MP4 rendering engine is not connected."
      });
    }

    // Only POST is supported for generation
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");

      return res.status(405).json({
        ok: false,
        error: "Method not allowed"
      });
    }

    const {
      scenes = [],
      duration = 9,
      style = "mystery",
      title = "GUPT BHARATVARSH AI"
    } = req.body || {};

    // Validate title
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        ok: false,
        error: "Documentary title is required."
      });
    }

    // Validate scenes
    if (
      !Array.isArray(scenes) ||
      scenes.length === 0
    ) {
      return res.status(400).json({
        ok: false,
        error: "Scenes are required."
      });
    }

    if (scenes.length > 200) {
      return res.status(400).json({
        ok: false,
        error: "Maximum 200 scenes are allowed per request."
      });
    }

    // Validate scene duration
    const sceneDuration = Number(duration);

    if (![5, 7, 9, 12].includes(sceneDuration)) {
      return res.status(400).json({
        ok: false,
        error:
          "Scene duration must be 5, 7, 9 or 12 seconds."
      });
    }

    // Accept the cinematic styles used by App.jsx
    const allowedStyles = [
      "mystery",
      "history",
      "dark",
      "nature",
      "cinematic",
      "normal",
      "2d"
    ];

    if (!allowedStyles.includes(style)) {
      return res.status(400).json({
        ok: false,
        error: "Unsupported video style."
      });
    }

    // Cinematic prompt presets
    const stylePrompts = {
      mystery: `
Ancient Indian mystery documentary,
mysterious atmosphere, dramatic fog,
realistic stone architecture, volumetric lighting,
deep shadows, cinematic composition.
`,

      history: `
Historical Indian documentary,
authentic ancient architecture,
archaeological environment, realistic stone textures,
natural cinematic lighting.
`,

      dark: `
Dark historical mystery,
dramatic shadows, atmospheric fog,
deep contrast, realistic textures,
moody cinematic lighting.
`,

      nature: `
Indian landscapes, mountains,
natural environments, atmospheric depth,
realistic documentary cinematography,
cinematic natural lighting.
`,

      cinematic: `
Premium cinematic documentary,
photorealistic environment,
dramatic film lighting, realistic textures,
professional camera composition,
atmospheric depth and natural colors.
`,

      normal: `
Realistic documentary environment,
natural lighting, realistic textures,
professional documentary composition.
`,

      "2d": `
2D illustrated documentary animation,
detailed illustrated backgrounds,
consistent visual style, layered backgrounds,
parallax composition, cinematic colors.
`
    };

    // Prepare scene metadata and prompts
    const renderScenes = scenes.map((scene, index) => {
      const narration =
        typeof scene === "string"
          ? scene.trim()
          : String(
              scene?.narration ||
              scene?.text ||
              ""
            ).trim();

      const originalPrompt =
        typeof scene === "string"
          ? ""
          : String(
              scene?.prompt ||
              scene?.visualPrompt ||
              ""
            ).trim();

      if (!narration && !originalPrompt) {
        throw new Error(
          `Scene ${index + 1} has no narration or visual prompt.`
        );
      }

      const animationInstructions =
        style === "2d"
          ? `
Smooth 2D animation,
subtle character movement,
layered parallax backgrounds,
consistent characters,
slow camera pan and zoom,
professional illustrated documentary.
`
          : `
Photorealistic cinematic visuals,
realistic environment and proportions,
slow camera movement,
subtle dolly-in or pan,
dramatic but natural lighting,
realistic shadows and atmospheric depth,
professional documentary cinematography.
`;

      const visualPrompt = `
${stylePrompts[style]}

Scene description:
${originalPrompt || narration}

${animationInstructions}

Landscape 16:9 composition.
Target resolution: 1280x720.
No text, no subtitles, no logos, no watermark.
`.trim();

      return {
        sceneNumber: index + 1,
        duration: sceneDuration,
        type: style,
        narration,
        prompt: visualPrompt,
        aspectRatio: "16:9",
        resolution: "1280x720"
      };
    });

    // This endpoint prepares prompts only.
    // It does NOT render or encode an MP4.
    return res.status(200).json({
      ok: true,
      status: "prepared",
      mp4Created: false,
      rendererConnected: false,
      title: title.trim(),
      style,
      sceneDuration,
      sceneCount: renderScenes.length,
      plannedDurationSeconds:
        renderScenes.length * sceneDuration,
      scenes: renderScenes,
      message:
        "Scene prompts prepared successfully. " +
        "An actual video rendering service must be connected " +
        "to generate and download an MP4 file."
    });

  } catch (error) {
    console.error("generate-video error:", error);

    return res.status(500).json({
      ok: false,
      status: "error",
      error:
        error?.message ||
        "An unexpected video API error occurred."
    });
  }
}
