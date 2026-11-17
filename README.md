# dsh-helloworld

### Preset

会话级组合能力



### 组合包（bundle）

[Agent Note: profile 插件组合包取代固定的表层 overlay
](https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/architecture/2026-08-05-profile-plugin-bundles.zh.md)

生效配置的完整叠加顺序是：

1. Profile 的 dsh.profile.bundles 列表所列各 bundle 的 patch（按顺序）
1. Profile 自己的 cordis.patch.yml
1. home 级的 $DSH_HOME/cordis.patch.yml
1. 每个 --patch <path> overlay（按命令行参数顺序）


### Skills

- [Agent Skills](https://agentskills.io/)
- [DeepSeek Harness Skills](https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/skills)