/**
 * DOMParser - DOM 解析器
 * 解析页面上的可交互元素并缓存
 */
(function(window) {
  'use strict';

  class DOMParser {
    constructor(config, logger, eventEmitter) {
      this.config = config;
      this.logger = logger;
      this.events = eventEmitter;
      this.mapper = new window.GUIAgent.ElementMapper();
      this.observer = null;
      this.parseInProgress = false;
      this.lastParseTime = 0;
    }

    /**
     * 初始化
     */
    async init() {
      this.logger.info('[DOMParser] Initializing...');
      await this.parse();
      this._setupMutationObserver();
      this.events.emit('dom:ready', this.mapper);
      this.logger.info('[DOMParser] Initialized. Elements:', this.mapper.size());
    }

    /**
     * 解析页面上的可交互元素
     */
    async parse() {
      if (this.parseInProgress) {
        this.logger.warn('[DOMParser] Parse already in progress');
        return;
      }

      this.parseInProgress = true;
      this.logger.timeStart('DOM Parse');

      try {
        const selectors = this.config.interactiveSelectors;
        const elements = document.querySelectorAll(selectors.join(','));

        this.logger.debug(`[DOMParser] Found ${elements.length} potential elements`);

        const batchSize = 50;
        for (let i = 0; i < elements.length; i += batchSize) {
          const batch = Array.from(elements).slice(i, i + batchSize);
          await this._parseBatch(batch);

          // 避免阻塞主线程
          if (i + batchSize < elements.length) {
            await this._yieldToMain();
          }
        }

        this.lastParseTime = Date.now();
        this.events.emit('dom:parsed', this.mapper);
        this.logger.info(`[DOMParser] Parsed ${this.mapper.size()} elements`);
      } catch (error) {
        this.logger.error('[DOMParser] Parse error:', error);
      } finally {
        this.parseInProgress = false;
        this.logger.timeEnd('DOM Parse');
      }
    }

    /**
     * 批量解析元素
     * @private
     */
    async _parseBatch(elements) {
      for (const elem of elements) {
        if (!this._isVisible(elem)) continue;

        const info = this._extractElementInfo(elem);
        if (info) {
          this.mapper.add(info);
        }
      }
    }

    /**
     * 提取元素信息
     * @private
     */
    _extractElementInfo(elem) {
      try {
        const text = this._extractText(elem);
        const keywords = this._extractKeywords(elem);
        const type = this._getElementType(elem);
        const position = elem.getBoundingClientRect();
        const selector = this._generateSelector(elem);

        return {
          node: elem,
          type,
          text,
          keywords,
          selector,
          position: {
            x: position.left + window.pageXOffset,
            y: position.top + window.pageYOffset,
            width: position.width,
            height: position.height
          },
          score: this._calculateScore(elem, text, type)
        };
      } catch (error) {
        this.logger.error('[DOMParser] Error extracting element info:', error);
        return null;
      }
    }

    /**
     * 提取元素文本
     * @private
     */
    _extractText(elem) {
      // 优先级：aria-label > innerText > value > alt
      const text = elem.getAttribute('aria-label') ||
                   elem.innerText ||
                   elem.value ||
                   elem.getAttribute('alt') ||
                   elem.getAttribute('title') ||
                   '';
      return text.trim().substring(0, 200); // 限制长度
    }

    /**
     * 提取关键词
     * @private
     */
    _extractKeywords(elem) {
      const keywords = new Set();

      // 文本内容
      const text = this._extractText(elem);
      if (text) {
        text.split(/\s+/).forEach(word => {
          if (word.length > 1) keywords.add(word.toLowerCase());
        });
      }

      // aria-label
      const ariaLabel = elem.getAttribute('aria-label');
      if (ariaLabel) {
        ariaLabel.split(/\s+/).forEach(word => {
          if (word.length > 1) keywords.add(word.toLowerCase());
        });
      }

      // title
      const title = elem.getAttribute('title');
      if (title) {
        title.split(/\s+/).forEach(word => {
          if (word.length > 1) keywords.add(word.toLowerCase());
        });
      }

      // class names (语义化的)
      const classList = elem.classList;
      if (classList && classList.length > 0) {
        Array.from(classList).forEach(cls => {
          if (cls.length > 3 && !/^[0-9]+$/.test(cls) && !/^(btn|button|link|nav)$/.test(cls)) {
            keywords.add(cls.toLowerCase());
          }
        });
      }

      // href（for links）
      if (elem.tagName === 'A') {
        const href = elem.getAttribute('href');
        if (href && href !== '#') {
          const parts = href.split('/').filter(p => p && p !== '#');
          parts.forEach(part => {
            if (part.length > 2 && !part.includes('.')) {
              keywords.add(part.toLowerCase());
            }
          });
        }
      }

      return Array.from(keywords);
    }

    /**
     * 获取元素类型
     * @private
     */
    _getElementType(elem) {
      const tagName = elem.tagName.toLowerCase();
      if (tagName === 'a') return 'link';
      if (tagName === 'button' || elem.getAttribute('role') === 'button') return 'button';
      if (tagName === 'input') {
        const type = elem.getAttribute('type') || 'text';
        return `input-${type}`;
      }
      if (tagName === 'select') return 'select';
      if (tagName === 'textarea') return 'textarea';
      if (elem.hasAttribute('onclick')) return 'clickable';
      return 'interactive';
    }

    /**
     * 生成 CSS 选择器
     * @private
     */
    _generateSelector(elem) {
      if (elem.id) {
        return `#${elem.id}`;
      }

      const path = [];
      let current = elem;

      while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.className && typeof current.className === 'string') {
          const classes = current.className.trim().split(/\s+/).slice(0, 2);
          if (classes.length > 0) {
            selector += '.' + classes.join('.');
          }
        }

        path.unshift(selector);
        current = current.parentElement;

        if (path.length >= 4) break; // 限制深度
      }

      return path.join(' > ');
    }

    /**
     * 计算元素可交互性评分
     * @private
     */
    _calculateScore(elem, text, type) {
      let score = 1.0;

      // 类型评分
      if (type === 'link' || type === 'button') score += 0.5;

      // 文本评分
      if (text.length > 0 && text.length < 50) score += 0.3;

      // 可见性评分
      const rect = elem.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20) score += 0.2;

      // 位置评分（上半部分权重更高）
      if (rect.top < window.innerHeight / 2) score += 0.1;

      return score;
    }

    /**
     * 检查元素是否可见
     * @private
     */
    _isVisible(elem) {
      if (!elem.offsetParent && elem.tagName !== 'BODY') return false;

      const style = window.getComputedStyle(elem);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }

      const rect = elem.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      return true;
    }

    /**
     * 让渡主线程（避免阻塞）
     * @private
     */
    _yieldToMain() {
      return new Promise(resolve => {
        if ('requestIdleCallback' in window && this.config.domCache.useIdleCallback) {
          requestIdleCallback(resolve, { timeout: 50 });
        } else {
          setTimeout(resolve, 0);
        }
      });
    }

    /**
     * 设置 MutationObserver 监听 DOM 变化
     * @private
     */
    _setupMutationObserver() {
      if (!this.config.domCache.observeMutations) return;

      this.observer = new MutationObserver((mutations) => {
        this._handleMutations(mutations);
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden']
      });

      this.logger.debug('[DOMParser] MutationObserver setup complete');
    }

    /**
     * 处理 DOM 变化
     * @private
     */
    _handleMutations(mutations) {
      // 节流：避免频繁更新
      const now = Date.now();
      if (now - this.lastParseTime < this.config.domCache.refreshInterval) {
        return;
      }

      this.logger.debug(`[DOMParser] Detected ${mutations.length} mutations`);

      // 简单策略：有重大变化则重新解析
      const hasSignificantChange = mutations.some(mutation =>
        mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
      );

      if (hasSignificantChange) {
        this.logger.info('[DOMParser] Significant DOM change detected, re-parsing...');
        // 清空并重新解析
        this.mapper.clear();
        this.parse();
      }
    }

    /**
     * 搜索元素
     * @param {string} query - 查询字符串
     * @param {object} options - 选项
     * @returns {Array}
     */
    search(query, options = {}) {
      return this.mapper.search(query, options);
    }

    /**
     * 按ID获取元素
     * @param {string} id - 元素ID
     * @returns {object|null}
     */
    getElementById(id) {
      return this.mapper.getById(id);
    }

    /**
     * 销毁
     */
    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.mapper.clear();
      this.logger.info('[DOMParser] Destroyed');
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.DOMParser = DOMParser;

})(window);
