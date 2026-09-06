import { pluginAxios } from '@kubb/plugin-axios'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { defineConfig } from 'kubb'

export default defineConfig({
  input: '../clivo-api/openapi.json',
  output: { path: './src/api/gen', clean: true, barrel: { type: 'named' } },
  plugins: [
    pluginTs({
      output: { path: 'types' },
      group: { type: 'tag' },
    }),
    pluginZod({
      output: { path: 'schemas' },
      group: { type: 'tag' },
      inferred: true,
    }),
    pluginAxios({
      output: { path: 'clients' },
      group: { type: 'tag' },
      baseURL: '${import.meta.env.VITE_API_URL}',
    }),
    pluginReactQuery({
      output: { path: 'hooks' },
      group: { type: 'tag' },
      client: 'axios',
      hooks: true,
      suspense: {},
    }),
  ],
})
