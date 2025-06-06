import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	base: '/weathersite/',
	plugins: [tailwindcss(), sveltekit()],

	build: {
		outDir: 'dist',
	}
});
