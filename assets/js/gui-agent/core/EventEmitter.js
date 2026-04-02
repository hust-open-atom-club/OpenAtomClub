/**
 * EventEmitter - 简单的事件总线
 * 用于模块间通信
 */
(function(window) {
  'use strict';

  class EventEmitter {
    constructor() {
      this.events = new Map();
    }

    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {object} context - 上下文对象
     */
    on(event, callback, context = null) {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event).push({ callback, context });
    }

    /**
     * 注册一次性事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {object} context - 上下文对象
     */
    once(event, callback, context = null) {
      const onceWrapper = (...args) => {
        callback.apply(context, args);
        this.off(event, onceWrapper);
      };
      this.on(event, onceWrapper, context);
    }

    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数（可选）
     */
    off(event, callback = null) {
      if (!this.events.has(event)) return;

      if (callback) {
        const listeners = this.events.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
        if (listeners.length === 0) {
          this.events.delete(event);
        }
      } else {
        this.events.delete(event);
      }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...any} args - 传递给监听器的参数
     */
    emit(event, ...args) {
      if (!this.events.has(event)) return;

      const listeners = this.events.get(event);
      listeners.forEach(({ callback, context }) => {
        try {
          callback.apply(context, args);
        } catch (error) {
          console.error(`[EventEmitter] Error in event '${event}':`, error);
        }
      });
    }

    /**
     * 清除所有事件监听器
     */
    clear() {
      this.events.clear();
    }

    /**
     * 获取事件的监听器数量
     * @param {string} event - 事件名称
     * @returns {number}
     */
    listenerCount(event) {
      return this.events.has(event) ? this.events.get(event).length : 0;
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.EventEmitter = EventEmitter;

})(window);
