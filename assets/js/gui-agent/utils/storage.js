/**
 * Storage - 本地存储工具
 * 管理 localStorage 中的配置和数据
 */
(function(window) {
  'use strict';

  const STORAGE_KEY = 'gui_agent';
  class Storage {
    constructor() {
      this.cache = this.loadAll();
    }

    /**
     * 加载所有数据
     * @returns {object}
     */
    loadAll() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      } catch (error) {
        console.error('[Storage] Error loading data:', error);
        return {};
      }
    }

    /**
     * 保存所有数据
     */
    _save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
      } catch (error) {
        console.error('[Storage] Error saving data:', error);
      }
    }

    /**
     * 获取值
     * @param {string} key - 键名
     * @param {any} defaultValue - 默认值
     * @returns {any}
     */
    get(key, defaultValue = null) {
      return this.cache.hasOwnProperty(key) ? this.cache[key] : defaultValue;
    }

    /**
     * 设置值
     * @param {string} key - 键名
     * @param {any} value - 值
     */
    set(key, value) {
      this.cache[key] = value;
      this._save();
    }

    /**
     * 删除值
     * @param {string} key - 键名
     */
    remove(key) {
      delete this.cache[key];
      this._save();
    }

    /**
     * 清除所有数据
     */
    clear() {
      this.cache = {};
      localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * 保存控制面板位置
     * @param {object} position - {x, y}
     */
    setPanelPosition(position) {
      this.set('panel_position', position);
    }

    /**
     * 获取控制面板位置
     * @returns {object|null}
     */
    getPanelPosition() {
      return this.get('panel_position', null);
    }

    /**
     * 保存主题设置
     * @param {string} theme - 'light' | 'dark' | 'auto'
     */
    setTheme(theme) {
      this.set('theme', theme);
    }

    /**
     * 获取主题设置
     * @returns {string}
     */
    getTheme() {
      return this.get('theme', 'auto');
    }

    /**
     * 添加指令历史
     * @param {string} command - 指令
     * @param {number} maxHistory - 最大历史记录数
     */
    addCommandHistory(command, maxHistory = 20) {
      const history = this.get('command_history', []);
      history.unshift(command);
      if (history.length > maxHistory) {
        history.splice(maxHistory);
      }
      this.set('command_history', history);
    }

    /**
     * 获取指令历史
     * @returns {Array}
     */
    getCommandHistory() {
      return this.get('command_history', []);
    }

    /**
     * 保存待继续执行的步骤序列
     * @param {object|null} sequence - 序列信息
     */
    setPendingSequence(sequence) {
      if (!sequence) {
        this.remove('pending_sequence');
        return;
      }
      this.set('pending_sequence', sequence);
    }

    /**
     * 获取待继续执行的步骤序列
     * @returns {object|null}
     */
    getPendingSequence() {
      return this.get('pending_sequence', null);
    }

    /**
     * 清除待继续执行的步骤序列
     */
    clearPendingSequence() {
      this.remove('pending_sequence');
    }

    /**
     * 清除指令历史
     */
    clearCommandHistory() {
      this.set('command_history', []);
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.Storage = Storage;

})(window);
