/**
 * 从文件名解析时间信息
 * 与Python版本保持相同的解析逻辑
 */

export class TimeParser {
  /**
   * 解析文件名中的时间信息
   * @param {string} filename - 文件名
   * @returns {Date|null} 解析到的时间对象，无法解析时返回null
   */
  static parseTimeFromFilename(filename) {
    // 获取不带扩展名的文件名
    const name = filename.replace(/\.[^/.]+$/, "");
    
    // 新生成格式：YYYYMMDDHHMMSS_时间戳（支持12-14位日期时间）
    let match = name.match(/^(\d{12,14})_(\d+)$/);
    if (match) {
      let dtStr = match[1];
      if (dtStr.length === 14) {
        try {
          return this.parseExact(dtStr, '%Y%m%d%H%M%S');
        } catch (e) {
          // 忽略错误，继续尝试其他格式
        }
      } else if (dtStr.length === 12) {
        try {
          return this.parseExact(dtStr, '%Y%m%d%H%M');
        } catch (e) {
          // 忽略错误，继续尝试其他格式
        }
      } else if (dtStr.length === 13) {
        try {
          return this.parseExact(dtStr.substring(0, 12), '%Y%m%d%H%M');
        } catch (e) {
          // 忽略错误，继续尝试其他格式
        }
      }
    }
    
    // mmexport + 13位毫秒时间戳
    match = name.match(/^mmexport(\d{13})$/);
    if (match) {
      const ts = parseInt(match[1]) / 1000;
      return new Date(ts * 1000);
    }
    
    // mmexport_ + 13位毫秒时间戳
    match = name.match(/^mmexport_(\d{13})$/);
    if (match) {
      const ts = parseInt(match[1]) / 1000;
      return new Date(ts * 1000);
    }
    
    // lv_xxx_YYYYMMDDHHMMSS
    match = name.match(/_(\d{14})$/);
    if (match) {
      return this.parseExact(match[1], '%Y%m%d%H%M%S');
    }
    
    // petal_YYYYMMDD_HHMMSS
    match = name.match(/^petal_(\d{8})_(\d{6})$/);
    if (match) {
      return this.parseExact(match[1] + match[2], '%Y%m%d%H%M%S');
    }
    
    // TG-YYYY-MM-DD-HHMMSS
    match = name.match(/^TG-(\d{4})-(\d{2})-(\d{2})-(\d{6})$/);
    if (match) {
      const dtStr = match[1] + match[2] + match[3] + match[4];
      return this.parseExact(dtStr, '%Y%m%d%H%M%S');
    }
    
    // 微信图片_YYYYMMDDHHMMSS
    match = name.match(/^微信图片_(\d{14})$/);
    if (match) {
      return this.parseExact(match[1], '%Y%m%d%H%M%S');
    }
    
    // VID_YYYYMMDD_HHMMSS
    match = name.match(/^VID_(\d{8})_(\d{6})$/);
    if (match) {
      return this.parseExact(match[1] + match[2], '%Y%m%d%H%M%S');
    }
    
    // 通用：YYYYMMDD_HHMMSS 或 YYYYMMDDHHMMSS
    match = name.match(/(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[_-]?(\d{6})/);
    if (match) {
      const dtStr = match[1] + match[2] + match[3] + match[4];
      return this.parseExact(dtStr, '%Y%m%d%H%M%S');
    }
    
    // 通用：YYYY-MM-DD 或 YYYY_MM_DD
    match = name.match(/(20\d{2})[-_](0[1-9]|1[0-2])[-_](0[1-9]|[12]\d|3[01])/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), 12, 0, 0);
    }
    
    // Notepad_YYYYMMDDHHMM_xxx 或 vp_output_YYYYMMDDHHMM
    match = name.match(/_(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])([0-5]\d)/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), 
                     parseInt(match[4]), parseInt(match[5]), 0);
    }
    
    // 通用：13位毫秒时间戳（优先匹配最后一个）
    const timestampMatches = [...name.matchAll(/(\d{13})/g)];
    if (timestampMatches.length > 0) {
      // 从后往前查找
      for (let i = timestampMatches.length - 1; i >= 0; i--) {
        const ts = parseInt(timestampMatches[i][1]) / 1000;
        if (ts > 1000000000 && ts < 2000000000) {
          return new Date(ts * 1000);
        }
      }
    }
    
    // 通用：10位秒时间戳
    match = name.match(/(\d{10})/);
    if (match) {
      const ts = parseInt(match[1]);
      if (ts > 1000000000 && ts < 2000000000) {
        return new Date(ts * 1000);
      }
    }
    
    // video_YYMMDD_HHMMSS
    match = name.match(/^video_(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/);
    if (match) {
      const year = 2000 + parseInt(match[1]);
      return new Date(year, parseInt(match[2]) - 1, parseInt(match[3]), 
                     parseInt(match[4]), parseInt(match[5]), parseInt(match[6]));
    }
    
    return null;
  }
  
  /**
   * 按指定格式解析日期字符串
   * @param {string} dateString - 日期字符串
   * @param {string} format - 格式字符串
   * @returns {Date} 解析到的日期对象
   */
  static parseExact(dateString, format) {
    if (format === '%Y%m%d%H%M%S') {
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1;
      const day = parseInt(dateString.substring(6, 8));
      const hour = parseInt(dateString.substring(8, 10));
      const minute = parseInt(dateString.substring(10, 12));
      const second = parseInt(dateString.substring(12, 14));
      return new Date(year, month, day, hour, minute, second);
    } else if (format === '%Y%m%d%H%M') {
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1;
      const day = parseInt(dateString.substring(6, 8));
      const hour = parseInt(dateString.substring(8, 10));
      const minute = parseInt(dateString.substring(10, 12));
      return new Date(year, month, day, hour, minute, 0);
    }
    
    throw new Error('Unsupported format: ' + format);
  }
  
  /**
   * 格式化日期为指定格式
   * @param {Date} date - 日期对象
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的日期字符串
   */
  static format(date, format) {
    if (format === 'yyyy-MM-dd HH:mm:ss') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    throw new Error('Unsupported format: ' + format);
  }
}