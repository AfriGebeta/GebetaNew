import {MetadataRoute} from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // Signed-in app surfaces, admin tooling and embed/API endpoints carry no
            // search value and would otherwise soak up crawl budget.
            disallow: [
                '/private/',
                '/admin/',
                '/api/',
                '/dashboard/',
                '/career/admin/',
                '/auth/',
                '/embed/',
            ],
        },
        sitemap: 'https://gebeta.app/sitemap.xml',
        host: 'https://gebeta.app',
    }
}
