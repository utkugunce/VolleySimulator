import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://volleysimulator.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/oauth/',
                    '/dashboard/',
                    '/profile/',
                    '/ayarlar/',
                    '/_next/',
                    '/offline/',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
