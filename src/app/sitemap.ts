import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

const ROUTES = ["", "/scents", "/experience", "/events", "/about", "/booking"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
