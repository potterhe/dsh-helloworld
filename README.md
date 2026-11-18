# dsh-helloworld

### 项目结构

```
.
├── src/index.ts        # Host 插件源码（name + apply）
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

`package.json` 的 `main`/`types` 分别指向 `lib/index.js` 与 `lib/index.d.ts`。`lib/` 是生成产物，但 git/Gitee 安装不会执行构建脚本，因此修改 `src/` 后必须重新构建并提交 `lib/`。`@deepseek-ai/cordis` 仅用于类型导入，声明为 peer/dev 依赖。

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
