/**
 * Logger - 日志工具
 * 提供分级日志和调试功能
 */
(function(window) {
  'use strict';

  const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  const LOG_COLORS = {
    DEBUG: '#888',
    INFO: '#2196F3',
    WARN: '#FF9800',
    ERROR: '#F44336'
  };

  class Logger {
    constructor(config) {
      this.config = config || { enabled: true, logLevel: 'info', showTimestamp: true };
      this.currentLevel = LOG_LEVELS[this.config.logLevel.toUpperCase()] || LOG_LEVELS.INFO;
      this.logs = [];
      this.maxLogs = 100;
    }

    /**
     * 格式化时间戳
     * @returns {string}
     */
    _getTimestamp() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    }

    /**
     * 记录日志
     * @param {string} level - 日志级别
     * @param {Array} args - 日志参数
     */
    _log(level, args) {
      if (!this.config.enabled) return;

      const levelValue = LOG_LEVELS[level];
      if (levelValue < this.currentLevel) return;

      const timestamp = this.config.showTimestamp ? this._getTimestamp() : '';
      const prefix = timestamp ? `[${timestamp}] [${level}]` : `[${level}]`;
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');

      // 保存到内存
      this.logs.push({
        level,
        timestamp: new Date(),
        message
      });
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // 输出到控制台
      const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`;
      const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
      console[consoleMethod](`%c${prefix}`, style, ...args);
    }

    /**
     * DEBUG 级别日志
     */
    debug(...args) {
      this._log('DEBUG', args);
    }

    /**
     * INFO 级别日志
     */
    info(...args) {
      this._log('INFO', args);
    }

    /**
     * WARN 级别日志
     */
    warn(...args) {
      this._log('WARN', args);
    }

    /**
     * ERROR 级别日志
     */
    error(...args) {
      this._log('ERROR', args);
    }

    /**
     * 获取所有日志
     * @returns {Array}
     */
    getLogs() {
      return this.logs;
    }

    /**
     * 清除所有日志
     */
    clear() {
      this.logs = [];
    }

    /**
     * 导出日志为文本
     * @returns {string}
     */
    export() {
      return this.logs.map(log => {
        const time = log.timestamp.toLocaleTimeString();
        return `[${time}] [${log.level}] ${log.message}`;
      }).join('\n');
    }

    /**
     * 下载日志文件
     */
    download() {
      const content = this.export();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gui-agent-log-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    /**
     * 性能计时开始
     * @param {string} label - 标签
     */
    timeStart(label) {
      console.time(`[GUI-Agent] ${label}`);
    }

    /**
     * 性能计时结束
     * @param {string} label - 标签
     */
    timeEnd(label) {
      console.timeEnd(`[GUI-Agent] ${label}`);
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.Logger = Logger;

})(window);
