<template>
  <view class="file-processor">
    <view class="header">
      <text class="title">批量处理照片</text>
    </view>
    
    <view class="controls">
      <button class="control-btn" @click="selectAll">全选</button>
      <button class="control-btn" @click="deselectAll">取消选择</button>
    </view>
    
    <view class="file-list">
      <view class="file-item" v-for="(file, index) in files" :key="index">
        <label class="checkbox-wrapper">
          <checkbox 
            :value="index.toString()" 
            :checked="file.selected" 
            @click="toggleSelection(index)"
          />
        </label>
        <view class="file-info">
          <text class="file-name">{{ file.name }}</text>
          <text class="file-size">{{ formatFileSize(file.size) }}</text>
        </view>
        <view class="file-time">
          <text v-if="file.parsedTime" class="time-success">{{ file.parsedTime }}</text>
          <text v-else class="time-error">无法解析</text>
        </view>
      </view>
    </view>
    
    <view class="summary">
      <text>已选择 {{ selectedCount }}/{{ files.length }} 个文件</text>
    </view>
    
    <view class="actions">
      <button class="action-btn primary" @click="processSelected" :disabled="selectedCount === 0">
        处理选中文件
      </button>
      <button class="action-btn secondary" @click="cancelProcessing">
        取消
      </button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    files: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    selectedCount() {
      return this.files.filter(file => file.selected).length;
    }
  },
  methods: {
    toggleSelection(index) {
      this.$emit('toggle-selection', index);
    },
    
    selectAll() {
      this.$emit('select-all');
    },
    
    deselectAll() {
      this.$emit('deselect-all');
    },
    
    processSelected() {
      this.$emit('process-selected');
    },
    
    cancelProcessing() {
      this.$emit('cancel-processing');
    },
    
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  }
}
</script>

<style scoped>
.file-processor {
  padding: 20rpx;
}

.header {
  text-align: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
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

.file-list {
  margin-bottom: 30rpx;
  max-height: 700rpx;
  overflow-y: scroll;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.checkbox-wrapper {
  margin-right: 20rpx;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
  margin-bottom: 10rpx;
}

.file-size {
  font-size: 24rpx;
  color: #999;
}

.file-time {
  margin-left: 20rpx;
}

.time-success {
  font-size: 28rpx;
  color: #007AFF;
}

.time-error {
  font-size: 28rpx;
  color: #FF3B30;
}

.summary {
  text-align: center;
  margin-bottom: 30rpx;
  font-size: 28rpx;
  color: #666;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin: 0 10rpx;
}

.primary {
  background-color: #007AFF;
  color: white;
}

.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.action-btn[disabled] {
  background-color: #CCC;
  color: #999;
}
</style>