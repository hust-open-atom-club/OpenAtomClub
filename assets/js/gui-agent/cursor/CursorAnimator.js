/**
 * CursorAnimator - 动画引擎
 * 处理大鼠标的动画效果
 */
(function(window) {
  'use strict';

  class CursorAnimator {
    constructor(element, config) {
      this.element = element;
      this.config = config;
      this.currentAnimation = null;
    }

    /**
     * 平滑移动
     * @param {number} targetX - 目标X坐标（页面坐标）
     * @param {number} targetY - 目标Y坐标（页面坐标）
     * @param {number} duration - 动画时长(ms)
     * @returns {Promise}
     */
    async moveTo(targetX, targetY, duration = this.config.animationDuration) {
      // 取消当前动画
      if (this.currentAnimation) {
        this.currentAnimation.cancel();
      }

      // 获取当前位置
      const currentTransform = window.getComputedStyle(this.element).transform;
      let currentX = 0, currentY = 0;

      if (currentTransform && currentTransform !== 'none') {
        const matrix = new DOMMatrix(currentTransform);
        currentX = matrix.m41;
        currentY = matrix.m42;
      }

      // 创建动画
      this.currentAnimation = this.element.animate([
        { transform: `translate(${currentX}px, ${currentY}px)` },
        { transform: `translate(${targetX}px, ${targetY}px)` }
      ], {
        duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design 标准缓动
        fill: 'forwards'
      });

      try {
        await this.currentAnimation.finished;
      } catch (e) {
        // 动画被取消
      } finally {
        this.currentAnimation = null;
      }
    }

    /**
     * 点击涟漪动画
     * @returns {Promise}
     */
    async ripple() {
      const rippleElement = this.element.querySelector('.ga-cursor-ripple');
      if (!rippleElement) return;

      // 重置样式
      rippleElement.style.opacity = '0';
      rippleElement.style.transform = 'scale(1)';

      // 强制重绘
      void rippleElement.offsetWidth;

      // 添加动画类
      this.element.classList.add('ga-cursor--clicking');

      // 创建动画
      const animation = rippleElement.animate([
        {
          opacity: 0.8,
          transform: 'scale(1)'
        },
        {
          opacity: 0,
          transform: 'scale(2.5)'
        }
      ], {
        duration: this.config.clickRippleDuration,
        easing: 'ease-out',
        fill: 'forwards'
      });

      try {
        await animation.finished;
      } finally {
        this.element.classList.remove('ga-cursor--clicking');
      }
    }

    /**
     * 悬停动画（外圈放大+呼吸）
     */
    startHover() {
      this.element.classList.add('ga-cursor--hover');
    }

    /**
     * 停止悬停动画
     */
    stopHover() {
      this.element.classList.remove('ga-cursor--hover');
    }

    /**
     * 显示成功反馈
     * @returns {Promise}
     */
    async showSuccess() {
      const successElement = document.createElement('div');
      successElement.className = 'ga-cursor-success';
      successElement.innerHTML = '✓';
      this.element.appendChild(successElement);

      const animation = successElement.animate([
        {
          opacity: 0,
          transform: 'scale(0.5) translateY(0)'
        },
        {
          opacity: 1,
          transform: 'scale(1.2) translateY(-10px)',
          offset: 0.5
        },
        {
          opacity: 0,
          transform: 'scale(1.5) translateY(-30px)'
        }
      ], {
        duration: 800,
        easing: 'ease-out',
        fill: 'forwards'
      });

      try {
        await animation.finished;
      } finally {
        successElement.remove();
      }
    }

    /**
     * 显示错误反馈
     * @returns {Promise}
     */
    async showError() {
      const errorElement = document.createElement('div');
      errorElement.className = 'ga-cursor-error';
      errorElement.innerHTML = '✕';
      this.element.appendChild(errorElement);

      // 震动效果
      const animation = this.element.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)', offset: 0.25 },
        { transform: 'translateX(5px)', offset: 0.5 },
        { transform: 'translateX(-5px)', offset: 0.75 },
        { transform: 'translateX(0)' }
      ], {
        duration: 400,
        easing: 'ease-in-out'
      });

      await animation.finished;

      // 淡出错误图标
      const fadeOut = errorElement.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: 300,
        delay: 200,
        fill: 'forwards'
      });

      try {
        await fadeOut.finished;
      } finally {
        errorElement.remove();
      }
    }

    /**
     * 淡入
     * @returns {Promise}
     */
    async fadeIn() {
      this.element.style.display = 'block';

      const animation = this.element.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], {
        duration: 300,
        easing: 'ease-in',
        fill: 'forwards'
      });

      await animation.finished;
    }

    /**
     * 淡出
     * @returns {Promise}
     */
    async fadeOut() {
      const animation = this.element.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
      });

      await animation.finished;
      this.element.style.display = 'none';
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.CursorAnimator = CursorAnimator;

})(window);
