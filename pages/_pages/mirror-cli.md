---
layout: single
title: "Mirror CLI"
permalink: /projects/mirror-cli/
excerpt: "一键换源的命令行工具"
header:
  overlay_image: /assets/images/mirrorcli-cover.png
  overlay_filter: 0.25
  actions:
    - label: "GitHub 仓库"
      url: "https://github.com/hust-open-atom-club/hustmirror-cli"
---

# Mirror CLI

**一键换源的命令行工具**

Mirror CLI 是一个便捷的命令行工具，支持快速切换 Ubuntu、Debian、Deepin、PyPI、crates 等多个发行版及工具的镜像源至华中科技大学开源镜像站，显著提升软件包下载速度。

## 项目目标
- 简化镜像源切换流程，提高开发效率。
- 支持多平台（Linux/macOS/Windows）。
- 提供友好的交互式命令行界面。

## 主要功能
- **多镜像支持**：一键切换至 HUST Mirror 提供的镜像源。
- **自动检测**：自动识别当前系统环境，推荐最优镜像配置。
- **回滚功能**：可随时恢复默认镜像源。

## 如何使用
1. 安装 Mirror CLI（详见 [GitHub 仓库](https://github.com/hust-open-atom-club/hustmirror-cli)）。
2. 运行 `mirror-cli set hust` 切换至 HUST 镜像源。
3. 使用 `mirror-cli restore` 恢复默认配置。

## 参与贡献
- **提交 Issue**：反馈问题或建议。
- **提交 PR**：优化代码或新增功能。
- **推广使用**：推荐给开发者社区。

## 联系我们
- **GitHub**: [hust-open-atom-club/hustmirror-cli](https://github.com/hust-open-atom-club/hustmirror-cli)
<!-- - **邮箱**： -->