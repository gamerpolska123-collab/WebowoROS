import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://domena.pl';

const staticRoutes = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: '/menu', priority: 0.9, changefreq: 'daily' },
  { path: '/bag', priority: 0.7, changefreq: 'weekly' },
  { path: '/checkout', priority: 0.8, changefreq: 'weekly' },
  { path: '/track', priority: 0.6, changefreq: 'weekly' },
  { path: '/login', priority: 0.5, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  { path: '/offline', priority: 0.1, changefreq: 'yearly' },
];

export async function GET() {
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${(route?.priority ?? 0.5).toFixed(1)}</priority>
  </url>`).join('
')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
