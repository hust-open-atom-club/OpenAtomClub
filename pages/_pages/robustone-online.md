---
layout: single
title: "Robustone-Online"
permalink: /projects/robustone-online/
excerpt: "Robustone-Online"
header:
  overlay_image: /assets/images/20250923_RISC-V/20250923_RISC-V_riscv-online-cover.png
  overlay_filter: 0.25
  actions:
    - label: "访问平台"
      url: "https://rvdis.openatom.club/"
    - label: "GitHub 仓库"
      url: "https://github.com/hust-open-atom-club/robustone-online"
---

# Robustone-Online 

**前身为 riscv-online，现正式更名为 Robustone-Online**

Robustone-Online 是俱乐部开发的一款在线 RISC-V 反汇编工具。随着 Robustone 项目的发展壮大，我们决定将其纳入 Robustone 家族，统一品牌形象，正式更名为 Robustone-Online。

这是一款基于 WebAssembly 技术的在线 RISC-V 汇编反汇编工具，专为 RISC-V 开发者、学习者和研究人员设计。项目将 Rust 编写的反汇编核心编译为 WebAssembly，在浏览器中直接运行，无需任何本地安装和配置。

## 它能做什么？

简单来说：输入十六进制机器码，立即获得对应的 RISC-V 汇编指令。整个过程在浏览器本地完成，响应速度快，数据也不会上传到服务器。

## 技术特点

- **基于 WebAssembly 技术**，Rust 核心编译后在浏览器中以接近原生的速度运行
- **零安装零配置**，打开网页即可使用，支持所有现代浏览器
- **支持移动端访问**，手机平板均可正常使用
- **自动识别 16 位和 32 位指令**，支持解析 GNU objdump 输出格式

## 支持的 RISC-V 指令集扩展

| 扩展                  |      | 状态   |        | 扩展                    |  | 状态   |
| :-------------------- |:----:| :----- | :----: | :------------------------| :----: | :----- |
| RV32I          |       | 已支持 |        | RV64I                 |    | 已支持 |
| RVM (乘除法)      |    | 已支持 |        | RVC (压缩指令)         |   | 已支持 |
| RV32F (单精度浮点) |   | 已支持 |        | RV64F                 |    | 已支持 |
| RVZicsr (CSR指令) |    | 已支持 |        | RV32A/64A/128A (原子指令) | | 已支持 |
| RV64D (双精度浮点)|    | 开发中 |        | RVB (位操作)             | | 开发中 |


## 本地部署

```shell
# 克隆项目
git clone https://github.com/hust-open-atom-club/robustone-online.git
cd robustone-online
# 构建 WebAssembly 模块
cd wasm-riscv-online
wasm-pack build
# 安装依赖并启动开发服务器
cd www
npm install
npm run start
```

启动后访问 http://localhost:8080 即可使用。

**在线体验**：https://rvdis.openatom.club/

**项目地址**：https://github.com/hust-open-atom-club/robustone-online

## 参与贡献
Robustone 系列项目正在积极开发中，我们欢迎各种形式的贡献：
- **报告 Bug 或提出功能建议**
- **提交代码改进或新功能**
- **完善文档和使用示例**
- **添加测试用例**

无论你是 Rust 新手还是资深开发者，无论你是 RISC-V 专家还是刚开始学习，都可以在这里找到参与的机会。

## 联系我们
- **GitHub**：[robustone-online](https://github.com/hust-open-atom-club/robustone-online)
<!-- - **邮箱**： -->
