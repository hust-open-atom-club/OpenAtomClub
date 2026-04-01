/**
 * ElementMapper - 元素映射和索引
 * 提供高效的元素查询功能
 */
(function(window) {
  'use strict';

  class ElementMapper {
    constructor() {
      this.elements = new Map(); // id -> element info
      this.index = {
        byText: new Map(),      // text -> [id, id, ...]
        byType: new Map(),      // type -> [id, id, ...]
        byKeyword: new Map()    // keyword -> [id, id, ...]
      };
      this.nextId = 1;
    }

    /**
     * 生成唯一ID
     * @returns {string}
     */
    generateId() {
      return `elem_${this.nextId++}`;
    }

    /**
     * 添加元素
     * @param {object} elementInfo - 元素信息
     * @returns {string} - 元素ID
     */
    add(elementInfo) {
      const id = this.generateId();
      elementInfo.id = id;
      this.elements.set(id, elementInfo);

      // 建立索引
      this._indexByText(id, elementInfo.text);
      this._indexByType(id, elementInfo.type);
      elementInfo.keywords.forEach(keyword => {
        this._indexByKeyword(id, keyword);
      });

      return id;
    }

    /**
     * 更新元素
     * @param {string} id - 元素ID
     * @param {object} updates - 更新的字段
     */
    update(id, updates) {
      if (!this.elements.has(id)) return;

      const element = this.elements.get(id);

      // 移除旧索引
      this._removeIndexes(id, element);

      // 更新元素
      Object.assign(element, updates);

      // 重建索引
      if (element.text) this._indexByText(id, element.text);
      if (element.type) this._indexByType(id, element.type);
      if (element.keywords) {
        element.keywords.forEach(keyword => this._indexByKeyword(id, keyword));
      }
    }

    /**
     * 删除元素
     * @param {string} id - 元素ID
     */
    remove(id) {
      if (!this.elements.has(id)) return;

      const element = this.elements.get(id);
      this._removeIndexes(id, element);
      this.elements.delete(id);
    }

    /**
     * 清空所有元素
     */
    clear() {
      this.elements.clear();
      this.index.byText.clear();
      this.index.byType.clear();
      this.index.byKeyword.clear();
      this.nextId = 1;
    }

    /**
     * 按文本建立索引
     * @private
     */
    _indexByText(id, text) {
      if (!text) return;
      const normalizedText = this._normalizeText(text);
      if (!this.index.byText.has(normalizedText)) {
        this.index.byText.set(normalizedText, []);
      }
      this.index.byText.get(normalizedText).push(id);
    }

    /**
     * 按类型建立索引
     * @private
     */
    _indexByType(id, type) {
      if (!type) return;
      if (!this.index.byType.has(type)) {
        this.index.byType.set(type, []);
      }
      this.index.byType.get(type).push(id);
    }

    /**
     * 按关键词建立索引
     * @private
     */
    _indexByKeyword(id, keyword) {
      if (!keyword) return;
      const normalizedKeyword = this._normalizeText(keyword);
      if (!this.index.byKeyword.has(normalizedKeyword)) {
        this.index.byKeyword.set(normalizedKeyword, []);
      }
      this.index.byKeyword.get(normalizedKeyword).push(id);
    }

    /**
     * 移除元素的所有索引
     * @private
     */
    _removeIndexes(id, element) {
      if (element.text) {
        const normalizedText = this._normalizeText(element.text);
        this._removeFromIndex(this.index.byText, normalizedText, id);
      }
      if (element.type) {
        this._removeFromIndex(this.index.byType, element.type, id);
      }
      if (element.keywords) {
        element.keywords.forEach(keyword => {
          const normalized = this._normalizeText(keyword);
          this._removeFromIndex(this.index.byKeyword, normalized, id);
        });
      }
    }

    /**
     * 从索引中移除ID
     * @private
     */
    _removeFromIndex(indexMap, key, id) {
      if (!indexMap.has(key)) return;
      const ids = indexMap.get(key);
      const index = ids.indexOf(id);
      if (index !== -1) {
        ids.splice(index, 1);
      }
      if (ids.length === 0) {
        indexMap.delete(key);
      }
    }

    /**
     * 规范化文本（小写+去空格）
     * @private
     */
    _normalizeText(text) {
      return text.toLowerCase().trim();
    }

    /**
     * 搜索元素
     * @param {string} query - 查询字符串
     * @param {object} options - 选项
     * @returns {Array} - 匹配的元素列表，按评分排序
     */
    search(query, options = {}) {
      const {
        type = null,         // 限制类型
        limit = 10,          // 返回数量
        threshold = 0.1      // 最低评分阈值
      } = options;

      const normalizedQuery = this._normalizeText(query);
      const candidates = new Map(); // id -> score

      // 1. 精确文本匹配（高分）
      if (this.index.byText.has(normalizedQuery)) {
        this.index.byText.get(normalizedQuery).forEach(id => {
          candidates.set(id, (candidates.get(id) || 0) + 10);
        });
      }

      // 2. 关键词匹配（中分）
      this.index.byKeyword.forEach((ids, keyword) => {
        if (keyword.includes(normalizedQuery) || normalizedQuery.includes(keyword)) {
          ids.forEach(id => {
            candidates.set(id, (candidates.get(id) || 0) + 5);
          });
        }
      });

      // 3. 模糊文本匹配（低分）
      this.index.byText.forEach((ids, text) => {
        if (text.includes(normalizedQuery)) {
          ids.forEach(id => {
            if (!candidates.has(id)) {
              candidates.set(id, 3);
            }
          });
        }
      });

      // 4. 过滤类型
      let results = [];
      candidates.forEach((score, id) => {
        const element = this.elements.get(id);
        if (!element) return;
        if (type && element.type !== type) return;
        if (score >= threshold) {
          results.push({ element, score });
        }
      });

      // 5. 排序和限制数量
      results.sort((a, b) => b.score - a.score);
      if (limit) {
        results = results.slice(0, limit);
      }

      return results.map(r => ({
        ...r.element,
        matchScore: r.score
      }));
    }

    /**
     * 按类型获取所有元素
     * @param {string} type - 元素类型
     * @returns {Array}
     */
    getByType(type) {
      const ids = this.index.byType.get(type) || [];
      return ids.map(id => this.elements.get(id)).filter(Boolean);
    }

    /**
     * 按ID获取元素
     * @param {string} id - 元素ID
     * @returns {object|null}
     */
    getById(id) {
      return this.elements.get(id) || null;
    }

    /**
     * 获取所有元素
     * @returns {Array}
     */
    getAll() {
      return Array.from(this.elements.values());
    }

    /**
     * 获取元素数量
     * @returns {number}
     */
    size() {
      return this.elements.size;
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.ElementMapper = ElementMapper;

})(window);
