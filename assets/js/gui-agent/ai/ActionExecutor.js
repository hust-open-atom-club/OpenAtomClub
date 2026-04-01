/**
 * ActionExecutor - 动作执行器
 * 执行解析后的动作指令
 */
(function(window) {
  'use strict';

  class ActionExecutor {
    constructor(logger, eventEmitter, bigCursor) {
      this.logger = logger;
      this.events = eventEmitter;
      this.cursor = bigCursor;
      this.isExecuting = false;
    }

    /**
     * 执行动作
     * @param {object} parsedCommand - 解析后的指令
     * @returns {Promise<object>} - 执行结果
     */
    async execute(parsedCommand) {
      if (this.isExecuting) {
        throw new Error('正在执行其他操作，请稍候');
      }

      this.isExecuting = true;
      this.logger.info('[ActionExecutor] Executing:', parsedCommand);

      try {
        let result;

        switch (parsedCommand.action) {
          case 'click':
            result = await this._executeClick(parsedCommand.target);
            break;

          case 'navigate':
            result = await this._executeNavigate(parsedCommand.target);
            break;

          case 'scroll':
            result = await this._executeScroll(parsedCommand.target);
            break;

          case 'none':
            throw new Error('无法执行该操作');

          default:
            throw new Error(`未知的操作类型: ${parsedCommand.action}`);
        }

        this.events.emit('action:success', result);
        return result;

      } catch (error) {
        this.logger.error('[ActionExecutor] Execution failed:', error);
        this.events.emit('action:error', error);
        throw error;

      } finally {
        this.isExecuting = false;
      }
    }

    /**
     * 执行点击
     * @private
     */
    async _executeClick(target) {
      this.logger.info('[ActionExecutor] Clicking element:', target);
      const element = target.node || target;
      const pageMayChange = this._isNavigatingElement(element);

      // 使用大鼠标移动并点击
      await this.cursor.moveAndClick(target, {
        autoScroll: true,
        showHover: true
      });

      return {
        action: 'click',
        target,
        success: true,
        message: pageMayChange ? '点击成功，正在进入下一页...' : '点击成功',
        pageMayChange
      };
    }

    /**
     * 执行导航
     * @private
     */
    async _executeNavigate(target) {
      this.logger.info('[ActionExecutor] Navigating to:', target);

      let url = '';

      if (typeof target === 'string') {
        url = target;
      } else if (target.node && target.node.href) {
        url = target.node.href;
      }

      if (!url) {
        throw new Error('无法获取导航地址');
      }

      // 先移动鼠标到链接（如果有对应元素）
      if (target.node) {
        await this.cursor.moveTo(target);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      window.location.href = url;

      return {
        action: 'navigate',
        url,
        success: true,
        message: '正在跳转...',
        pageMayChange: true
      };
    }

    /**
     * 执行滚动
     * @private
     */
    async _executeScroll(target) {
      this.logger.info('[ActionExecutor] Scrolling to element:', target);

      const element = target.node || target;

      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('无效的滚动目标');
      }

      // 平滑滚动到元素
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });

      // 移动鼠标到元素
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.cursor.moveTo(target);

      return {
        action: 'scroll',
        target,
        success: true,
        message: '滚动完成',
        pageMayChange: false
      };
    }

    /**
     * 判断动作是否可能触发页面跳转
     * @param {object} parsedCommand - 解析后的指令
     * @returns {boolean}
     */
    willChangePage(parsedCommand) {
      if (!parsedCommand) {
        return false;
      }

      if (parsedCommand.action === 'navigate') {
        return true;
      }

      if (parsedCommand.action === 'click') {
        return this._isNavigatingElement(parsedCommand.target?.node || parsedCommand.target);
      }

      return false;
    }

    /**
     * 判断元素点击后是否可能触发页面跳转
     * @param {HTMLElement|null} element - 目标元素
     * @returns {boolean}
     * @private
     */
    _isNavigatingElement(element) {
      if (!(element instanceof HTMLElement) || element.tagName !== 'A') {
        return false;
      }

      const href = element.getAttribute('href') || '';
      if (!href || href === '#' || href.startsWith('javascript:')) {
        return false;
      }

      return true;
    }

    /**
     * 是否正在执行
     * @returns {boolean}
     */
    busy() {
      return this.isExecuting;
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.ActionExecutor = ActionExecutor;

})(window);
