/**
 * 
 * 
 */
class ErrorHandler {
  constructor() {
    this.config = {
      enableLogging: true,      // 
      enableReporting: false,   // 
      reportingEndpoint: '/api/error-report',  // 
      maxHistoryLength: 10,     // 
      errorCategories: {         // 
        NETWORK: 'network',
        VALIDATION: 'validation',
        AUTHENTICATION: 'authentication',
        AUTHORIZATION: 'authorization',
        SERVER: 'server',
        CLIENT: 'client',
        UNKNOWN: 'unknown'
      }
    };
    
    this.errorHistory = [];     // 
    this.errorCallbacks = {};   // 
    this.initialized = false;   // 
    this.errorStats = {         // 
      total: 0,
      byCategory: {},
      bySource: {}
    };
  }

  /**
   * 
   * @param {Function} callback - 
   * @param {Object} config - 
   */
  init(callback = null, config = {}) {
    // 
    this.config = { ...this.config, ...config };
    
    // 
    Object.values(this.config.errorCategories).forEach(category => {
      this.errorStats.byCategory[category] = 0;
      this.errorCallbacks[category] = [];
    });
    
    // 
    if (callback && typeof callback === 'function') {
      this.registerCallback(callback);
    }
    
    this.initialized = true;
    
    if (this.config.enableLogging) {
      console.log('ErrorHandler 已初始化', this.config);
    }
    
    return this;
  }

  /**
   * 
   * @param {Function} callback - 
   * @param {string|null} category - 
   * @returns {Function} 
   */
  registerCallback(callback, category = null) {
    if (typeof callback !== 'function') {
      throw new Error('回調必須是一個函數');
    }
    
    if (category && !Object.values(this.config.errorCategories).includes(category)) {
      throw new Error(`無效的錯誤分類: ${category}`);
    }
    
    if (category) {
      // 
      this.errorCallbacks[category].push(callback);
      return () => this.unregisterCallback(callback, category);
    } else {
      // 
      Object.values(this.config.errorCategories).forEach(cat => {
        this.errorCallbacks[cat].push(callback);
      });
      return () => this.unregisterCallback(callback);
    }
  }

  /**
   * 
   * @param {Function} callback - 
   * @param {string|null} category - 
   */
  unregisterCallback(callback, category = null) {
    if (category) {
      // 
      this.errorCallbacks[category] = this.errorCallbacks[category].filter(cb => cb !== callback);
    } else {
      // 
      Object.values(this.config.errorCategories).forEach(cat => {
        this.errorCallbacks[cat] = this.errorCallbacks[cat].filter(cb => cb !== callback);
      });
    }
  }

  /**
   * 
   * @param {Error} error - 
   * @param {string} source - 
   * @param {Object} context - 
   * @param {string} category - 
   */
  handleError(error, source = 'unknown', context = {}, category = null) {
    if (!this.initialized) {
      console.warn('ErrorHandler 尚未初始化');
    }

    // 
    const errorCategory = category || this.determineErrorCategory(error);

    // 
    const errorInfo = {
      message: error.message || String(error),
      stack: error.stack,
      source,
      context,
      category: errorCategory,
      timestamp: new Date(),
      id: this.generateErrorId()
    };

    // 
    this.addToHistory(errorInfo);
    
    // 
    this.updateErrorStats(errorInfo);
    
    // 
    if (this.config.enableLogging) {
      console.error(`[錯誤:${errorCategory}] ${source}:`, error, context);
    }
    
    // 
    if (this.config.enableReporting) {
      this.reportError(errorInfo);
    }
    
    // 
    this.triggerCallbacks(errorInfo);
    
    return errorInfo;
  }

  /**
   * 
   * @param {Error} error - 
   * @returns {string} 
   */
  determineErrorCategory(error) {
    const { NETWORK, VALIDATION, SERVER, CLIENT, UNKNOWN } = this.config.errorCategories;
    
    // 
    if (error.name === 'NetworkError' || error.message.includes('network') || 
        error.message.includes('fetch') || error.message.includes('xhr')) {
      return NETWORK;
    }
    
    // 
    if (error.name === 'ValidationError' || error.message.includes('validation') || 
        error.message.includes('valid') || error.message.includes('required')) {
      return VALIDATION;
    }
    
    // 
    if (error.status >= 500 || (error.response && error.response.status >= 500)) {
      return SERVER;
    }
    
    // 
    if (error.status >= 400 && error.status < 500 || 
        (error.response && error.response.status >= 400 && error.response.status < 500)) {
      return CLIENT;
    }
    
    return UNKNOWN;
  }

  /**
   * 
   * @param {Object} errorInfo - 
   */
  updateErrorStats(errorInfo) {
    this.errorStats.total++;
    
    // 
    if (!this.errorStats.byCategory[errorInfo.category]) {
      this.errorStats.byCategory[errorInfo.category] = 0;
    }
    this.errorStats.byCategory[errorInfo.category]++;
    
    // 
    if (!this.errorStats.bySource[errorInfo.source]) {
      this.errorStats.bySource[errorInfo.source] = 0;
    }
    this.errorStats.bySource[errorInfo.source]++;
  }

  /**
   * 
   * @param {Object} errorInfo - 
   */
  addToHistory(errorInfo) {
    this.errorHistory.unshift(errorInfo);
    
    // 
    if (this.errorHistory.length > this.config.maxHistoryLength) {
      this.errorHistory = this.errorHistory.slice(0, this.config.maxHistoryLength);
    }
  }

  /**
   * 
   */
  clearHistory() {
    this.errorHistory = [];
    return this.errorHistory;
  }

  /**
   * 
   * @param {Object} filters - 
   * @returns {Array} 
   */
  getHistory(filters = {}) {
    let filteredHistory = [...this.errorHistory];
    
    // 
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        filteredHistory = filteredHistory.filter(error => error[key] === value);
      });
    }
    
    return filteredHistory;
  }

  /**
   * 
   * @returns {Object} 
   */
  getErrorStats() {
    return {
      ...this.errorStats,
      byCategory: { ...this.errorStats.byCategory },
      bySource: { ...this.errorStats.bySource }
    };
  }

  /**
   * 
   */
  resetErrorStats() {
    this.errorStats = {
      total: 0,
      byCategory: {},
      bySource: {}
    };
    
    // 
    Object.values(this.config.errorCategories).forEach(category => {
      this.errorStats.byCategory[category] = 0;
    });
  }

  /**
   * 
   * @param {Object} errorInfo - 
   * @returns {Promise} 
   */
  async reportError(errorInfo) {
    try {
      const response = await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...errorInfo,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
      
      return response;
    } catch (err) {
      // 
      if (this.config.enableLogging) {
        console.error('Error reporting failed:', err);
      }
      return null;
    }
  }

  /**
   * 
   * @param {Object} errorInfo - 
   */
  triggerCallbacks(errorInfo) {
    // 
    const callbacks = this.errorCallbacks[errorInfo.category] || [];
    
    callbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (err) {
        // 
        if (this.config.enableLogging) {
          console.error('Error in error callback:', err);
        }
      }
    });
  }

  /**
   * 
   * @returns {string} 
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 
const errorHandler = new ErrorHandler();

export default errorHandler;