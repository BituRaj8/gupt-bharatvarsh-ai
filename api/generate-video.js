export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        service: "generate-video"
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
      style = "normal"
    } = req.body || {};

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({
        error: "Scenes are required"
      });
    }

    if (!["normal", "2d"].includes(style)) {
      return res.status(400).json({
        error: "Invalid video style"
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Video render request received",
      style,
      sceneDuration: duration,
      sceneCount: scenes.length,
      status: "queued"
    });

  } catch (error) {
    console.error("generate-video error:", error);

    return res.status(500).json({
      error: "Server Error",
      message: error?.message || String(error)
    });
  }
        }
