/**
 * ControlPanel - 控制面板
 * 处理用户输入、拖拽、缩放等交互
 */
(function(window) {
  'use strict';

  class ControlPanel {
    constructor(config, storage, logger, eventEmitter) {
      this.config = config;
      this.storage = storage;
      this.logger = logger;
      this.events = eventEmitter;
      this.panel = null;
      this.toggleButton = null;
      this.isVisible = false;
      this.isMinimized = false;
      this.isDragging = false;
      this.dragState = {
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0
      };
    }

    /**
     * 初始化
     */
    init() {
      this.logger.info('[ControlPanel] Initializing...');

      // 创建HTML结构
      this._createElements();

      // 设置初始位置
      this._setInitialPosition();

      // 绑定事件
      this._bindEvents();

      // 加载历史记录
      this._loadHistory();

      this.logger.info('[ControlPanel] Initialized');
    }

    /**
     * 创建HTML元素
     * @private
     */
    _createElements() {
      // 创建触发按钮
      this.toggleButton = document.createElement('button');
      this.toggleButton.id = 'ga-toggle-btn';
      this.toggleButton.className = 'ga-toggle-btn';
      this.toggleButton.title = '启动 GUI 助手 (Ctrl+Shift+A)';
      this.toggleButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
      `;
      document.body.appendChild(this.toggleButton);

      // 创建控制面板
      this.panel = document.createElement('div');
      this.panel.id = 'ga-control-panel';
      this.panel.className = 'ga-panel ga-hidden';
      this.panel.innerHTML = `
        <div class="ga-panel-header">
          <div class="ga-panel-drag-handle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="4" cy="4" r="1.5"/>
              <circle cx="12" cy="4" r="1.5"/>
              <circle cx="4" cy="8" r="1.5"/>
              <circle cx="12" cy="8" r="1.5"/>
              <circle cx="4" cy="12" r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
            </svg>
          </div>
          <span class="ga-panel-title">GUI Agent - 网页助手</span>
          <div class="ga-panel-controls">
            <button class="ga-btn-icon ga-btn-minimize" title="最小化">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 8h8"/>
              </svg>
            </button>
            <button class="ga-btn-icon ga-btn-close" title="关闭 (Esc)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="ga-panel-body">
          <div class="ga-input-section">
            <label for="ga-command-input">输入指令:</label>
            <div class="ga-input-group">
              <input type="text"
                     id="ga-command-input"
                     class="ga-input ga-command-input"
                     placeholder='例如: "打开 wiki" 或 "先打开 wiki，再找联系方式"'
                     autocomplete="off">
              <button class="ga-btn ga-btn-send" title="执行 (Enter)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M15.854 7.354l-7-7a.5.5 0 00-.708.708L14.293 7H.5a.5.5 0 000 1h13.793l-6.147 6.146a.5.5 0 00.708.708l7-7a.5.5 0 000-.708z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="ga-history-section">
            <div class="ga-history-header">
              <span>历史记录</span>
              <button class="ga-btn-text ga-btn-clear-history" title="清除历史">清除</button>
            </div>
            <div class="ga-history-list"></div>
          </div>

          <div class="ga-status-section">
            <div class="ga-status-indicator">
              <span class="ga-status-dot"></span>
              <span class="ga-status-text">就绪</span>
            </div>
            <div class="ga-progress-bar">
              <div class="ga-progress-fill"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(this.panel);
    }

    /**
     * 设置初始位置
     * @private
     */
    _setInitialPosition() {
      const savedPosition = this.storage.getPanelPosition();

      if (savedPosition && this.config.ui.savePosition) {
        this.panel.style.left = savedPosition.x + 'px';
        this.panel.style.top = savedPosition.y + 'px';
        this.panel.style.right = 'auto';
        this.panel.style.bottom = 'auto';
      } else {
        // 使用默认位置
        const position = this.config.ui.defaultPosition;
        if (position.includes('right')) {
          this.panel.style.right = '20px';
        } else {
          this.panel.style.left = '20px';
        }
        if (position.includes('bottom')) {
          this.panel.style.bottom = '20px';
        } else {
          this.panel.style.top = '20px';
        }
      }
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
      // 触发按钮点击
      this.toggleButton.addEventListener('click', () => this.toggle());

      // 关闭按钮
      const closeBtn = this.panel.querySelector('.ga-btn-close');
      closeBtn.addEventListener('click', () => this.hide());

      // 最小化按钮
      const minimizeBtn = this.panel.querySelector('.ga-btn-minimize');
      minimizeBtn.addEventListener('click', () => this.toggleMinimize());

      // 拖拽功能
      this._enableDrag();

      // 发送按钮
      const sendBtn = this.panel.querySelector('.ga-btn-send');
      sendBtn.addEventListener('click', () => this._handleCommand());

      // 回车发送
      const commandInput = this.panel.querySelector('#ga-command-input');
      commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this._handleCommand();
        }
      });

      // 清除历史记录
      const clearHistoryBtn = this.panel.querySelector('.ga-btn-clear-history');
      clearHistoryBtn.addEventListener('click', () => {
        this.storage.clearCommandHistory();
        this._loadHistory();
        this.logger.info('[ControlPanel] History cleared');
      });

      // 快捷键
      document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+A 切换面板
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          e.preventDefault();
          this.toggle();
        }

        // Escape 关闭面板
        if (e.key === 'Escape' && this.isVisible) {
          this.hide();
        }
      });
    }

    /**
     * 启用拖拽功能
     * @private
     */
    _enableDrag() {
      const header = this.panel.querySelector('.ga-panel-header');
      const dragHandle = this.panel.querySelector('.ga-panel-drag-handle');

      const onMouseDown = (e) => {
        // 只有点击拖拽手柄或空白区域才能拖拽
        if (!e.target.closest('.ga-panel-drag-handle') &&
            !e.target.closest('.ga-panel-title')) {
          return;
        }

        this.isDragging = true;
        this.dragState.startX = e.clientX;
        this.dragState.startY = e.clientY;

        const rect = this.panel.getBoundingClientRect();
        this.dragState.initialX = rect.left;
        this.dragState.initialY = rect.top;

        // 添加拖拽类（可以改变外观）
        this.panel.classList.add('ga-panel--dragging');
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'move';

        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;

        let newX = this.dragState.initialX + deltaX;
        let newY = this.dragState.initialY + deltaY;

        // 边界限制
        const maxX = window.innerWidth - this.panel.offsetWidth;
        const maxY = window.innerHeight - this.panel.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // 设置位置
        this.panel.style.left = newX + 'px';
        this.panel.style.top = newY + 'px';
        this.panel.style.right = 'auto';
        this.panel.style.bottom = 'auto';
      };

      const onMouseUp = () => {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.panel.classList.remove('ga-panel--dragging');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        // 保存位置
        if (this.config.ui.savePosition) {
          const rect = this.panel.getBoundingClientRect();
          this.storage.setPanelPosition({
            x: rect.left,
            y: rect.top
          });
          this.logger.debug('[ControlPanel] Position saved');
        }
      };

      header.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    /**
     * 处理用户指令
     * @private
     */
    _handleCommand() {
      const input = this.panel.querySelector('#ga-command-input');
      const command = input.value.trim();

      if (!command) {
        this._showStatus('请输入指令', 'warning');
        return;
      }

      this.logger.info('[ControlPanel] Executing command:', command);

      // 添加到历史记录
      this.storage.addCommandHistory(command, this.config.ui.maxHistory);
      this._loadHistory();

      // 触发命令事件
      this.events.emit('command:execute', command);

      // 清空输入
      input.value = '';
    }

    /**
     * 加载历史记录
     * @private
     */
    _loadHistory() {
      const historyList = this.panel.querySelector('.ga-history-list');
      const history = this.storage.getCommandHistory();

      if (history.length === 0) {
        historyList.innerHTML = '<div class="ga-history-empty">暂无历史记录</div>';
        return;
      }

      historyList.innerHTML = history.map(cmd => `
        <div class="ga-history-item" data-command="${this._escapeHtml(cmd)}">
          <span class="ga-history-text">${this._escapeHtml(cmd)}</span>
          <button class="ga-btn-icon ga-btn-replay" title="重新执行">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.534 7h3.932a.25.25 0 01.192.41l-1.966 2.36a.25.25 0 01-.384 0l-1.966-2.36a.25.25 0 01.192-.41zm-11 2h3.932a.25.25 0 00.192-.41L2.692 6.23a.25.25 0 00-.384 0L.342 8.59A.25.25 0 00.534 9z"/>
              <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 11-.771-.636A6.002 6.002 0 0113.917 7H12.9A5.002 5.002 0 008 3zM3.1 9a5.002 5.002 0 008.757 2.182.5.5 0 11.771.636A6.002 6.002 0 012.083 9H3.1z"/>
            </svg>
          </button>
        </div>
      `).join('');

      // 绑定重放按钮事件
      historyList.querySelectorAll('.ga-btn-replay').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const item = e.target.closest('.ga-history-item');
          const command = item.dataset.command;
          const input = this.panel.querySelector('#ga-command-input');
          input.value = command;
          input.focus();
        });
      });

      // 点击历史项填充输入框
      historyList.querySelectorAll('.ga-history-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.closest('.ga-btn-replay')) return;
          const command = item.dataset.command;
          const input = this.panel.querySelector('#ga-command-input');
          input.value = command;
          input.focus();
        });
      });
    }

    /**
     * HTML 转义
     * @private
     */
    _escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * 显示状态
     * @param {string} message - 消息
     * @param {string} type - 类型 ('info'|'success'|'warning'|'error')
     * @param {number} progress - 进度 (0-100)
     */
    _showStatus(message, type = 'info', progress = null) {
      const statusText = this.panel.querySelector('.ga-status-text');
      const statusDot = this.panel.querySelector('.ga-status-dot');
      const progressBar = this.panel.querySelector('.ga-progress-bar');
      const progressFill = this.panel.querySelector('.ga-progress-fill');

      statusText.textContent = message;
      statusDot.className = `ga-status-dot ga-status-dot--${type}`;

      if (progress !== null) {
        progressBar.classList.add('ga-progress-bar--visible');
        progressFill.style.width = progress + '%';
      } else {
        progressBar.classList.remove('ga-progress-bar--visible');
      }
    }

    /**
     * 显示面板
     */
    show() {
      if (this.isVisible) return;

      this.panel.classList.remove('ga-hidden');
      this.isVisible = true;

      // 聚焦命令输入框
      setTimeout(() => {
        const input = this.panel.querySelector('#ga-command-input');
        input.focus();
      }, 100);

      this.events.emit('panel:shown');
      this.logger.debug('[ControlPanel] Panel shown');
    }

    /**
     * 隐藏面板
     */
    hide() {
      if (!this.isVisible) return;

      this.panel.classList.add('ga-hidden');
      this.isVisible = false;

      this.events.emit('panel:hidden');
      this.logger.debug('[ControlPanel] Panel hidden');
    }

    /**
     * 切换面板显示/隐藏
     */
    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    /**
     * 切换最小化状态
     */
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;

      if (this.isMinimized) {
        this.panel.classList.add('ga-panel--minimized');
      } else {
        this.panel.classList.remove('ga-panel--minimized');
      }

      this.logger.debug('[ControlPanel] Minimize toggled:', this.isMinimized);
    }

    /**
     * 设置状态（供外部调用）
     * @param {string} message - 消息
     * @param {string} type - 类型
     * @param {number} progress - 进度
     */
    setStatus(message, type = 'info', progress = null) {
      this._showStatus(message, type, progress);
    }

    /**
     * 销毁
     */
    destroy() {
      if (this.panel && this.panel.parentNode) {
        this.panel.parentNode.removeChild(this.panel);
      }
      if (this.toggleButton && this.toggleButton.parentNode) {
        this.toggleButton.parentNode.removeChild(this.toggleButton);
      }
      this.panel = null;
      this.toggleButton = null;
      this.logger.info('[ControlPanel] Destroyed');
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.ControlPanel = ControlPanel;

})(window);
