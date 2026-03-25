import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone',
    // Disabling experimental cacheComponents to avoid build-time API dependency
    // cacheComponents: true,
    images: {
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                hostname: 'readonlydemo.vendure.io',
            },
            {
                hostname: 'demo.vendure.io'
            },
            {
                hostname: 'localhost'
            },
            {
                hostname: 'images.unsplash.com'
            },
            {
                hostname: 'api.parkpicasso.com'
            }
        ],
    },
    experimental: {
        rootParams: true
    }
};

export default nextConfig;