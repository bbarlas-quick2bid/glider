import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        priority: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#10b981',
        },
        action: {
          reply: '#3b82f6',
          schedule: '#8b5cf6',
          delegate: '#f97316',
          archive: '#6b7280',
          followup: '#eab308',
          prioritize: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}

export default config
