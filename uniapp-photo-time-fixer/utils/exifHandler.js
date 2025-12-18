/**
 * EXIF元数据处理模块
 * 使用piexifjs库处理图片EXIF信息
 */

import piexif from 'piexifjs';

export class ExifHandler {
  /**
   * 修改图片的EXIF时间信息
   * @param {ArrayBuffer} imageData - 图片数据
   * @param {Date} dateTime - 要设置的时间
   * @returns {ArrayBuffer} 修改后的图片数据
   */
  static modifyExifTime(imageData, dateTime) {
    try {
      // 检查是否为有效的JPEG数据
      if (!this.isValidJPEG(imageData)) {
        throw new Error('无效的JPEG数据');
      }
      
      // 加载EXIF数据
      const exifObj = piexif.load(imageData);
      
      // 格式化时间为EXIF所需的格式
      const exifTime = this.formatExifDateTime(dateTime);
      
      // 修改EXIF时间信息
      if (!exifObj['0th']) {
        exifObj['0th'] = {};
      }
      
      // 设置主要时间字段
      exifObj['0th'][piexif.ImageIFD.DateTime] = exifTime;
      
      // 如果EXIF部分存在，也更新其中的时间字段
      if (exifObj.Exif) {
        exifObj.Exif[piexif.ExifIFD.DateTimeOriginal] = exifTime;
        exifObj.Exif[piexif.ExifIFD.DateTimeDigitized] = exifTime;
      }
      
      // 如果GPS部分不存在，初始化它
      if (!exifObj.GPS) {
        exifObj.GPS = {};
      }
      
      // 将修改后的EXIF数据插入到图片中
      const exifBytes = piexif.dump(exifObj);
      const newData = piexif.insert(exifBytes, imageData);
      
      return newData;
    } catch (error) {
      console.error('修改EXIF时间信息时出错:', error);
      throw error;
    }
  }
  
  /**
   * 从图片中读取EXIF时间信息
   * @param {ArrayBuffer} imageData - 图片数据
   * @returns {Object|null} 包含各种时间信息的对象，无法读取时返回null
   */
  static readExifTime(imageData) {
    try {
      // 检查是否为有效的JPEG数据
      if (!this.isValidJPEG(imageData)) {
        throw new Error('无效的JPEG数据');
      }
      
      // 加载EXIF数据
      const exifObj = piexif.load(imageData);
      
      // 提取时间信息
      const timeInfo = {};
      
      // 读取主时间
      if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.DateTime]) {
        timeInfo.dateTime = exifObj['0th'][piexif.ImageIFD.DateTime];
      }
      
      // 读取原始时间
      if (exifObj.Exif && exifObj.Exif[piexif.ExifIFD.DateTimeOriginal]) {
        timeInfo.dateTimeOriginal = exifObj.Exif[piexif.ExifIFD.DateTimeOriginal];
      }
      
      // 读取数字化时间
      if (exifObj.Exif && exifObj.Exif[piexif.ExifIFD.DateTimeDigitized]) {
        timeInfo.dateTimeDigitized = exifObj.Exif[piexif.ExifIFD.DateTimeDigitized];
      }
      
      return timeInfo;
    } catch (error) {
      console.error('读取EXIF时间信息时出错:', error);
      return null;
    }
  }
  
  /**
   * 检查是否为有效的JPEG数据
   * @param {ArrayBuffer} data - 数据
   * @returns {boolean} 是否为有效的JPEG数据
   */
  static isValidJPEG(data) {
    if (!(data instanceof ArrayBuffer)) {
      return false;
    }
    
    const arr = new Uint8Array(data);
    return arr[0] === 0xFF && arr[1] === 0xD8 && arr[arr.length - 2] === 0xFF && arr[arr.length - 1] === 0xD9;
  }
  
  /**
   * 将Date对象格式化为EXIF时间格式
   * @param {Date} date - Date对象
   * @returns {string} 格式化后的时间字符串 (YYYY:MM:DD HH:MM:SS)
   */
  static formatExifDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * 将EXIF时间字符串解析为Date对象
   * @param {string} exifDateTime - EXIF时间字符串 (YYYY:MM:DD HH:MM:SS)
   * @returns {Date|null} Date对象，解析失败时返回null
   */
  static parseExifDateTime(exifDateTime) {
    try {
      // 将EXIF格式转换为标准格式
      const standardFormat = exifDateTime.replace(/:/g, '-').replace(' ', 'T');
      return new Date(standardFormat);
    } catch (error) {
      console.error('解析EXIF时间字符串时出错:', error);
      return null;
    }
  }
}