/**
 * GUI-Agent 配置文件
 */
(function(window) {
  'use strict';

  const GUIAgentConfig = {
    // DOM 缓存配置
    domCache: {
      enabled: true,
      maxElements: 1000,
      refreshInterval: 5000, // 5秒刷新间隔
      useIdleCallback: true, // 使用 requestIdleCallback
      observeMutations: true // 监听 DOM 变化
    },

    // 大鼠标配置
    cursor: {
      size: 60, // 外圈直径 (px)
      dotSize: 12, // 内点直径 (px)
      color: '#3b82f6', // 现代蓝色
      animationDuration: 800, // 移动动画时长 (ms)
      clickRippleDuration: 600, // 涟漪动画时长 (ms)
      zIndex: 999999
    },

    // 控制面板配置
    ui: {
      defaultPosition: 'bottom-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
      width: 380, // 面板宽度 (px)
      minWidth: 300,
      maxWidth: 600,
      theme: 'auto', // 'light' | 'dark' | 'auto'
      shortcuts: {
        toggle: 'Control+Shift+A', // 唤起/隐藏
        cancel: 'Escape' // 取消
      },
      savePosition: true, // 保存面板位置
      showHistory: true, // 显示指令历史
      maxHistory: 20 // 最大历史记录数
    },

    // 日志配置
    debug: {
      enabled: true, // 开发模式启用
      logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
      showTimestamp: true,
      showElementBounds: false // 调试时显示元素边界
    },

    // 预定义规则（降级方案）
    rules: [
      { pattern: /首页|home|主页/i, action: 'click', selector: 'a[href="/"]', keywords: ['首页', 'home'] },
      { pattern: /新闻|news/i, action: 'click', selector: 'a[href*="news"]', keywords: ['新闻', 'news'] },
      { pattern: /wiki|文档/i, action: 'click', selector: 'a[href*="wiki"]', keywords: ['wiki', '文档'] },
      { pattern: /联系|contact/i, action: 'click', selector: 'a[href*="contact"]', keywords: ['联系', 'contact'] },
      { pattern: /服务|service/i, action: 'click', selector: 'a[href*="service"]', keywords: ['服务', 'service'] },
      { pattern: /关于|about/i, action: 'click', selector: 'a[href*="about"]', keywords: ['关于', 'about'] }
    ],

    // 性能配置
    performance: {
      domParseTimeout: 100, // DOM 解析超时 (ms)
      animationFps: 60, // 动画帧率
      throttleScroll: 100, // 滚动节流 (ms)
      debounceResize: 200 // 窗口调整防抖 (ms)
    },

    // 可交互元素选择器
    interactiveSelectors: [
      'a[href]:not([href="#"])',
      'button:not([disabled])',
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[onclick]',
      '[role="button"]',
      '[role="link"]',
      '[tabindex]:not([tabindex="-1"])'
    ]
  };

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.Config = GUIAgentConfig;

  // 从 Jekyll 配置合并自定义配置
  if (window.GUIAgentConfig) {
    Object.keys(window.GUIAgentConfig).forEach(key => {
      if (typeof window.GUIAgentConfig[key] === 'object' && !Array.isArray(window.GUIAgentConfig[key])) {
        GUIAgentConfig[key] = Object.assign({}, GUIAgentConfig[key], window.GUIAgentConfig[key]);
      } else {
        GUIAgentConfig[key] = window.GUIAgentConfig[key];
      }
    });
  }

})(window);
