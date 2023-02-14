import glsl from 'vite-plugin-glsl'
import requireTransform from 'vite-plugin-require-transform'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [glsl(), requireTransform({})],
})
