import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.NEXT_OUTPUT || 'standalone',
    reactStrictMode: false,
    // Configure `pageExtensions` to include markdown and MDX files
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

export default nextConfig

