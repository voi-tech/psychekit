import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://psychekit.voitech.lol",
  integrations: [react()],
  output: "static",
});
