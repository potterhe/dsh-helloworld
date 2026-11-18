# dsh-helloworld

### 项目结构

```
.
├── src/index.ts        # Host 插件源码（name + Config + apply + hello 工具）
├── lib/                # tsc 构建产物，随仓库提交
├── cordis.patch.yml    # bundle 层：插入 preset 和插件行
├── tsconfig.json       # TypeScript 构建配置
└── skills/roll-dice/   # 示例 skill
```

### 开发

```sh
npm install
npm run build      # src/index.ts -> lib/
npm run typecheck
```

`package.json` 的 `main`/`types` 分别指向 `lib/index.js` 与 `lib/index.d.ts`。`lib/` 是生成产物，但 git/Gitee 安装不会执行构建脚本，因此修改 `src/` 后必须重新构建并提交 `lib/`。`@deepseek-ai/cordis` 仅用于类型导入，声明为 peer/dev 依赖；`@deepseek-ai/schemastery` 用于声明插件配置 schema，声明为运行时依赖。

### 配置

`hello-plugin` 支持一个字符串配置项，插件加载（`apply` 执行）时打印：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `message` | `string` | 是 | 插件加载时打印的字符串；同时作为 `hello` 工具省略 `name` 时的问候语 |

在 `cordis.patch.yml` 的插件行中通过 `config` 设置：

```yaml
- insert:
    - id: hello
      name: '@potterhe/dsh-helloworld'
      config:
        message: Hello, world!
```

loader 的覆盖语义是整体替换 `config`，因此在 profile 的 `cordis.patch.yml` 中覆盖 `hello` 行时也必须提供 `message`。修改 bundle 内的值后需要重装并重启，覆盖 profile 配置则由 loader 重新加载。

### 工具（Tool）

插件加载时向模型注册一个名为 `hello` 的工具：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 否 | 问候对象。传入时返回 `Hello, <name>!`；省略或为空白时返回配置的 `message` |

工具返回一个字符串，并以文本块呈现给模型。注册发生在 `apply` 执行时；由于 `hello` 行挂在 profile 根组合（见下方 bundle 说明），该工具是全局注册，profile 下所有 preset 的模型都能看到并调用。

在会话中可直接要求模型调用，例如：

```text
用 hello 工具跟 Ada 打个招呼
```

预期工具结果为 `Hello, Ada!`；省略或传入空白 `name` 时返回配置中的 `message`（默认 `Hello, world!`）。

工具定义只依赖 `@deepseek-ai/dsh-tools` 的 `defineTool` 与 `ctx.tools.register`。`@deepseek-ai/dsh-tools` 由运行中的 dsh 安装提供，仓库内只把它声明为 peer/dev 依赖，用于类型检查与构建。修改 `src/index.ts` 后必须重新 `npm run build`，并重装 bundle、重启 dsh 才会生效（git/Gitee 安装不执行构建脚本）。

### Preset

会话级组合能力


### 组合包（bundle）

[Agent Note: profile 插件组合包取代固定的表层 overlay](https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/architecture/2026-08-05-profile-plugin-bundles.zh.md)

生效配置的完整叠加顺序是：

1. Profile 的 dsh.profile.bundles 列表所列各 bundle 的 patch（按顺序）
1. Profile 自己的 cordis.patch.yml
1. home 级的 $DSH_HOME/cordis.patch.yml
1. 每个 --patch <path> overlay（按命令行参数顺序）


### Skills

- [Agent Skills](https://agentskills.io/)
- [DeepSeek Harness Skills](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/skills)
- Skills 只对特定 Preset 可见，官方内置的[创造模式（cordis preset）](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/bundle/web-app/presets/cordis.patch.yml)是一个样例，Skills的定义在[agent-preset](https://github.com/deepseek-ai/deepseek-harness/tree/dsh-v0.2.2-rc.3/packages/preset/agent-preset)
- preset 不配置“@deepseek-ai/dsh-tool-skill”时，对话框中使用'/'能展示skills，但模型看不到。修复方法，preset 的 plugin 里添加 tool-skill

```yaml
- id: tool-skill
  name: '@deepseek-ai/dsh-tool-skill'
```
