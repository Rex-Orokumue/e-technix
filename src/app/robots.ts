import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/hub/', '/api/', '/red/'],
      },
    ],
    sitemap: 'https://e-technix.com/sitemap.xml',
    host: 'https://e-technix.com',
  };
}
