import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fragments — mood collages",
    short_name: "Fragments",
    description:
      "Turn camera-roll photos into emotional collages and share them to the Community Fragments archive.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f1e8",
    theme_color: "#e8d4cf",
    categories: ["lifestyle", "photography", "creativity"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
