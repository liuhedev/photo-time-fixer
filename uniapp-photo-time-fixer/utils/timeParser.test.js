/**
 * 时间解析器测试用例
 */

import { TimeParser } from './timeParser.js';

// 测试用例
const testCases = [
  // mmexport + 13位时间戳
  { filename: 'mmexport1234567890123.jpg', expected: new Date(1234567890123) },
  
  // petal_YYYYMMDD_HHMMSS
  { filename: 'petal_20231201_120000.jpg', expected: new Date(2023, 11, 1, 12, 0, 0) },
  
  // TG-YYYY-MM-DD-HHMMSS
  { filename: 'TG-2023-12-01-120000.jpg', expected: new Date(2023, 11, 1, 12, 0, 0) },
  
  // 微信图片_YYYYMMDDHHMMSS
  { filename: '微信图片_20231201120000.jpg', expected: new Date(2023, 11, 1, 12, 0, 0) },
  
  // VID_YYYYMMDD_HHMMSS
  { filename: 'VID_20231201_120000.mp4', expected: new Date(2023, 11, 1, 12, 0, 0) },
  
  // YYYYMMDD_HHMMSS
  { filename: '20231201_120000.jpg', expected: new Date(2023, 11, 1, 12, 0, 0) },
  
  // YYYY-MM-DD
  { filename: '2023-12-01.jpg', expected: new Date(2023, 11, 1, 12, 0, 0) },
  
  // 13位时间戳
  { filename: '1701388800000.jpg', expected: new Date(1701388800000) }
];

console.log('开始测试时间解析功能...\n');

let passedTests = 0;
let totalTests = testCases.length;

for (const testCase of testCases) {
  const result = TimeParser.parseTimeFromFilename(testCase.filename);
  
  if (result && testCase.expected) {
    // 比较时间戳是否相等
    if (Math.abs(result.getTime() - testCase.expected.getTime()) < 1000) {  // 允许1秒误差
      console.log(`✅ ${testCase.filename} -> ${result.toString()}`);
      passedTests++;
    } else {
      console.log(`❌ ${testCase.filename} -> 期望: ${testCase.expected.toString()}, 实际: ${result.toString()}`);
    }
  } else if (!result && !testCase.expected) {
    console.log(`✅ ${testCase.filename} -> 无法解析（符合预期）`);
    passedTests++;
  } else {
    console.log(`❌ ${testCase.filename} -> 期望: ${testCase.expected}, 实际: ${result}`);
  }
}

console.log(`\n测试完成: ${passedTests}/${totalTests} 通过`);

// 导出测试函数供其他模块使用
export { testCases };