import { getSiteUrl } from "@/lib/site";

export default async function sitemap() {
  const site = getSiteUrl();
  return [
    { url: site, lastModified: new Date() },
  ];
}

