/**
 * Hello-world Host plugin for DeepSeek Harness.
 *
 * A minimal bundle entry used to verify that the loader resolves the package,
 * imports its entry module, and calls `apply`.
 * @module @potterhe/dsh-helloworld
 */
/** Cordis plugin name. */
export const name = 'hello-plugin';
/**
 * Log a line when the loader activates this row.
 * @param _ctx - the mounting Cordis context.
 */
export function apply(_ctx) {
    console.log('[hello-plugin] plugin loaded!');
}
//# sourceMappingURL=index.js.map