/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @sofria/shared workspace paketi ham TS kaynağına işaret ediyor
  // (main: "./src/index.ts") — Next.js'in bunu derlemesi için gerekli.
  transpilePackages: ["@sofria/shared"],
};

export default nextConfig;
