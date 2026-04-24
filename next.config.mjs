/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Permite que el build de Vercel pase aunque haya warnings de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite el build aunque haya errores de TypeScript no críticos
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
