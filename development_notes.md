# 游戏开发笔记

## 项目概述
这是一个移动端游戏项目，使用Vue.js和Vite构建，支持全屏竖屏锁定功能，并针对不同浏览器进行了兼容性优化。

## 功能特性

### 全屏功能
- 支持进入/退出全屏模式
- 自动保存和恢复音频状态
- 键盘ESC键退出全屏支持

### 移动端全屏竖屏锁定功能

#### 实现思路
1. **使用CSS强制竖屏样式**：通过直接设置document.documentElement.style.orientation = 'portrait'作为基础保障
2. **使用portrait-primary精确方向**：明确锁定为"portrait-primary"而非普通"portrait"，确保在支持的设备上获得最佳效果
3. **添加延迟锁定逻辑**：在进入全屏后执行方向锁定，确保全屏状态已稳定建立，并为不同浏览器设置不同延迟
4. **集成多API兼容性方案**：
   - 优先使用标准的screen.orientation.lock API
   - 同时支持旧版screen.lockOrientation API
   - 添加浏览器前缀支持(moz、webkit)及完整错误处理
5. **Firefox浏览器特殊处理**：
   - 检测Firefox浏览器并应用特殊CSS转换
   - 设置更长的延迟时间确保稳定
   - 使用transform属性强制保持竖屏显示
   - 添加专用CSS类.firefox-fullscreen用于样式隔离
6. **多浏览器全屏样式支持**：为各主流浏览器添加全屏伪类样式，确保一致的竖屏体验
7. **完善退出全屏逻辑**：在退出全屏时移除所有强制样式并正确解锁方向
8. **详细日志输出**：添加浏览器类型检测和详细日志，便于调试

#### 核心代码

##### 1. 全局CSS样式 - Firefox全屏支持
```css
/* Firefox全屏竖屏锁定支持 */
.firefox-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 9999 !important;
  background: #000 !important;
  overflow: hidden !important;
  touch-action: pan-y !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

/* 确保全屏时设备方向变化不会影响 */
:fullscreen {
  orientation: portrait !important;
}

:-webkit-full-screen {
  orientation: portrait !important;
}

:-moz-full-screen {
  orientation: portrait !important;
}

:-ms-fullscreen {
  orientation: portrait !important;
}

/* 防止意外旋转 */
@media (max-width: 768px) {
  html, body {
    orientation: portrait !important;
  }
}
```

##### 2. toggleFullscreen函数增强
```javascript
const toggleFullscreen = async () => {
  // 检测浏览器类型
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  
  if (!document.fullscreenElement) {
    // 进入全屏前添加强制竖屏样式
    document.documentElement.style.orientation = 'portrait';
    
    // 为Firefox准备全屏选项（不含screenOrientation）
    const fullscreenOptions = isFirefox ? {} : { screenOrientation: 'portrait-primary' };
    
    try {
      // 进入全屏
      await document.documentElement.requestFullscreen(fullscreenOptions);
      
      // 延迟执行方向锁定，确保全屏已稳定
      setTimeout(() => {
        // 再次添加强制样式
        document.documentElement.style.orientation = 'portrait';
        
        // 多API兼容的方向锁定
        try {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("portrait-primary")
              .then(() => console.log("竖屏锁定成功(标准API)"))
              .catch((err) => console.warn("竖屏锁定失败(标准API):", err.message));
          } else if (screen.lockOrientation) {
            screen.lockOrientation("portrait-primary");
            console.log("竖屏锁定成功(旧版API)");
          } else if (screen.mozLockOrientation) {
            screen.mozLockOrientation("portrait-primary");
            console.log("竖屏锁定成功(Mozilla API)");
          } else if (screen.webkitLockOrientation) {
            screen.webkitLockOrientation("portrait-primary");
            console.log("竖屏锁定成功(WebKit API)");
          } else {
            console.warn("当前浏览器不支持屏幕方向锁定API");
          }
        } catch (err) {
          console.warn("执行方向锁定时出错:", err.message);
          // 如果API失败，确保CSS样式仍然强制竖屏
          document.documentElement.style.orientation = 'portrait';
        }
      }, isFirefox ? 800 : 500); // Firefox使用更长的延迟
      
      // 添加额外的CSS类用于Firefox特殊处理
      if (isFirefox) {
        document.documentElement.classList.add('firefox-fullscreen');
        document.documentElement.style.transform = 'rotate(0deg)';
        document.documentElement.style.transformOrigin = 'center center';
        document.documentElement.style.willChange = 'transform';
        document.documentElement.style.minHeight = '100vh';
        document.documentElement.style.width = '100vh';
        document.documentElement.style.maxWidth = '100%';
      }
      
    } catch (err) {
      console.error("进入全屏失败:", err);
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document
        .exitFullscreen()
        .then(() => {
          // 检测浏览器类型
          const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
          
          // 移除强制竖屏样式
          document.documentElement.style.orientation = '';
          
          // 移除Firefox特殊样式
          if (isFirefox) {
            document.documentElement.classList.remove('firefox-fullscreen');
            document.documentElement.style.transform = '';
            document.documentElement.style.transformOrigin = '';
            document.documentElement.style.willChange = '';
            document.documentElement.style.minHeight = '';
            document.documentElement.style.width = '';
            document.documentElement.style.maxWidth = '';
          }
          
          // 退出全屏后解锁屏幕方向
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
            console.log("屏幕方向已解锁");
          } else {
            // 尝试使用旧版API解锁
            try {
              if (screen.unlockOrientation) {
                screen.unlockOrientation();
                console.log("使用旧版API解锁屏幕方向");
              } else if (screen.mozUnlockOrientation) {
                screen.mozUnlockOrientation();
              } else if (screen.webkitUnlockOrientation) {
                screen.webkitUnlockOrientation();
              }
            } catch (err) {
              console.warn("解锁方向失败:", err.message);
            }
          }
        })
        .finally(() => {
          isFullscreen.value = !!document.fullscreenElement;
        });
    }
  }
};
```

##### 3. handleFullscreenChange函数增强
```javascript
const handleFullscreenChange = () => {
  const fullscreenActive = !!document.fullscreenElement;
  isFullscreen.value = fullscreenActive;
  
  // 检测浏览器类型
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  console.log("全屏状态变化:", fullscreenActive, "当前方向:", screen.orientation?.type, "浏览器:", isFirefox ? "Firefox" : "其他");
  
  if (fullscreenActive) {
    // 如果进入全屏，尝试再次锁定竖屏方向
    setTimeout(() => {
      try {
        // 为Firefox添加特殊处理
        if (isFirefox) {
          console.log("Firefox全屏变化事件特殊处理");
          document.documentElement.classList.add('firefox-fullscreen');
          document.documentElement.style.transform = 'rotate(0deg)';
          document.documentElement.style.transformOrigin = 'center center';
          document.documentElement.style.willChange = 'transform';
          document.documentElement.style.minHeight = '100vh';
          document.documentElement.style.width = '100vh';
          document.documentElement.style.maxWidth = '100%';
        }
        
        // 多API兼容的方向锁定
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("portrait-primary")
            .catch(() => { /* 忽略锁定失败 */ });
        } else if (screen.lockOrientation) {
          screen.lockOrientation("portrait-primary");
        }
        
        // 添加强制竖屏样式
        document.documentElement.style.orientation = 'portrait';
        
        // 额外的样式保障 - 双重延迟确保稳定
        setTimeout(() => {
          document.documentElement.style.orientation = 'portrait';
          if (isFirefox) {
            document.documentElement.style.transform = 'rotate(0deg)';
          }
        }, 300);
      } catch (err) {
        console.warn("处理全屏变化时锁定方向失败:", err.message);
      }
    }, isFirefox ? 600 : 300); // Firefox使用更长延迟
  } else {
    // 退出全屏处理 - 移除所有样式并解锁方向
    try {
      // 移除强制竖屏样式
      document.documentElement.style.orientation = '';
      
      // 移除Firefox特殊样式
      if (isFirefox) {
        document.documentElement.classList.remove('firefox-fullscreen');
        document.documentElement.style.transform = '';
        document.documentElement.style.transformOrigin = '';
        document.documentElement.style.willChange = '';
        document.documentElement.style.minHeight = '';
        document.documentElement.style.width = '';
        document.documentElement.style.maxWidth = '';
      }
      
      // 解锁方向
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
        console.log("屏幕方向已解锁");
      } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
        console.log("使用旧版API解锁屏幕方向");
      }
    } catch (err) {
      console.warn("处理全屏变化时解锁方向失败:", err.message);
    }
  }
};
```

### 移动端调试
- 集成vconsole库用于移动端开发环境调试
- 通过import.meta.env.DEV条件判断，仅在开发环境加载
- 提供完整的日志输出和错误捕获

## 项目配置

### 开发服务器配置
- 使用`npm run start`启动本地开发服务器（默认localhost）
- 使用`npm run start:host`启动支持网络访问的开发服务器
- 生产构建使用`npm run build`

### 浏览器兼容性
- 支持Chrome、Safari、Edge等主流浏览器
- Firefox浏览器有特殊处理以确保全屏竖屏锁定功能正常工作
- 支持移动端各平台浏览器

## 已知问题和解决方案

### Firefox全屏竖屏锁定问题
**问题描述**：Firefox浏览器在全屏时会自动切换到横屏模式

**解决方案**：
1. 检测Firefox浏览器并应用特殊样式
2. 使用CSS transform属性强制保持竖屏显示
3. 添加专用CSS类和样式规则
4. 增加更长的延迟时间确保全屏状态稳定
5. 移除screenOrientation全屏选项，因为Firefox不支持
6. 使用双重延迟和样式重置确保稳定性

### 移动端调试
**问题描述**：在移动端设备上难以查看调试信息

**解决方案**：
1. 集成vconsole库用于移动端开发环境调试
2. 在main.js中添加条件加载逻辑
3. 确保仅在开发环境加载，不影响生产环境性能