/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// Warna ini mengambil dari variabel CSS global (bisa diubah realtime)
				brand: 'var(--color-brand)', 
				dark: 'var(--color-dark)',
				accent: 'var(--color-accent)',
			},
			fontFamily: {
				// Font Serif untuk Judul Besar (Mirip gaya editorial Deloitte)
				serif: ['"Merriweather"', 'serif'],
				// Font Sans untuk teks isi
				sans: ['"Inter"', 'sans-serif'],
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'), // Plugin wajib untuk artikel panjang
	],
}