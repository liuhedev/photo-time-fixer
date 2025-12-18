/**
 * 文件处理工具类
 */

export class FileUtils {
  /**
   * 将Base64字符串转换为ArrayBuffer
   * @param {string} base64 - Base64字符串
   * @returns {ArrayBuffer} ArrayBuffer对象
   */
  static base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * 将ArrayBuffer转换为Base64字符串
   * @param {ArrayBuffer} arrayBuffer - ArrayBuffer对象
   * @returns {string} Base64字符串
   */
  static arrayBufferToBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * 读取文件内容为ArrayBuffer
   * @param {string} filePath - 文件路径
   * @returns {Promise<ArrayBuffer>} 文件内容的ArrayBuffer
   */
  static readFileAsArrayBuffer(filePath) {
    return new Promise((resolve, reject) => {
      // 在UniApp中读取文件
      uni.getFileSystemManager().readFile({
        filePath: filePath,
        success: (res) => {
          // 如果是base64格式，需要转换为ArrayBuffer
          if (typeof res.data === 'string') {
            resolve(this.base64ToArrayBuffer(res.data));
          } else {
            resolve(res.data);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
  
  /**
   * 保存ArrayBuffer为文件
   * @param {ArrayBuffer} arrayBuffer - 要保存的数据
   * @param {string} fileName - 文件名
   * @returns {Promise<string>} 保存的文件路径
   */
  static saveArrayBufferToFile(arrayBuffer, fileName) {
    return new Promise((resolve, reject) => {
      // 将ArrayBuffer转换为base64
      const base64 = this.arrayBufferToBase64(arrayBuffer);
      
      // 获取文档目录
      const docDir = uni.env.DOCUMENT_ROOT || uni.env.USER_DATA_PATH;
      const filePath = `${docDir}/${fileName}`;
      
      // 写入文件
      uni.getFileSystemManager().writeFile({
        filePath: filePath,
        data: base64,
        encoding: 'base64',
        success: () => {
          resolve(filePath);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
  
  /**
   * 生成新的文件名（基于时间解析结果）
   * @param {string} originalName - 原始文件名
   * @param {Date} parsedTime - 解析到的时间
   * @returns {string} 新的文件名
   */
  static generateNewFileName(originalName, parsedTime) {
    // 获取文件扩展名
    const ext = originalName.slice(originalName.lastIndexOf('.'));
    
    // 生成时间戳
    const timestamp = Math.floor(parsedTime.getTime() / 1000);
    
    // 格式化时间
    const year = parsedTime.getFullYear();
    const month = String(parsedTime.getMonth() + 1).padStart(2, '0');
    const day = String(parsedTime.getDate()).padStart(2, '0');
    const hours = String(parsedTime.getHours()).padStart(2, '0');
    const minutes = String(parsedTime.getMinutes()).padStart(2, '0');
    const seconds = String(parsedTime.getSeconds()).padStart(2, '0');
    
    // 生成新文件名: YYYYMMDDHHMMSS_timestamp.ext
    return `${year}${month}${day}${hours}${minutes}${seconds}_${timestamp}${ext}`;
  }
}