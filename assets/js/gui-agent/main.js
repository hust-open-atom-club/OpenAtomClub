/**
 * GUI-Agent Main Entry
 * 主入口，初始化和协调所有模块
 */
(function(window, $) {
  'use strict';

  class GUIAgent {
    constructor() {
      this.version = '1.0.0';
      this.config = null;
      this.logger = null;
      this.storage = null;
      this.events = null;
      this.domParser = null;
      this.bigCursor = null;
      this.controlPanel = null;
      this.commandParser = null;
      this.actionExecutor = null;
      this.initialized = false;
    }

    /**
     * 初始化
     */
    async init() {
      if (this.initialized) {
        this.logger?.warn('[GUIAgent] Already initialized');
        return;
      }

      console.log(`%cGUI-Agent v${this.version}`, 'color: #7c3aed; font-size: 16px; font-weight: bold;');
      console.log('%c网页导航助手', 'color: #888;');

      try {
        // 1. 加载配置
        this.config = window.GUIAgent.Config;
        if (!this.config) {
          throw new Error('Configuration not loaded');
        }

        // 2. 初始化核心模块
        this.logger = new window.GUIAgent.Logger(this.config.debug);
        this.logger.info('[GUIAgent] Initializing...');

        this.storage = new window.GUIAgent.Storage();
        this.events = new window.GUIAgent.EventEmitter();

        // 3. 初始化 DOM 解析器
        this.domParser = new window.GUIAgent.DOMParser(
          this.config,
          this.logger,
          this.events
        );

        // 4. 初始化大鼠标
        this.bigCursor = new window.GUIAgent.BigCursor(
          this.config,
          this.logger,
          this.events
        );
        this.bigCursor.init();

        // 5. 初始化控制面板
        this.controlPanel = new window.GUIAgent.ControlPanel(
          this.config,
          this.storage,
          this.logger,
          this.events
        );
        this.controlPanel.init();

        // 6. 初始化命令解析器
        this.commandParser = new window.GUIAgent.CommandParser(
          this.config,
          this.logger,
          this.domParser
        );

        // 7. 初始化动作执行器
        this.actionExecutor = new window.GUIAgent.ActionExecutor(
          this.logger,
          this.events,
          this.bigCursor
        );

        // 8. 绑定事件
        this._bindEvents();

        // 9. 等待 DOM 加载完成后解析页面
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            this.domParser.init();
          });
        } else {
          await this.domParser.init();
        }

        this.initialized = true;
        this.logger.info('[GUIAgent] Initialized successfully');

        // 触发初始化完成事件
        this.events.emit('gui-agent:ready', this);

        // 如果上一步触发了跳页，则在新页面继续剩余步骤
        await this._resumePendingSequence();

      } catch (error) {
        console.error('[GUIAgent] Initialization failed:', error);
        throw error;
      }
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
      // 用户执行指令
      this.events.on('command:execute', async (command) => {
        await this._handleCommand(command);
      });

      // 动作成功
      this.events.on('action:success', (result) => {
        this.controlPanel.setStatus(result.message || '执行成功', 'success');
        this.logger.info('[GUIAgent] Action completed:', result);
      });

      // 动作失败
      this.events.on('action:error', (error) => {
        this.controlPanel.setStatus(error.message || '执行失败', 'error');
        this.logger.error('[GUIAgent] Action failed:', error);
      });
    }

    /**
     * 处理用户指令
     * @private
     */
    async _handleCommand(command) {
      this.logger.info('[GUIAgent] Handling command:', command);

      try {
        this.storage.clearPendingSequence();
        const steps = this.commandParser.splitIntoSteps(command);
        if (steps.length === 0) {
          throw new Error('请输入有效指令');
        }

        await this._runCommandSequence(steps, { originalCommand: command, resumed: false });

      } catch (error) {
        this.storage.clearPendingSequence();
        this.logger.error('[GUIAgent] Command execution failed:', error);
        this.controlPanel.setStatus(error.message || '执行失败', 'error');

        // 恢复就绪状态
        setTimeout(() => {
          this.controlPanel.setStatus('就绪', 'info');
        }, 3000);
      }
    }

    /**
     * 顺序执行指令步骤
     * @param {Array<string>} steps - 步骤列表
     * @param {object} options - 额外选项
     * @private
     */
    async _runCommandSequence(steps, options = {}) {
      const originalCommand = options.originalCommand || steps.join(' -> ');
      const resumed = !!options.resumed;

      for (let index = 0; index < steps.length; index++) {
        const step = steps[index];
        const remainingSteps = steps.slice(index + 1);
        const stepPrefix = steps.length > 1 ? `步骤 ${index + 1}/${steps.length}` : '当前步骤';

        this.controlPanel.setStatus(`${stepPrefix}：正在解析 "${step}"`, 'info', 20);

        const parsedCommand = await this.commandParser.parse(step);
        this.logger.info('[GUIAgent] Parsed command:', parsedCommand);

        this.controlPanel.setStatus(
          `${stepPrefix}：找到目标 ${parsedCommand.target.text || '元素'}`,
          'info',
          50
        );

        await new Promise(resolve => setTimeout(resolve, 400));

        const pageMayChange = this.actionExecutor.willChangePage(parsedCommand);
        if (remainingSteps.length > 0 && pageMayChange) {
          this.storage.setPendingSequence({
            steps: remainingSteps,
            originalCommand,
            savedAt: Date.now()
          });
        } else if (index === steps.length - 1) {
          this.storage.clearPendingSequence();
        }

        this.controlPanel.setStatus(`${stepPrefix}：正在执行...`, 'info', 75);
        const result = await this.actionExecutor.execute(parsedCommand);

        if (remainingSteps.length > 0 && !pageMayChange) {
          this.controlPanel.setStatus(
            `${stepPrefix}完成，继续执行下一步...`,
            'success',
            100
          );
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        this.controlPanel.setStatus(result.message || '执行成功', 'success', 100);

        if (pageMayChange) {
          return;
        }
      }

      if (resumed) {
        this.controlPanel.setStatus('剩余步骤已自动执行完成', 'success', 100);
      }

      setTimeout(() => {
        this.controlPanel.setStatus('就绪', 'info');
      }, 2000);
    }

    /**
     * 在新页面恢复未完成的步骤
     * @private
     */
    async _resumePendingSequence() {
      const pending = this.storage.getPendingSequence();
      if (!pending || !Array.isArray(pending.steps) || pending.steps.length === 0) {
        return;
      }

      // 仅恢复短时间内由上一页保存的步骤，避免旧任务误触发
      if (!pending.savedAt || Date.now() - pending.savedAt > 2 * 60 * 1000) {
        this.storage.clearPendingSequence();
        return;
      }

      this.storage.clearPendingSequence();
      this.logger.info('[GUIAgent] Resuming pending steps:', pending.steps);
      this.controlPanel.setStatus(`检测到未完成任务，继续执行 ${pending.steps.length} 步...`, 'info', 10);

      await new Promise(resolve => setTimeout(resolve, 600));
      await this._runCommandSequence(pending.steps, {
        originalCommand: pending.originalCommand || pending.steps.join(' -> '),
        resumed: true
      });
    }

    /**
     * 显示控制面板
     */
    show() {
      this.controlPanel?.show();
    }

    /**
     * 隐藏控制面板
     */
    hide() {
      this.controlPanel?.hide();
    }

    /**
     * 切换控制面板
     */
    toggle() {
      this.controlPanel?.toggle();
    }

    /**
     * 销毁
     */
    destroy() {
      this.logger?.info('[GUIAgent] Destroying...');

      this.domParser?.destroy();
      this.bigCursor?.destroy();
      this.controlPanel?.destroy();
      this.events?.clear();

      this.initialized = false;
      this.logger?.info('[GUIAgent] Destroyed');
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.instance = null;

  /**
   * 自动初始化
   */
  $(document).ready(function() {
    // 检查是否启用
    if (window.GUIAgentConfig && window.GUIAgentConfig.enabled === false) {
      console.log('[GUIAgent] Disabled by configuration');
      return;
    }

    // 创建实例并初始化
    const instance = new GUIAgent();
    window.GUIAgent.instance = instance;

    instance.init().catch(error => {
      console.error('[GUIAgent] Failed to initialize:', error);
    });
  });

  // 暴露便捷方法
  window.GUIAgent.show = () => window.GUIAgent.instance?.show();
  window.GUIAgent.hide = () => window.GUIAgent.instance?.hide();
  window.GUIAgent.toggle = () => window.GUIAgent.instance?.toggle();

})(window, jQuery);
