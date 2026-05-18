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
      // v7.3.4-PR3.7 §1.1: /project-read/basement renamed to
      // /project-read/home. 301 keeps Reddit beta cohort bookmarks
      // live. Also catches the nested result URL so existing free-beta
      // result links still resolve.
      {
        source: '/project-read/basement',
        destination: '/project-read/home',
        permanent: true,
      },
      {
        source: '/project-read/basement/result/:cartId',
        destination: '/project-read/home/result/:cartId',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig
