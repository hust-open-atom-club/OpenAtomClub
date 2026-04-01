/**
 * BigCursor - 大鼠标控制器
 * 管理大鼠标的显示、移动和交互
 */
(function(window) {
  'use strict';

  class BigCursor {
    constructor(config, logger, eventEmitter) {
      this.config = config;
      this.logger = logger;
      this.events = eventEmitter;
      this.element = null;
      this.animator = null;
      this.currentTarget = null;
      this.isVisible = false;
    }

    /**
     * 初始化
     */
    init() {
      this.logger.info('[BigCursor] Initializing...');

      // 创建HTML结构
      this._createElements();

      // 创建动画引擎
      this.animator = new window.GUIAgent.CursorAnimator(this.element, this.config.cursor);

      // 初始隐藏
      this.element.style.display = 'none';
      this.element.style.opacity = '0';

      this.logger.info('[BigCursor] Initialized');
    }

    /**
     * 创建HTML元素
     * @private
     */
    _createElements() {
      this.element = document.createElement('div');
      this.element.id = 'gui-agent-cursor';
      this.element.className = 'ga-cursor';
      this.element.style.zIndex = this.config.cursor.zIndex;

      this.element.innerHTML = `
        <div class="ga-cursor-ring"></div>
        <div class="ga-cursor-dot"></div>
        <div class="ga-cursor-ripple"></div>
      `;

      document.body.appendChild(this.element);
    }

    /**
     * 显示大鼠标
     */
    async show() {
      if (this.isVisible) return;

      this.logger.debug('[BigCursor] Showing');
      await this.animator.fadeIn();
      this.isVisible = true;
      this.events.emit('cursor:shown');
    }

    /**
     * 隐藏大鼠标
     */
    async hide() {
      if (!this.isVisible) return;

      this.logger.debug('[BigCursor] Hiding');
      await this.animator.fadeOut();
      this.isVisible = false;
      this.currentTarget = null;
      this.events.emit('cursor:hidden');
    }

    /**
     * 移动到目标元素
     * @param {HTMLElement|object} target - 目标元素或元素信息
     * @param {object} options - 选项
     * @returns {Promise}
     */
    async moveTo(target, options = {}) {
      const {
        duration = this.config.cursor.animationDuration,
        autoScroll = true,
        showHover = true
      } = options;

      // 获取目标元素
      let element = target;
      if (target && typeof target === 'object' && target.node) {
        element = target.node;
      }

      if (!element || !(element instanceof HTMLElement)) {
        this.logger.error('[BigCursor] Invalid target element');
        return;
      }

      this.logger.debug('[BigCursor] Moving to element:', element);

      // 如果元素不在视口内，先滚动到可见区域
      if (autoScroll) {
        await this._scrollIntoView(element);
      }

      // 获取元素位置
      const rect = element.getBoundingClientRect();
      const targetX = rect.left + window.pageXOffset + rect.width / 2;
      const targetY = rect.top + window.pageYOffset + rect.height / 2;

      // 显示鼠标
      if (!this.isVisible) {
        await this.show();
      }

      // 移动动画
      await this.animator.moveTo(targetX, targetY, duration);

      // 保存当前目标
      this.currentTarget = element;

      // 添加悬停效果
      if (showHover) {
        this.animator.startHover();
      }

      this.events.emit('cursor:moved', element);
    }

    /**
     * 滚动元素到可见区域
     * @private
     */
    async _scrollIntoView(element) {
      const rect = element.getBoundingClientRect();
      const isInView = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );

      if (!isInView) {
        this.logger.debug('[BigCursor] Scrolling element into view');
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });

        // 等待滚动完成
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    /**
     * 执行点击
     * @param {object} options - 选项
     * @returns {Promise}
     */
    async click(options = {}) {
      const { triggerEvents = true } = options;

      if (!this.currentTarget) {
        this.logger.warn('[BigCursor] No target element to click');
        return;
      }

      this.logger.info('[BigCursor] Clicking element:', this.currentTarget);

      try {
        // 停止悬停动画
        this.animator.stopHover();

        // 显示涟漪动画
        await this.animator.ripple();

        // 触发点击事件
        if (triggerEvents) {
          await this._triggerClick(this.currentTarget);
        }

        // 显示成功反馈
        await this.animator.showSuccess();

        this.events.emit('cursor:clicked', this.currentTarget);

      } catch (error) {
        this.logger.error('[BigCursor] Click error:', error);
        await this.animator.showError();
        this.events.emit('cursor:error', error);
      }
    }

    /**
     * 触发点击事件
     * @private
     */
    async _triggerClick(element) {
      const rect = element.getBoundingClientRect();

      // 创建完整的事件序列
      const eventTypes = ['mousedown', 'mouseup', 'click'];
      const eventOptions = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        screenX: rect.left + rect.width / 2 + window.screenX,
        screenY: rect.top + rect.height / 2 + window.screenY,
        button: 0,
        buttons: 1
      };

      for (const eventType of eventTypes) {
        const event = new MouseEvent(eventType, eventOptions);
        element.dispatchEvent(event);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 如果是链接，直接导航
      if (element.tagName === 'A' && element.href) {
        this.logger.debug('[BigCursor] Navigating to:', element.href);
        await new Promise(resolve => setTimeout(resolve, 300)); // 等待动画完成
        window.location.href = element.href;
      }
    }

    /**
     * 移动并点击
     * @param {HTMLElement|object} target - 目标元素或元素信息
     * @param {object} options - 选项
     * @returns {Promise}
     */
    async moveAndClick(target, options = {}) {
      await this.moveTo(target, options);
      await new Promise(resolve => setTimeout(resolve, 200)); // 短暂停留
      await this.click(options);
    }

    /**
     * 获取当前目标
     * @returns {HTMLElement|null}
     */
    getCurrentTarget() {
      return this.currentTarget;
    }

    /**
     * 是否可见
     * @returns {boolean}
     */
    visible() {
      return this.isVisible;
    }

    /**
     * 销毁
     */
    destroy() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
      this.animator = null;
      this.currentTarget = null;
      this.isVisible = false;
      this.logger.info('[BigCursor] Destroyed');
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.BigCursor = BigCursor;

})(window);
