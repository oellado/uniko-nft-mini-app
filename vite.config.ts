import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { config } from "./src/config";

function fcFrameMeta(): Plugin {
  return {
    name: "inject-fc-frame-meta",
    transformIndexHtml(html: string) {
      const embedJson = JSON.stringify(config.embed);
      const metaTag = `<meta name="fc:frame" content='${embedJson}'>`;
      return html.replace('</head>', `${metaTag}\n</head>`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), fcFrameMeta()],
  server: {
    allowedHosts: true,
  },
}); 