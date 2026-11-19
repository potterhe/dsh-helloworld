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
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name. */
export declare const name = "hello-plugin";
/** Services used by the plugin. */
export declare const inject: string[];
/** Configuration accepted by the hello plugin. */
export interface Config {
    /** Text printed when the plugin loads; also the default greeting of both tools. */
    message: string;
    /** Register the approval-free `hello` tool. Defaults to true. */
    hello?: boolean;
    /** Register `approval_hello`, which asks for human approval before every call. Defaults to true. */
    approvalHello?: boolean;
}
/** Runtime schema for {@link Config}. */
export declare const Config: z<Config>;
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
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map