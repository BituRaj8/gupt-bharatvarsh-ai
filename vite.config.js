
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/piper-tts-web/dist/onnx",
          dest: "."
        },
        {
          src: "node_modules/piper-tts-web/dist/piper",
          dest: "."
        },
        {
          src: "node_modules/piper-tts-web/dist/worker",
          dest: "."
        }
      ]
    })
  ]
});
