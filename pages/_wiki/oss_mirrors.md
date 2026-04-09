---
title: "华科大开源镜像站"
layout: splash
excerpt: "安全、快速、稳定的开源软件分发服务"
header:
  overlay_image: /assets/images/index.jpg
  overlay_filter: 0.25
---

## 一、项目概况

华中科技大学开源镜像站（HUST Mirror）是一个由华中科技大学网络空间安全学院联合网络与信息化办公室共同开发与维护的开源软件基础设施项目。该项目由开放原子开源俱乐部主导，联合校 Linux 协会等学生团队具体实施。

- **主要目标**：为华中地区乃至全国的开发者、科研人员及高校师生提供安全、快速、稳定且免费的开源软件分发服务，解决因地理位置和网络限制导致的官方源访问缓慢问题。
- **上线时间**：于 2023 年 11 月通过校园内网（mirrors.hust.edu.cn）上线内测，并于 2024 年 5 月正式开放外网访问。
- **项目理念**：完全采用开源方式进行开发与构建，并基于纯国产软硬件平台部署，是"产学研用"一体化育人模式的实践案例。
- **链接**：[https://mirrors.hust.edu.cn](https://mirrors.hust.edu.cn)

## 二、技术架构

### 软件层面

- **后端同步**：采用清华大学 TUNA 镜像站团队开发的 tunasync 开源同步管理器，负责从上游官方源同步文件。
- **前端网站**：基于 Docusaurus 2/3 框架自主设计开发。
- **Web 服务**：使用 Nginx 作为对外服务的静态文件服务器，并通过 git-http-backend 提供 Git 克隆服务。
- **部署方式**：采用 Docker Compose 进行容器化部署，各模块（同步管理器、Worker、Web 服务、CI/CD 等）独立运行于容器中。
- **自动化**：通过 CI/CD（crontab）每天自动从 GitHub 仓库拉取更新，生成最新的静态网页。

### 硬件层面

完全采用纯国产软硬件构建：

- **处理器**：华为鲲鹏 920（基于 ARM 架构）
- **操作系统**：openEuler ARM 22.03 LTS

## 三、工作流程与模块组成

### 内容生成模块

- **tunasync**：定期从上游（如 Debian、Ubuntu 官方源）使用 rsync、git 等工具同步文件。
- **CI/CD**：每日从 GitHub 仓库拉取网站源码和内容（如博客、通知），自动更新网页。

### 服务模块

- **Nginx**：作为唯一对外暴露的服务，提供静态文件下载、Git 仓库的克隆服务（通过 CGI）以及同步状态查询接口。

## 四、管理方法

### 服务管理

通过 Docker Compose 命令管理位于 `/mnt/mirror/deploy` 目录下的各个容器，可查看、启动、停止各模块服务。

### 同步管理

- 核心配置文件：`/mnt/mirror/deploy/tunasync-config/worker.toml`
- 使用 `tunasynctl` 命令进行日常管理：
  - `tunasynctl reload -w cse_mirror <镜像名>`：重载配置
  - `tunasynctl start/stop/disable -w cse_mirror <镜像名>`：启动、暂停、禁用某个镜像的同步

### 内容发布

通知、公告等通过修改镜像站前端 GitHub 仓库（hust-mirrors）中 `blog/` 目录下的 MDX 文件来发布。维护者提交更改后，由 CI/CD 自动部署更新。

## 五、规模与影响力

### 数据规模

- 已同步超过 **66 个**开源软件镜像（包括 openKylin、openEuler、Deepin、Ubuntu、Arch Linux 等）
- 有效镜像数据容量超过 **102TB**
- 平均月流量超过 **230TB**，月均访问量 **6800 万次**

### 社会效益

- 弥补了华中地区缺乏大型开源镜像站的空白，显著提升了区域开源软件获取能力和信息技术基础设施水平
- 为高校科研、教学、产业开发提供了基础支撑
- 项目已在 2024 年"开源安全奖励计划"中荣获"原创开源软件"赛道三等奖

### 社区与生态

- 已被 openEuler、Deepin、Ubuntu、Arch Linux 等多个主流发行版认可为官方镜像源
- 所有代码（前端、同步配置、管理工具）均开源在 [GitHub](https://github.com/hust-open-atom-club/hust-mirrors) 和 Gitee 平台，采用标准化开源治理流程
- 形成了由教师、博士生、硕士生、本科生组成的约 **15 人**的可持续运维团队

## 六、相关工具与项目

### hustmirror-cli

一款开源的命令行换源工具，支持一键为多种 Linux 发行版和软件包管理器（如 apt、pacman、rustup、pip）切换至华科镜像源，提升用户使用体验。

- **项目地址**：[hust-open-atom-club/hustmirror-cli](https://github.com/hust-open-atom-club/hustmirror-cli)

### "开源之夏"项目

在 2025 年开源之夏活动中发布了"镜像站文档与 CLI 工具代码自动同步生成工具的研发"项目，旨在通过自动化工具统一维护文档和 CLI 工具的配置，提升项目维护效率。

## 七、核心价值

华中科技大学开源镜像站不仅是一项技术工程，更是一个成功的开源教育与实践平台。它通过"边建设、边运营、边培养"的模式，让学生在真实的工业级项目中学习 DevOps、系统运维、开源协作等技能，实现了人才培养、社区建设与公共服务的三重目标，是高校参与开源生态建设的典范。
