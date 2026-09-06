import { pluginAxios } from '@kubb/plugin-axios'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { defineConfig } from 'kubb'
import ts from 'typescript'

// The API serves int64 identifiers as plain JSON numbers, so emitting `bigint`
// would describe values the transport never produces.
const int64AsNumber = {
  ts: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  zod: () => 'z.coerce.number()',
}

export default defineConfig({
  input: '../clivo-api/openapi.json',
  output: { path: './src/api/gen', clean: true, barrel: { type: 'named' } },
  plugins: [
    pluginTs({
      output: { path: 'types' },
      group: { type: 'tag' },
      printer: { nodes: { bigint: int64AsNumber.ts } },
    }),
    pluginZod({
      output: { path: 'schemas' },
      group: { type: 'tag' },
      inferred: true,
      printer: { nodes: { bigint: int64AsNumber.zod } },
    }),
    // No baseURL here: src/api/client.ts owns it, so the browser can reach the
    // API on a same-origin path and keep sending the session cookie.
    pluginAxios({
      output: { path: 'clients' },
      group: { type: 'tag' },
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
