# dsh-helloworld

### 项目结构

```
.
├── src/index.ts        # Host 插件源码（name + Config + apply + hello / approval_hello 工具）
├── lib/                # tsc 构建产物，随仓库提交
├── cordis.patch.yml    # bundle 层：声明两个按工具拆分的 preset
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

`hello-plugin` 支持以下配置项：

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `message` | `string` | 是 | — | 插件加载时打印的字符串；同时作为两个工具省略 `name` 时的问候语 |
| `hello` | `boolean` | 否 | `true` | 是否注册 `hello` 工具 |
| `approvalHello` | `boolean` | 否 | `true` | 是否注册 `approval_hello` 工具，并安装它的审批监听器 |

在 `cordis.patch.yml` 的插件行中通过 `config` 设置。每个 preset 用两个开关选择自己的工具集合：

```yaml
- id: hello
  name: '@potterhe/dsh-helloworld'
  config:
    message: 'Hello, world!'
    hello: true
    approvalHello: false
```

两个开关都可以是 `false`：插件照常加载并打印 `message`，但不注册任何工具。插件行应放在 preset 内（见下方“Preset”），不要挂到 profile 根组合；挂在根上会向所有 preset 暴露这些工具。

loader 的覆盖语义是整体替换 `config`，因此在 profile 的 `cordis.patch.yml` 中覆盖任一行时也必须提供完整配置（含 `message` 和两个开关）。修改 bundle 内的值后需要重装并重启，覆盖 profile 配置则由 loader 重新加载。

### 工具（Tool）

插件按配置向模型注册问候工具：

| 工具 | 启用配置 | 参数 | 行为 | 人工确认 |
| --- | --- | --- | --- | --- |
| `hello` | `hello: true`（默认） | `name`（`string`，可选） | 返回 `Hello, <name>!`；省略或为空白时返回配置的 `message` | 否 |
| `approval_hello` | `approvalHello: true`（默认） | 同上 | 与 `hello` 完全相同 | 是：每次调用先弹审批，允许后才执行 |

两个工具都返回一个字符串，并以文本块呈现给模型；`name` 为问候对象，省略或为空白时返回配置的 `message`（默认 `Hello, world!`）。注册发生在 `apply` 执行时，并归属于挂载它的作用域：bundle 把插件行放在 preset 内，因此工具只对选中该 preset 的会话可见；profile 根组合不注册这些工具，其他 preset（含默认 preset）看不到它们。

在对应 preset 的会话中可直接要求模型调用，例如：

```text
# hello-world preset
用 hello 工具跟 Ada 打个招呼

# hello-world-approval preset
用 approval_hello 工具跟 Ada 打个招呼
```

前者直接得到 `Hello, Ada!`；后者会先出现审批卡片，点击允许后才得到 `Hello, Ada!`。

`approval_hello` 的访问控制由 `tools/pre-execute` 返回 `ask` 实现：DSH 通过审批通道（Web 的审批卡片）询问一次，只有 `allowed-once` 才执行。拒绝时工具结果为 `the user rejected tool "approval_hello"`（`APPROVAL_REJECTED`）；取消为 `APPROVAL_CANCELLED`；没有可用审批通道或审批策略为 `never`（如 `danger-full-access` 权限模式）时失败关闭（`APPROVAL_UNAVAILABLE`）。PTC 调用（`tools.approval_hello(...)`）与子代理内的调用同样经过这套审批，每次调用独立确认。

工具定义只依赖 `@deepseek-ai/dsh-tools` 的 `defineTool`、`ctx.tools.register` 与 `tools/pre-execute`。`@deepseek-ai/dsh-tools` 由运行中的 dsh 安装提供，仓库内只把它声明为 peer/dev 依赖，用于类型检查与构建。修改 `src/index.ts` 后必须重新 `npm run build`，并重装 bundle、重启 dsh 才会生效（git/Gitee 安装不执行构建脚本）。

### Preset

bundle 声明两个 `@deepseek-ai/dsh-agent-preset`：

| Loader 行 id | preset id | 名称 | 工具 | 说明 |
| --- | --- | --- | --- | --- |
| `preset-helloworld` | `hello-world` | HelloWorld | `hello` | 无需确认的问候 |
| `preset-approval-helloworld` | `hello-world-approval` | HelloWorld Approval | `approval_hello` | 每次调用都需人工确认 |

preset 是 DSH 的会话级组合单元：每个 preset revision 由 `@deepseek-ai/dsh-agent-preset` 在自己的 scope 中挂载 `plugins` 列表，`ctx.tools.register` 注册的工具只对加入该 scope 的会话可见（Agent 通过 `bindScopeParent` 挂到 revision scope）。因此“一个 preset 只暴露一个工具”由两个层面共同保证：

1. 插件行放在 preset 的 `plugins` 里，而不是 profile 根组合；
2. 插件行用 `hello` / `approvalHello` 选择注册哪个工具。

两个 preset 都带 persona、`roll-dice` skill（`skill-filesystem`）和 `tool-skill`，所以 skill 在两个会话里都可用。preset 选择在会话创建时生效；已有会话保留启动时的 revision，修改 preset 只影响之后新建的会话。会话保存的是 `config.id`（`hello-world` / `hello-world-approval`），Loader 行 id 用于 profile 覆盖。


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
