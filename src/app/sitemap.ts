import { MetadataRoute } from 'next';

const BASE = 'https://e-technix.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE,                        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/programs`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE}/register`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE}/how-it-works`,      lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/certifications`,    lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/about`,             lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/faq`,               lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ];
}
