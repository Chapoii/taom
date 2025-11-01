# 开发笔记与踩坑记录

## CSS动画中transform属性冲突问题

### 问题描述
在实现唱片旋转和震动动画时，发现即使同时应用了`rotate`和`vibrate`两个动画，只有震动效果生效，旋转效果完全不显示。但直接在浏览器调试工具中给元素添加`transform: rotate(xxdeg)`时，旋转效果是正常的。

### 原因分析
**根本原因**：CSS动画中，如果多个动画同时应用到同一个元素并且都修改了同一个CSS属性（如`transform`），后面的动画会覆盖前面的动画效果。

在我们的例子中：
1. 首先定义了`rotate`动画，使用`transform: rotate(0deg)`到`transform: rotate(360deg)`
2. 然后定义了`vibrate`动画，使用`transform: scale(1.02)`到`transform: scale(0.98)`
3. 当同时应用这两个动画时，`vibrate`动画的`transform`属性覆盖了`rotate`动画的`transform`属性，导致只有缩放效果生效，旋转效果被完全覆盖

### 解决方案

有两种有效的解决方案：

#### 方案一：合并动画（简单但不够灵活）
将原本分离的多个动画合并为一个单一的关键帧动画，在同一个`transform`属性中同时包含所有需要的变换效果。

```css
/* 合并前 - 会导致属性冲突 */
.vinyl-record.is-playing {
  animation:
    rotate 5s linear infinite,
    vibrate 1s ease-in-out infinite alternate;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes vibrate {
  from { transform: scale(1.02); }
  to { transform: scale(0.98); }
}

/* 合并后 - 正确实现同时旋转和震动 */
.vinyl-record.is-playing {
  animation: rotateAndVibrate 5s linear infinite;
  transform-origin: center;
}

@keyframes rotateAndVibrate {
  0%, 100% {
    transform: rotate(0deg) scale(1.02);
  }
  25% {
    transform: rotate(90deg) scale(0.98);
  }
  50% {
    transform: rotate(180deg) scale(1.02);
  }
  75% {
    transform: rotate(270deg) scale(0.98);
  }
  100% {
    transform: rotate(360deg) scale(1.02);
  }
}
```

#### 方案二：嵌套元素（更灵活，推荐）
通过DOM元素嵌套，让不同的动画应用到不同的元素上，避免属性冲突。这种方法允许单独控制每个动画的参数。

```html
<!-- 嵌套结构 -->
<div class="vinyl-record-container-inner" :class="{ 'is-rotating': isPlaying }">
  <div class="vinyl-record" :class="{ 'is-vibrating': isPlaying }">
    <!-- 唱片内容 -->
  </div>
</div>
```

```css
/* 父元素负责旋转 */
.vinyl-record-container-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vinyl-record-container-inner.is-rotating {
  animation: rotate 10s linear infinite; /* 可以单独调整旋转速度 */
  transform-origin: center;
}

/* 子元素负责震动 */
.vinyl-record.is-vibrating {
  animation: vibrate 1s ease-in-out infinite alternate; /* 可以单独调整震动参数 */
  transition: none;
}

/* 各自的动画定义 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes vibrate {
  from { transform: scale(1.02); }
  to { transform: scale(0.98); }
}
```

方案二的优势是可以完全独立地控制每个动画的参数（速度、缓动函数、持续时间等），更加灵活，便于后期调整。

## 全屏功能实现

### 功能描述
实现按下"F"键切换全屏模式的功能，提升用户体验。

### 实现代码

```javascript
// 全屏功能相关函数
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().catch(err => {
      console.warn(`全屏请求错误: ${err.message}`);
    });
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// 键盘事件处理函数
const handleKeyPress = (event) => {
  if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    toggleFullscreen();
  }
};

// 组件挂载时添加键盘事件监听
document.addEventListener('keydown', handleKeyPress);

// 组件卸载时移除键盘事件监听器
onUnmounted(() => {
  // 其他清理代码...
  document.removeEventListener('keydown', handleKeyPress);
});
```

### 实现说明
1. **全屏切换函数**：使用HTML5 Fullscreen API实现全屏状态的切换
2. **键盘事件监听**：监听键盘按下事件，当用户按下"F"键且没有同时按下Ctrl/Cmd键时触发全屏切换
3. **生命周期管理**：在组件挂载时添加事件监听器，在组件卸载时移除，避免内存泄漏
4. **错误处理**：对全屏请求可能出现的错误进行捕获和提示

### 注意事项
- 某些浏览器可能需要用户交互后才能进入全屏模式
- 全屏API在不同浏览器中可能有兼容性问题，但现代浏览器基本都支持标准API

### 注意事项
1. 确保设置正确的`transform-origin`，特别是对于旋转动画，通常需要设置为元素的中心点
2. 移除可能干扰动画的`transition`属性
3. 使用足够多的关键帧点来确保动画的平滑过渡
4. 对于复杂的动画效果，考虑使用CSS变量或JavaScript来动态控制动画属性

### 经验总结
在设计CSS动画时，要特别注意多个动画之间可能发生的属性冲突，尤其是当它们操作同一个CSS属性时。将相关的变换效果合并到一个动画中，是解决这类冲突的有效方法。