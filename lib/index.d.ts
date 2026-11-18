/**
 * Hello-world Host plugin for DeepSeek Harness.
 *
 * A minimal bundle entry used to verify that the loader resolves the package,
 * imports its entry module, and calls `apply`.
 * @module @potterhe/dsh-helloworld
 */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis plugin name. */
export declare const name = "hello-plugin";
/**
 * Log a line when the loader activates this row.
 * @param _ctx - the mounting Cordis context.
 */
export declare function apply(_ctx: Context): void;
//# sourceMappingURL=index.d.ts.map