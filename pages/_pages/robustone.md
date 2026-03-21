---
layout: single
title: "Robustone"
permalink: /projects/robustone/
excerpt: "Rust 重写的 Capstone 反汇编引擎"
header:
  overlay_image: /assets/images/20260205/robustone.png
  overlay_filter: 0.25
  actions:
    - label: "GitHub 仓库"
      url: "https://github.com/hust-open-atom-club/Robustone"
---

# Robustone 

**Rust 重写的 Capstone 反汇编引擎**

Robustone 是一个使用 Rust 语言编写的反汇编引擎，灵感来源于著名的开源项目 Capstone。Capstone 是一个轻量级的多平台、多架构反汇编框架，被广泛应用于安全研究、逆向工程等领域。然而，Capstone 使用 C 语言编写，存在潜在的内存安全问题，代码维护成本也较高。Robustone 的目标是探索如何利用 Rust 的内存安全特性和现代语言优势，打造一个代码更清晰、可维护性更强的 Capstone 替代方案。目前项目已实现与原版 cstool 命令行工具高度兼容的接口和输出格式，开发者可以无缝切换使用。

## 技术特点
- **纯 Rust 实现**，编译期保证内存安全，避免空指针、缓冲区溢出等常见漏洞
- **模块化的项目架构**：robustone-core 负责架构特定的解码和格式化逻辑，robustone-cli 负责命令行交互
- **完善的测试框架**：通过 Python 脚本自动对比 Robustone 与 Capstone 的输出结果，确保一致性
- **支持 RISC-V 32 位指令集**，后续将逐步扩展更多架构

## 使用示例
```
# 解码 RISC-V 指令
make run -- riscv32 13000513 -d
```

## 参与贡献
- **提交 PR**：在 GitHub 仓库(https://github.com/hust-open-atom-club/Robustone) 中提交Pull Request。
- **优化改进**：优化页面或新增功能。

## 联系我们
- **GitHub**：[Robustone](https://github.com/hust-open-atom-club/Robustone)
<!-- - **邮箱**： -->
