---
layout: single
title: "hustsync.rs"
permalink: /projects/hustsync-rs/
excerpt: "Rust 重写的镜像同步工具开源课题"
header:
  overlay_image: /assets/images/index.jpg
  overlay_filter: 0.25
  actions:
    - label: "GitHub 仓库"
      url: "https://github.com/hust-open-atom-club/hustsync.rs"
---

# Rust 重写的镜像同步工具开源课题任务书

## 一、课题基本信息

- **课题名称**：hustsync.rs - Rust 重写镜像同步工具
- **指导导师**：慕冬亮，王英吉
- **开发语言**：Rust
- **预计项目时长**：6 个月
- **难度等级**：中等
- **课题背景信息介绍**：[hustsync.rs](https://github.com/hust-open-atom-club/hustsync.rs) 采用 Rust 对 [tunasync](https://github.com/tuna/tunasync) 重写。期望适配更多运行环境（包括 Linux、Windows 等主流平台以及 X86、aarch64 等处理器架构），提供较于原 Go 实现更优秀性能，以及面向未来的高扩展性架构。

## 二、技能要求

- 了解 Git 版本控制与 Github 开源协作流程
- 熟悉 Rust 核心特性，所有权、引用、智能指针、Trait、错误处理
- 了解 Rust 异步编程，Tokio 生态异步运行时和异步锁
- 掌握 Rust 工具，Clippy 约束生产代码质量
- Nice To Have：优秀的 Vibe 编程能力，精确驱动 AI 工具工程实践

## 三、课题任务

- 任务1：Docker Provider
  - 为 worker 新增容器化同步执行路径，使配置了 Docker 镜像的同步任务在容器内环境变量注入、运行，行为、参数与 tunasync 原版对齐
- 任务2：Manager 和 Worker 实现 `/metrics` 端点，输出 Prometheus 格式指标，用于监控与可视化
  - 镜像总数与按状态分布, Worker 在线数, 最近同步时长
  - 失败次数与成功次数
  - 任务队列长度、并发任务数
- 任务3 ：Linux cgroup(v1 与 v2) 执行集成
  - 落地配置中已定义但尚未生效的 cgroup 资源隔离，使 worker 子进程受限于 cgroup 约束，行为对齐 tunasync 原版。
  - worker 启动时为任务创建专属 cgroup，子进程 fork 后加入，任务结束自动清理
  - 支持内存上限配置 memory_limit, 超限任务被正确 OOM Kill 并上报失败
  - 编写需要 root 权限的集成测试
- 任务4: 前端网站适配
  - 适配 hustsync.rs 与镜像站目前使用的前端镜像网站
  - 使用俱乐部服务器进行部署并测试运行 1 个月 
- 任务5：编写完整链路，Manager 和 Worker 部署文档
  - 参照 tunasync 撰写多种样例

## 四、课题验收

**验收时间**：本课题预计于[2026-10-22]开展课题验收，验收项如下所示：

- **代码**：完整的功能实现代码，提交至开源仓库并通过 CI 检查，Clippy 无 warning
- **文档**：部署文档清晰完整，可指导完成 Manager/Worker 部署
- **汇报**：课题总结 PPT 或技术博客。鼓励以博客方式发布，便于社区传播与知识沉淀
- **展示**：成功合入项目主分支或演示实现特性
