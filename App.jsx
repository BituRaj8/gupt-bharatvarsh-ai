<label className="radio-card large">
  <input
    type="radio"
    name="videoType"
    checked={videoType === "normal"}
    onChange={() => setVideoType("normal")}
  />
  <span>🎬 Cinematic Documentary</span>
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
