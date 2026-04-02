/**
 * CommandParser - 指令解析器
 * 解析自然语言指令并匹配元素
 */
(function(window) {
  'use strict';

  class CommandParser {
    constructor(config, logger, domParser) {
      this.config = config;
      this.logger = logger;
      this.domParser = domParser;
      this.rules = this.config.rules || [];
    }

    /**
     * 解析指令
     * @param {string} command - 用户指令
     * @returns {Promise<object>} - { action, target, confidence, method }
     */
    async parse(command) {
      this.logger.info('[CommandParser] Parsing command:', command);

      // 1. 先尝试规则匹配（快速）
      const ruleResult = this._matchRules(command);
      if (ruleResult) {
        this.logger.info('[CommandParser] Matched by rule:', ruleResult);
        return ruleResult;
      }

      // 2. 模糊搜索（降级方案）
      const fuzzyResult = this._fuzzySearch(command);
      if (fuzzyResult) {
        this.logger.info('[CommandParser] Matched by fuzzy search:', fuzzyResult);
        return fuzzyResult;
      }

      throw new Error('无法理解指令，请尝试更明确的描述');
    }

    /**
     * 将复合指令拆分成步骤
     * @param {string} command - 用户原始指令
     * @returns {Array<string>}
     */
    splitIntoSteps(command) {
      const normalized = String(command || '').trim();
      if (!normalized) {
        return [];
      }

      const rawSteps = normalized.split(/[，,；;。]\s*|(?:然后|接着|随后|接下来|之后|下一步|第二步|最后)/);
      const steps = rawSteps
        .map(step => step.replace(/^(先|首先|然后|接着|随后|再|再去|下一步|第二步|最后)\s*/i, '').trim())
        .filter(Boolean);

      return steps.length > 0 ? steps : [normalized];
    }

    /**
     * 规则匹配
     * @private
     */
    _matchRules(command) {
      for (const rule of this.rules) {
        if (rule.pattern.test(command)) {
          this.logger.debug('[CommandParser] Rule matched:', rule);

          // 搜索匹配的元素
          const keywords = rule.keywords || [command];
          for (const keyword of keywords) {
            const results = this.domParser.search(keyword, { limit: 1 });
            if (results.length > 0) {
              return {
                action: rule.action,
                target: results[0],
                confidence: 0.9,
                method: 'rule',
                rule: rule
              };
            }
          }
        }
      }
      return null;
    }

    /**
     * 模糊搜索
     * @private
     */
    _fuzzySearch(command) {
      // 提取关键词
      const keywords = command.split(/[,，。.、\s]+/).filter(w => w.length > 1);

      for (const keyword of keywords) {
        const results = this.domParser.search(keyword, { limit: 1 });
        if (results.length > 0 && results[0].matchScore > 3) {
          return {
            action: 'click',
            target: results[0],
            confidence: 0.6,
            method: 'fuzzy'
          };
        }
      }

      return null;
    }
  }

  // 导出到全局
  window.GUIAgent = window.GUIAgent || {};
  window.GUIAgent.CommandParser = CommandParser;

})(window);
