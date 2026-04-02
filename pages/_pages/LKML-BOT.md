---
layout: single
title: "LKML-BOT"
permalink: /projects/lkml-bot/
excerpt: "Linux 内核邮件列表智能监控机器人"
header:
  overlay_image: /pages/_pages/image/LKML-BOT/feishu.png
  overlay_filter: 0.25
  actions:
    - label: "GitHub 仓库"
      url: "https://github.com/hust-open-atom-club/lkml-bot"
---
# LKML-BOT：Linux 内核邮件列表智能监控机器人

## 一、项目核心功能亮点

LKML-BOT 是一款基于 NoneBot 2 框架构建的智能邮件列表监控机器人，专为 Linux 内核开发者和开源社区成员量身定制：

### 多平台实时推送

- 支持 **Discord** 和 **飞书（Feishu）** 双平台同步推送，团队成员无论使用哪个协作工具都能第一时间获取更新。
- 通过 Webhook 和 Bot API 双通道发送，确保消息送达的可靠性。
- 消息格式针对不同平台深度优化，Discord 使用 Embed 卡片，飞书使用交互式卡片。

### 智能 PATCH 系列识别

- 自动识别 **Cover Letter**、**单补丁** 和 **系列补丁**（如 `[PATCH v2 1/4]`）。
- 支持 **Thread 追踪**：为关注的 PATCH 系列创建独立讨论串，自动聚合后续回复。
- 精准解析邮件元信息，包括版本号、补丁序号、作者、CC 列表等。

### 灵活的过滤规则系统

- **高亮模式**：匹配规则的消息会被特别标记，方便快速定位重要补丁。
- **独占模式**：仅推送匹配规则的消息，过滤噪音，聚焦核心内容。
- 支持按关键词、作者、子系统等多维度配置过滤条件。

### 丰富的交互命令

```
/help           - 查看帮助信息
/subscribe      - 订阅子系统邮件列表
/unsubscribe    - 取消订阅
/start-monitor  - 启动自动监控
/stop-monitor   - 停止监控
/run-monitor    - 手动触发一次检查
/filter         - 配置过滤规则
/watch          - 为 PATCH 系列创建追踪 Thread
```

---

## 二、效果展示

### Discord 平台 - PATCH 卡片通知

*Discord PATCH 卡片示意图待补充。*

**PATCH 卡片**展示了补丁系列的完整信息：
- **标题**：显示完整的 PATCH 主题，如 `[PATCH v3 0/7] docs/zh_CN: Add timers subsystem translation`
- **元信息**：子系统（Subsystem）、提交日期（Date）、作者（Author）
- **系列进度**：Total Patches 显示补丁总数，Received 显示已接收数量（如 7/7）
- **Series 列表**：展开显示系列中每个补丁的标题，方便快速浏览
- **操作提示**：提供 `/watch` 命令，一键创建 Thread 追踪后续讨论

### Discord 平台 - Thread 追踪

*Discord Thread 示意图待补充。*

**Thread 追踪**功能让您不错过任何讨论动态：
- 为重要的 PATCH 系列创建专属讨论串
- 自动聚合该系列的所有回复和版本更新
- 实时显示新消息通知，包括审阅意见、修改建议等
- 清晰的时间线展示，方便回溯讨论历史

### 飞书平台 - 交互式卡片

![Feishu Card]({{ '/pages/_pages/image/LKML-BOT/feishu.png' | relative_url }})

**飞书卡片**：
- **新提交**标签高亮显示新补丁
- 结构化展示：Subsystem、Date、Author、Total Patches、Received
- **Series 列表**：可点击的链接，直接跳转到 lore.kernel.org 查看原文
- **查看补丁详情**按钮，一键访问完整补丁内容

---

## 三、技术细节：架构设计与核心实现

### 分层架构设计

LKML-BOT 采用清晰的分层架构，实现业务逻辑与框架解耦：

*分层架构图待补充。*

### 核心模块简介

| 模块 | 路径 | 职责 |
|-----|------|------|
| **Feed** | `src/lkml/feed/` | 抓取 lore.kernel.org 的 Atom feed，解析邮件并分类（PATCH / Reply / Cover Letter） |
| **Filter** | `src/lkml/service/` | 支持 6 种过滤类型，高亮模式标记匹配项，独占模式只推送匹配消息 |
| **Render** | `src/plugins/lkml_bot/renders/` | 将 PatchCard 渲染为 Discord Embed 或飞书交互卡片 |

---

## 五、应用场景：让内核开发更高效

### 内核子系统维护者

维护者可订阅自己负责的子系统，第一时间收到新补丁通知。通过过滤规则关注特定贡献者或关键模块的修改，高效完成代码审查。

### 开源社区团队协作

团队可在共享的 Discord 服务器或飞书群组中部署机器人，所有成员同步获取邮件列表更新，无需频繁刷新邮箱或 lore.kernel.org。

### 内核开发学习者

对 Linux 内核感兴趣的开发者可以订阅感兴趣的子系统，学习真实的补丁提交流程和代码审查过程，加速学习曲线。

### PATCH 系列追踪

针对重要的补丁系列（如新特性、重大重构），使用 `/watch` 命令创建追踪 Thread，自动聚合所有相关讨论和版本更新。

---

## 六、技术栈一览

| 组件 | 技术选型 | 说明 |
|-----|---------|------|
| 机器人框架 | NoneBot 2 | 异步聊天机器人框架，支持多平台适配 |
| 平台适配 | nonebot-adapter-discord/feishu | 官方适配器，稳定可靠 |
| 数据库 | SQLAlchemy + aiosqlite | 异步 ORM，支持 SQLite/PostgreSQL |
| Feed 解析 | feedparser | 解析 lore.kernel.org 的 Atom feed |
| HTTP 客户端 | httpx | 现代化异步 HTTP 客户端 |
| 数据校验 | Pydantic v2 | 强类型配置与数据模型 |

---

## 七、结语与展望

LKML-BOT 作为华中科技大学开放原子开源俱乐部的开源项目，致力于为 Linux 内核开发者和开源社区提供一款**高效、智能、易用**的邮件列表监控工具。

我们相信，在信息爆炸的时代，帮助开发者从海量邮件中快速筛选出有价值的内容，是提升开发效率的关键。LKML-BOT 正是为此而生。

**未来规划：**

- 持续维护，保障项目正常运行
- 引入 AI 辅助摘要，自动总结补丁内容

开源是 Linux 的核心精神，也是我们团队的坚持。我们诚挚欢迎社区贡献代码、提出建议或报告问题。

**项目地址：** https://github.com/hust-open-atom-club/lkml-bot

让我们携手共进，为 Linux 内核社区的协作效率贡献一份力量！
