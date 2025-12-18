/**
 * 跨平台兼容性测试
 */

// 检查UniApp环境
const checkUniAppEnvironment = () => {
  console.log('检查UniApp环境...');
  
  // 检查基本API是否存在
  const hasUni = typeof uni !== 'undefined';
  console.log(`uni对象存在: ${hasUni}`);
  
  // 检查文件系统API
  const hasFileSystem = hasUni && typeof uni.getFileSystemManager !== 'undefined';
  console.log(`文件系统API存在: ${hasFileSystem}`);
  
  // 检查选择图片API
  const hasChooseImage = hasUni && typeof uni.chooseImage !== 'undefined';
  console.log(`选择图片API存在: ${hasChooseImage}`);
  
  // 检查保存文件API
  const hasSaveFile = hasUni && typeof uni.saveFile !== 'undefined';
  console.log(`保存文件API存在: ${hasSaveFile}`);
  
  return hasUni && hasFileSystem && hasChooseImage && hasSaveFile;
};

// 检查平台特定功能
const checkPlatformFeatures = () => {
  console.log('\n检查平台特定功能...');
  
  // 获取平台信息
  const platform = uni.getSystemInfoSync().platform;
  console.log(`当前平台: ${platform}`);
  
  // 检查Android特定功能
  if (platform === 'android') {
    console.log('检测到Android平台');
    // Android平台特定检查
  }
  
  // 检查iOS特定功能
  if (platform === 'ios') {
    console.log('检测到iOS平台');
    // iOS平台特定检查
  }
  
  return platform;
};

// 测试文件操作兼容性
const testFileOperations = async () => {
  console.log('\n测试文件操作兼容性...');
  
  try {
    // 测试获取文件系统管理器
    const fs = uni.getFileSystemManager();
    console.log('✓ 获取文件系统管理器成功');
    
    // 测试文档目录
    const docDir = uni.env.DOCUMENT_ROOT || uni.env.USER_DATA_PATH;
    console.log(`✓ 文档目录: ${docDir}`);
    
    return true;
  } catch (error) {
    console.error('✗ 文件操作测试失败:', error);
    return false;
  }
};

// 测试时间解析功能
const testTimeParsing = () => {
  console.log('\n测试时间解析功能...');
  
  // 导入时间解析器
  const { TimeParser } = require('../utils/timeParser.js');
  
  // 测试用例
  const testCases = [
    { filename: 'mmexport1234567890123.jpg', description: 'mmexport + 13位时间戳' },
    { filename: 'petal_20231201_120000.jpg', description: 'petal_YYYYMMDD_HHMMSS' },
    { filename: 'TG-2023-12-01-120000.jpg', description: 'TG-YYYY-MM-DD-HHMMSS' },
    { filename: '微信图片_20231201120000.jpg', description: '微信图片_YYYYMMDDHHMMSS' },
    { filename: '2023-12-01.jpg', description: 'YYYY-MM-DD' }
  ];
  
  let passed = 0;
  
  for (const testCase of testCases) {
    try {
      const result = TimeParser.parseTimeFromFilename(testCase.filename);
      if (result) {
        console.log(`✓ ${testCase.description}: ${testCase.filename} -> ${result.toString()}`);
        passed++;
      } else {
        console.log(`✗ ${testCase.description}: ${testCase.filename} -> 无法解析`);
      }
    } catch (error) {
      console.error(`✗ ${testCase.description}: ${testCase.filename} -> 错误:`, error);
    }
  }
  
  console.log(`时间解析测试: ${passed}/${testCases.length} 通过`);
  return passed === testCases.length;
};

// 主测试函数
const runCompatibilityTests = async () => {
  console.log('开始UniApp跨平台兼容性测试...\n');
  
  // 检查环境
  const envOK = checkUniAppEnvironment();
  if (!envOK) {
    console.error('环境检查失败，无法继续测试');
    return false;
  }
  
  // 检查平台
  const platform = checkPlatformFeatures();
  
  // 测试文件操作
  const fileOpsOK = await testFileOperations();
  
  // 测试时间解析
  const timeParsingOK = testTimeParsing();
  
  // 汇总结果
  console.log('\n=== 测试结果汇总 ===');
  console.log(`环境检查: ${envOK ? '通过' : '失败'}`);
  console.log(`文件操作: ${fileOpsOK ? '通过' : '失败'}`);
  console.log(`时间解析: ${timeParsingOK ? '通过' : '失败'}`);
  console.log(`运行平台: ${platform}`);
  
  const allPassed = envOK && fileOpsOK && timeParsingOK;
  console.log(`\n总体结果: ${allPassed ? '所有测试通过' : '部分测试失败'}`);
  
  return allPassed;
};

// 导出测试函数
export { runCompatibilityTests };