/**
 * Hello-world Host plugin for DeepSeek Harness.
 *
 * A minimal bundle entry used to verify that the loader resolves the package,
 * imports its entry module, and calls `apply`.
 * @module @potterhe/dsh-helloworld
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name. */
export const name = 'hello-plugin'

/** Configuration accepted by the hello plugin. */
export interface Config {
  /** Text printed when the plugin is loaded. */
  message: string
}

/** Runtime schema for {@link Config}. */
export const Config: z<Config> = z.object({
  message: z.string().required(),
})

/**
 * Log the configured message when the loader activates this row.
 * @param _ctx - the mounting Cordis context.
 * @param config - validated plugin configuration.
 */
export function apply(_ctx: Context, config: Config): void {
  console.log(`[hello-plugin] plugin loaded! ${config.message}`)
}
