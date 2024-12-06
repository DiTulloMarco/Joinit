/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: "http://localhost:8001/api/v1"
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'http', 
                hostname: 'localhost', 
                port: '8001', 
                pathname: '/media/**', 
            },
        ],
    },
};

export default nextConfig;
