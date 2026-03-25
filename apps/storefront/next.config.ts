import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone',
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