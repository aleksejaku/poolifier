import * as os from 'node:os'
import { dts } from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import analyze from 'rollup-plugin-analyzer'
import command from 'rollup-plugin-command'
import del from 'rollup-plugin-delete'
import { defineConfig } from 'rollup'

const availableParallelism = () => {
  let availableParallelism = 1
  try {
    availableParallelism = os.availableParallelism()
  } catch {
    const cpus = os.cpus()
    if (Array.isArray(cpus) && cpus.length > 0) {
      availableParallelism = cpus.length
    }
  }
  return availableParallelism
}

const isDevelopmentBuild = process.env.BUILD === 'development'
const isAnalyzeBuild = process.env.ANALYZE
const isDocumentationBuild = process.env.DOCUMENTATION

const maxWorkers = Math.floor(availableParallelism() / 2)

export default defineConfig([
  {
    input: './src/index.ts',
    strictDeprecations: true,
    output: [
      {
        format: 'cjs',
        ...(isDevelopmentBuild && {
          dir: './lib',
          sourcemap: true,
          preserveModules: true,
          preserveModulesRoot: './src'
        }),
        ...(!isDevelopmentBuild && {
          file: './lib/index.js',
          plugins: [terser({ maxWorkers })]
        })
      },
      {
        format: 'esm',
        ...(isDevelopmentBuild && {
          dir: './lib',
          sourcemap: true,
          entryFileNames: '[name].mjs',
          preserveModules: true,
          preserveModulesRoot: './src'
        }),
        ...(!isDevelopmentBuild && {
          file: './lib/index.mjs',
          plugins: [terser({ maxWorkers })]
        })
      }
    ],
    external: [
      'node:async_hooks',
      'node:cluster',
      'node:crypto',
      'node:events',
      'node:fs',
      'node:os',
      'node:perf_hooks',
      'node:worker_threads'
    ],
    plugins: [
      typescript({
        tsconfig: isDevelopmentBuild
          ? './tsconfig.development.json'
          : './tsconfig.production.json'
      }),
      del({
        targets: ['./lib/*']
      }),
      isAnalyzeBuild && analyze(),
      isDocumentationBuild && command('pnpm typedoc')
    ]
  },
  {
    input: './lib/dts/index.d.ts',
    output: [{ format: 'esm', file: './lib/index.d.ts' }],
    external: [
      'node:async_hooks',
      'node:cluster',
      'node:events',
      'node:perf_hooks',
      'node:worker_threads'
    ],
    plugins: [
      dts(),
      del({
        targets: ['./lib/dts'],
        hook: 'buildEnd'
      }),
      isAnalyzeBuild && analyze()
    ]
  }
])
