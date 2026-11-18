/**
 * Hello-world Host plugin for DeepSeek Harness.
 *
 * A minimal bundle entry used to verify that the loader resolves the package,
 * imports its entry module, and calls `apply`, and that the plugin can expose
 * model-callable tools, including one gated by human approval.
 * @module @potterhe/dsh-helloworld
 */
import { defineTool } from '@deepseek-ai/dsh-tools';
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name. */
export const name = 'hello-plugin';
/** Services used by the plugin. */
export const inject = ['tools'];
/** Tool that greets without any approval. */
const HELLO_TOOL_NAME = 'hello';
/** Tool that greets only after a human approves the call. */
const APPROVAL_HELLO_TOOL_NAME = 'approval_hello';
/** Runtime schema for {@link Config}. */
export const Config = z.object({
    message: z.string().required(),
});
/**
 * Log the configured message when the loader activates this row, register the
 * `hello` and `approval_hello` tools, and gate the latter behind human approval.
 * @param ctx - the mounting Cordis context.
 * @param config - validated plugin configuration.
 */
export function apply(ctx, config) {
    console.log(`[hello-plugin] plugin loaded! ${config.message}`);
    /** Build one greeting tool; both tools share the same behavior. */
    const greetingTool = (toolName, description) => defineTool({
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
            const target = args.name?.trim();
            return target ? `Hello, ${target}!` : config.message;
        },
    });
    ctx.tools.register(greetingTool(HELLO_TOOL_NAME, 'Greet the user with the hello plugin greeting, optionally addressed to a name.'));
    ctx.tools.register(greetingTool(APPROVAL_HELLO_TOOL_NAME, 'Greet the user with the hello plugin greeting after human approval, optionally addressed to a name.'));
    // Ask for a one-shot human decision before every `approval_hello` call.
    // Other tools, including `hello`, keep their existing policy decisions.
    ctx.on('tools/pre-execute', async (exec, next) => {
        if (exec.name !== APPROVAL_HELLO_TOOL_NAME)
            return next();
        const decision = await next();
        if (decision.kind !== 'allow')
            return decision;
        return {
            kind: 'ask',
            reason: 'The approval_hello tool requires human confirmation before it runs',
            displayReason: {
                en: 'Allow the approval_hello tool to return its greeting?',
                zh: '是否允许 approval_hello 工具返回问候语？',
            },
        };
    });
}
//# sourceMappingURL=index.js.map