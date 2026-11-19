/**
 * Hello-world plugin for DeepSeek Harness.
 *
 * A minimal bundle entry used to verify that the loader resolves the package,
 * imports its entry module, and calls `apply`, and that the plugin can expose
 * model-callable tools, including one gated by human approval.
 *
 * The plugin is meant to be mounted from an agent preset rather than the
 * profile root: each preset configures which of the two greeting tools it
 * registers, and a preset-scoped registration is visible only to sessions
 * that select that preset.
 * @module @potterhe/dsh-helloworld
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool, type PreToolDecision } from '@deepseek-ai/dsh-tools'
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name. */
export const name = 'hello-plugin'

/** Services used by the plugin. */
export const inject = ['tools']

/** Tool that greets without any approval. */
const HELLO_TOOL_NAME = 'hello'

/** Tool that greets only after a human approves the call. */
const APPROVAL_HELLO_TOOL_NAME = 'approval_hello'

/** Configuration accepted by the hello plugin. */
export interface Config {
  /** Text printed when the plugin loads; also the default greeting of both tools. */
  message: string
  /** Register the approval-free `hello` tool. Defaults to true. */
  hello?: boolean
  /** Register `approval_hello`, which asks for human approval before every call. Defaults to true. */
  approvalHello?: boolean
}

/** Runtime schema for {@link Config}. */
export const Config: z<Config> = z.object({
  message: z.string().required(),
  hello: z.boolean().default(true),
  approvalHello: z.boolean().default(true),
})

/** Configuration after schemastery applied the defaults. */
type ResolvedConfig = Required<Config>

/**
 * Log the configured message when the loader activates this row, register the
 * greeting tools the configuration selects (both by default), and gate
 * `approval_hello` behind human approval.
 *
 * Registrations belong to the mounting context: mounted from an agent preset
 * they are visible only to that preset's sessions, and the approval listener
 * only sees those sessions' calls.
 * @param ctx - the mounting Cordis context.
 * @param config - validated plugin configuration.
 */
export function apply(ctx: Context, config: Config): void {
  // schemastery (Config) has already filled every defaulted field.
  const resolved = config as ResolvedConfig
  console.log(`[hello-plugin] plugin loaded! ${resolved.message}`)

  /** Build one greeting tool; both tools share the same behavior. */
  const greetingTool = (toolName: string, description: string) => defineTool({
    name: toolName,
    description,
    parameters: {
      name: { type: 'string', description: 'Who to greet. Omit to return the configured greeting unchanged.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const target = args.name?.trim()
      return target ? `Hello, ${target}!` : resolved.message
    },
  })

  if (resolved.hello) {
    ctx.tools.register(greetingTool(
      HELLO_TOOL_NAME,
      'Greet the user with the hello plugin greeting, optionally addressed to a name.',
    ))
  }

  if (resolved.approvalHello) {
    ctx.tools.register(greetingTool(
      APPROVAL_HELLO_TOOL_NAME,
      'Greet the user with the hello plugin greeting after human approval, optionally addressed to a name.',
    ))

    // Ask for a one-shot human decision before every `approval_hello` call.
    // Other tools, including `hello`, keep their existing policy decisions.
    ctx.on('tools/pre-execute', async (exec, next): Promise<PreToolDecision> => {
      if (exec.name !== APPROVAL_HELLO_TOOL_NAME) return next()
      const decision = await next()
      if (decision.kind !== 'allow') return decision
      return {
        kind: 'ask',
        reason: 'The approval_hello tool requires human confirmation before it runs',
        displayReason: {
          en: 'Allow the approval_hello tool to return its greeting?',
          zh: '是否允许 approval_hello 工具返回问候语？',
        },
      }
    })
  }
}
