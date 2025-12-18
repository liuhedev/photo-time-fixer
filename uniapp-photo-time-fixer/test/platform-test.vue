<template>
  <view class="container">
    <view class="header">
      <text class="title">平台兼容性测试</text>
    </view>
    
    <view class="content">
      <button class="test-btn" @click="runTests">运行兼容性测试</button>
      
      <view class="results" v-if="testResults.length > 0">
        <view class="result-item" v-for="(result, index) in testResults" :key="index">
          <text :class="['result-text', result.passed ? 'passed' : 'failed']">
            {{ result.description }}: {{ result.passed ? '通过' : '失败' }}
          </text>
          <text v-if="result.details" class="details">{{ result.details }}</text>
        </view>
      </view>
      
      <view class="summary" v-if="testCompleted">
        <text :class="['summary-text', allTestsPassed ? 'passed' : 'failed']">
          总体结果: {{ allTestsPassed ? '所有测试通过' : '部分测试失败' }}
        </text>
        <text class="platform-info">运行平台: {{ platformInfo }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      testResults: [],
      testCompleted: false,
      platformInfo: '',
      allTestsPassed: false
    }
  },
  methods: {
    async runTests() {
      // 清空之前的结果
      this.testResults = [];
      this.testCompleted = false;
      
      // 获取平台信息
      try {
        const sysInfo = uni.getSystemInfoSync();
        this.platformInfo = `${sysInfo.platform} ${sysInfo.version} (${sysInfo.model})`;
      } catch (error) {
        this.platformInfo = '无法获取平台信息';
      }
      
      // 测试1: 检查UniApp环境
      this.testResults.push({
        description: '检查UniApp环境',
        passed: this.checkUniAppEnvironment(),
        details: ''
      });
      
      // 测试2: 检查文件系统API
      this.testResults.push({
        description: '检查文件系统API',
        passed: this.checkFileSystemAPI(),
        details: ''
      });
      
      // 测试3: 检查图片选择API
      this.testResults.push({
        description: '检查图片选择API',
        passed: this.checkChooseImageAPI(),
        details: ''
      });
      
      // 测试4: 检查时间解析功能
      const timeParsingResult = await this.testTimeParsing();
      this.testResults.push({
        description: '检查时间解析功能',
        passed: timeParsingResult.passed,
        details: timeParsingResult.details
      });
      
      // 测试5: 检查文件操作
      const fileOperationResult = await this.testFileOperations();
      this.testResults.push({
        description: '检查文件操作',
        passed: fileOperationResult.passed,
        details: fileOperationResult.details
      });
      
      // 计算总体结果
      this.allTestsPassed = this.testResults.every(result => result.passed);
      this.testCompleted = true;
    },
    
    checkUniAppEnvironment() {
      try {
        return typeof uni !== 'undefined';
      } catch (error) {
        return false;
      }
    },
    
    checkFileSystemAPI() {
      try {
        return typeof uni.getFileSystemManager !== 'undefined';
      } catch (error) {
        return false;
      }
    },
    
    checkChooseImageAPI() {
      try {
        return typeof uni.chooseImage !== 'undefined';
      } catch (error) {
        return false;
      }
    },
    
    async testTimeParsing() {
      try {
        // 动态导入时间解析器
        const { TimeParser } = await import('../utils/timeParser.js');
        
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
          const result = TimeParser.parseTimeFromFilename(testCase.filename);
          if (result) {
            passed++;
          }
        }
        
        return {
          passed: passed === testCases.length,
          details: `通过 ${passed}/${testCases.length} 个测试用例`
        };
      } catch (error) {
        return {
          passed: false,
          details: `错误: ${error.message}`
        };
      }
    },
    
    async testFileOperations() {
      try {
        // 测试获取文件系统管理器
        const fs = uni.getFileSystemManager();
        
        // 测试文档目录
        const docDir = uni.env.DOCUMENT_ROOT || uni.env.USER_DATA_PATH;
        
        return {
          passed: true,
          details: `文档目录: ${docDir}`
        };
      } catch (error) {
        return {
          passed: false,
          details: `错误: ${error.message}`
        };
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.test-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007AFF;
  color: white;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin-bottom: 30rpx;
}

.results {
  margin-bottom: 30rpx;
}

.result-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.result-text {
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.result-text.passed {
  color: #34C759;
}

.result-text.failed {
  color: #FF3B30;
}

.details {
  font-size: 24rpx;
  color: #666;
  margin-left: 20rpx;
}

.summary {
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
}

.summary-text {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.summary-text.passed {
  color: #34C759;
}

.summary-text.failed {
  color: #FF3B30;
}

.platform-info {
  font-size: 28rpx;
  color: #666;
}
</style>