/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    // /calculator, /seasonal-home-report, and the /owners + /buyers persona
    // variants are subsumed by the address-first /property/[slug] flow.
    // 308s preserve any external SEO equity by sending it to the homepage
    // where users can enter their address.
    return [
      { source: '/calculator', destination: '/', permanent: true },
      { source: '/seasonal-home-report', destination: '/', permanent: true },
      { source: '/owners', destination: '/', permanent: true },
      { source: '/buyers', destination: '/', permanent: true },
    ]
  },
}
module.exports = nextConfig
