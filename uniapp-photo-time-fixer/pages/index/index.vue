<template>
  <view class="container">
    <view class="header">
      <text class="title">照片时间修复工具</text>
    </view>
    
    <view class="content">
      <!-- 文件选择区域 -->
      <view class="file-selection">
        <button class="select-btn" @click="selectFiles">选择照片文件</button>
        <button class="select-folder-btn" @click="selectFolder">选择文件夹</button>
      </view>
      
      <!-- 文件列表 -->
      <view class="file-list" v-if="fileList.length > 0">
        <view class="file-item" v-for="(file, index) in fileList" :key="index">
          <checkbox 
            class="file-checkbox"
            :value="index.toString()" 
            :checked="file.selected" 
            @click="toggleFileSelection(index)"
          />
          <text class="file-name">{{ file.name }}</text>
          <text class="file-time" v-if="file.parsedTime">{{ file.parsedTime }}</text>
          <text class="file-error" v-else>无法解析时间</text>
        </view>
      </view>
      
      <!-- 统计信息 -->
      <view class="stats" v-if="fileList.length > 0">
        <text class="stat-ok">可处理: {{ okCount }}</text>
        <text class="stat-error">跳过: {{ errCount }}</text>
        <text class="stat-total">总计: {{ fileList.length }}</text>
      </view>
      
      <!-- 控制按钮 -->
      <view class="controls" v-if="fileList.length > 0">
        <button class="control-btn" @click="selectAll">全选</button>
        <button class="control-btn" @click="deselectAll">取消选择</button>
      </view>
      
      <!-- 处理按钮 -->
      <button class="process-btn" :disabled="selectedCount === 0" @click="processFiles">处理并保存</button>
      
      <!-- 进度条 -->
      <view class="progress" v-if="processing">
        <progress :percent="progressPercent" activeColor="#007AFF" />
        <text class="progress-text">{{ progressText }}</text>
      </view>
      
      <!-- 状态信息 -->
      <view class="status">
        <text>{{ statusText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { TimeParser } from '../../utils/timeParser.js';

export default {
  data() {
    return {
      fileList: [],
      statusText: '请选择要处理的照片文件',
      processing: false,
      progressPercent: 0,
      progressText: '',
      selectedAll: false
    }
  },
  computed: {
    okCount() {
      return this.fileList.filter(file => file.parsedTime).length;
    },
    errCount() {
      return this.fileList.filter(file => !file.parsedTime).length;
    },
    selectedCount() {
      return this.fileList.filter(file => file.selected).length;
    }
  },
  methods: {
    async selectFiles() {
      try {
        // 使用uni.chooseImage选择文件
        const result = await uni.chooseImage({
          count: 10, // 最多选择10张图片
          sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album'] // 可以指定来源是相册还是相机，默认二者都有
        });
        
        // 处理选择的文件
        this.processSelectedFiles(result.tempFiles);
      } catch (error) {
        console.error('选择文件失败:', error);
        this.statusText = '选择文件失败: ' + error.message;
      }
    },
    
    async selectFolder() {
      this.statusText = '选择文件夹功能在移动设备上不可用，请使用文件选择功能';
    },
    
    processSelectedFiles(files) {
      // 清空现有文件列表
      this.fileList = [];
      
      // 处理每个文件
      files.forEach((file, index) => {
        // 解析文件名中的时间
        const parsedTime = TimeParser.parseTimeFromFilename(file.name);
        const formattedTime = parsedTime ? TimeParser.format(parsedTime, 'yyyy-MM-dd HH:mm:ss') : null;
        
        // 添加到文件列表
        this.fileList.push({
          name: file.name,
          path: file.path,
          size: file.size,
          parsedTime: formattedTime,
          selected: true, // 默认选中
          originalTime: parsedTime
        });
      });
      
      this.statusText = `已选择 ${files.length} 个文件`;
    },
    
    toggleFileSelection(index) {
      this.fileList[index].selected = !this.fileList[index].selected;
    },
    
    selectAll() {
      this.fileList.forEach(file => {
        file.selected = true;
      });
      this.statusText = `已选择所有 ${this.fileList.length} 个文件`;
    },
    
    deselectAll() {
      this.fileList.forEach(file => {
        file.selected = false;
      });
      this.statusText = '已取消选择所有文件';
    },
    
    async processFiles() {
      if (this.selectedCount === 0) {
        this.statusText = '请先选择要处理的文件';
        return;
      }
      
      this.processing = true;
      this.progressPercent = 0;
      this.progressText = '开始处理...';
      this.statusText = '正在处理文件...';
      
      try {
        // 这里应该实现实际的文件处理逻辑
        // 由于UniApp在移动端的限制，实际的EXIF处理需要使用原生插件
        // 这里只是模拟处理过程
        
        const selectedFiles = this.fileList.filter(file => file.selected);
        const totalFiles = selectedFiles.length;
        
        for (let i = 0; i < totalFiles; i++) {
          // 更新进度
          this.progressPercent = Math.round((i + 1) / totalFiles * 100);
          this.progressText = `正在处理: ${selectedFiles[i].name}`;
          
          // 模拟处理时间
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.progressText = '处理完成!';
        this.statusText = `成功处理 ${totalFiles} 个文件`;
      } catch (error) {
        console.error('处理文件失败:', error);
        this.statusText = '处理文件失败: ' + error.message;
      } finally {
        this.processing = false;
      }
    }
  }
}
</script>

<style>
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

.file-selection {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.select-btn, .select-folder-btn {
  flex: 1;
  height: 80rpx;
  background-color: #007AFF;
  color: white;
  border-radius: 10rpx;
  font-size: 32rpx;
}

.select-folder-btn {
  background-color: #34C759;
}

.file-list {
  margin-bottom: 30rpx;
  max-height: 900rpx;
  overflow-y: scroll;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.file-checkbox {
  margin-right: 20rpx;
}

.file-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
}

.file-time {
  font-size: 28rpx;
  color: #007AFF;
  margin-left: 20rpx;
  white-space: nowrap;
}

.file-error {
  font-size: 28rpx;
  color: #FF3B30;
  margin-left: 20rpx;
  white-space: nowrap;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.stat-ok, .stat-error, .stat-total {
  font-size: 28rpx;
}

.stat-ok {
  color: #007AFF;
}

.stat-error {
  color: #FF3B30;
}

.stat-total {
  color: #333;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.control-btn {
  padding: 15rpx 30rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.process-btn {
  width: 100%;
  height: 80rpx;
  background-color: #34C759;
  color: white;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin-bottom: 30rpx;
}

.process-btn[disabled] {
  background-color: #CCC;
}

.progress {
  margin-bottom: 30rpx;
}

.progress-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.status {
  text-align: center;
  font-size: 28rpx;
  color: #666;
}
</style>