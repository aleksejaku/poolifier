/* eslint-disable n/no-unpublished-import */
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: [
    './src/main.ts',
    './src/fastify-worker.ts',
    './src/request-handler-worker.ts'
  ],
  strictDeprecations: true,
  output: [
    {
      format: 'cjs',
      dir: './dist',
      sourcemap: true,
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name]-[hash].cjs'
    },
    {
      format: 'esm',
      dir: './dist',
      sourcemap: true
    }
  ],
  external: ['fastify', 'fastify-plugin', 'node:path', 'node:url', 'poolifier'],
  plugins: [
    typescript(),
    del({
      targets: ['./dist/*']
    })
  ]
})
