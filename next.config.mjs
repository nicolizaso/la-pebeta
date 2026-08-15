/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Las fotos del sitio salen de public/imgs/, menos las que se suben desde
    // el panel para una nota del blog: esas viven en el bucket de Supabase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
