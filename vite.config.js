import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/gupt-bharatvarsh-ai/",

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/piper-tts-web/dist/onnx",
          dest: "onnx"
        },
        {
          src: "node_modules/piper-tts-web/dist/piper",
          dest: "piper"
        },
        {
          src: "node_modules/piper-tts-web/dist/worker",
          dest: "worker"
        }
      ]
    })
  ]
});
