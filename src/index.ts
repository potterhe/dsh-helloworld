/**
 * Hello-world Host plugin for DeepSeek Harness.
 *
 * A minimal bundle entry used to verify that the loader resolves the package,
 * imports its entry module, and calls `apply`, and that the plugin can expose
 * a model-callable tool.
 * @module @potterhe/dsh-helloworld
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name. */
export const name = 'hello-plugin'

/** Services used by the plugin. */
export const inject = ['tools']

/** Configuration accepted by the hello plugin. */
export interface Config {
  /** Text printed when the plugin loads; also the default greeting of the `hello` tool. */
  message: string
}

/** Runtime schema for {@link Config}. */
export const Config: z<Config> = z.object({
  message: z.string().required(),
})

/**
 * Log the configured message when the loader activates this row and register
 * the model-callable `hello` tool.
 * @param ctx - the mounting Cordis context.
 * @param config - validated plugin configuration.
 */
export function apply(ctx: Context, config: Config): void {
  console.log(`[hello-plugin] plugin loaded! ${config.message}`)

  ctx.tools.register(defineTool({
    name: 'hello',
    description: 'Greet the user with the hello plugin greeting, optionally addressed to a name.',
    parameters: {
      name: { type: 'string', description: 'Who to greet. Omit to return the configured greeting unchanged.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const target = args.name?.trim()
      return target ? `Hello, ${target}!` : config.message
    },
  }))
}
