/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Đổi basePath nếu host trong subfolder (vd GitHub Pages project site).
  // basePath: '/aws-dva-c02',
};

export default nextConfig;
