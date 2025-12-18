/**
 * EXIF处理器测试用例
 */

import { ExifHandler } from './exifHandler.js';

console.log('开始测试EXIF处理功能...\n');

// 测试EXIF时间格式化
const testDateTime = new Date(2023, 11, 1, 12, 30, 45);
const formattedTime = ExifHandler.formatExifDateTime(testDateTime);
console.log(`格式化时间测试: ${formattedTime}`);
console.log(`期望格式: 2023:12:01 12:30:45`);
console.log(formattedTime === '2023:12:01 12:30:45' ? '✅ 通过' : '❌ 失败');

// 测试EXIF时间解析
const parsedTime = ExifHandler.parseExifDateTime('2023:12:01 12:30:45');
console.log(`\n解析时间测试: ${parsedTime}`);
console.log(`期望时间: 2023-12-01T12:30:45`);
console.log(parsedTime && parsedTime.toISOString().startsWith('2023-12-01T12:30:45') ? '✅ 通过' : '❌ 失败');

console.log('\n注意：完整的EXIF功能测试需要实际的JPEG图片文件。');

// 导出测试函数供其他模块使用
export { testDateTime, formattedTime, parsedTime };