/**
 * Hello-world Host plugin for DeepSeek Harness.
 *
 * A minimal bundle entry used to verify that the loader resolves the package,
 * imports its entry module, and calls `apply`, and that the plugin can expose
 * a model-callable tool.
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
    /** Text printed when the plugin loads; also the default greeting of the `hello` tool. */
    message: string;
}
/** Runtime schema for {@link Config}. */
export declare const Config: z<Config>;
/**
 * Log the configured message when the loader activates this row and register
 * the model-callable `hello` tool.
 * @param ctx - the mounting Cordis context.
 * @param config - validated plugin configuration.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map