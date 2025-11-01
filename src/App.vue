<template>
  <div
    class="flex items-center justify-center h-screen w-screen bg-animate"
    :style="{
      background: `linear-gradient(135deg, ${themeColors.startColor}, ${themeColors.endColor})`,
      '--text-glow-color': themeColors.textGlowColor,
      '--artistic-text-color': themeColors.artisticTextColor,
    }"
    @click="handleBackgroundClick"
  >
    <!-- 点击粒子容器 -->
    <div class="click-particles-container" ref="clickParticlesContainer"></div>
    <!-- 初始视图 -->
    <div
      v-show="!showPlayer"
      id="initial-view"
      class="flex flex-col items-center justify-center absolute inset-0 z-10"
    >
      <h1
        class="artistic-text mb-12"
        :style="{ color: themeColors.artisticTextColor }"
      >
        音乐之禅
      </h1>
      <div
        class="upload-btn flex items-center justify-center cursor-pointer text-white text-2xl rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"
        :style="{
          background: themeColors.primaryColor,
          'box-shadow': `0 4px 15px ${themeColors.primaryColor}60`,
        }"
        @click="triggerFileUpload"
      >
        <i class="fas fa-plus"></i>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="audio/*"
        class="hidden"
        @change="handleFileChange"
      />
    </div>

    <!-- 播放器视图 -->
    <div
      v-show="showPlayer"
      id="player-view"
      class="flex flex-col items-center justify-center absolute inset-0 z-20"
    >
      <!-- 旋转唱片组件 -->
      <div class="vinyl-record-container mb-20">
        <!-- 圆环粒子容器 -->
        <div class="particles-container" ref="particlesContainer"></div>

        <!-- 唱片主体 -->
        <div
          class="vinyl-record-container-inner"
          :class="{ 'is-vibrating': isPlaying }"
        >
          <div
            class="vinyl-record"
            :class="{ 'is-rotating': isPlaying }"
            :style="{
              background: `radial-gradient(circle, ${themeColors.primaryColor} 0%, ${themeColors.accentColor} 100%)`,
              borderColor: themeColors.accentColor,
            }"
          >
            <div class="vinyl-grooves"></div>
            <div
              class="vinyl-center"
              :style="{ background: themeColors.startColor }"
            >
              <i
                class="fas fa-music text-4xl"
                :style="{ color: themeColors.artisticTextColor }"
              ></i>
            </div>
          </div>
        </div>
      </div>
      <div
        class="audio-player w-full max-w-md bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white border-opacity-20"
      >
        <div class="track-info mb-6 text-center">
          <div
            class="track-title text-2xl font-semibold text-white mb-2"
            id="track-title"
          >
            {{ trackTitle }}
          </div>
        </div>

        <div
          class="progress-container relative h-2 bg-white bg-opacity-20 rounded-full cursor-pointer mb-4"
          @click="seekAudio"
        >
          <div
            class="progress-bar absolute top-0 left-0 h-full rounded-full"
            :style="{
              width: progress + '%',
              background: themeColors.accentColor,
            }"
          ></div>
        </div>

        <div class="time-info flex justify-between text-white text-sm mb-6">
          <span id="current-time">{{ currentTimeFormatted }}</span>
          <span id="duration">{{ durationFormatted }}</span>
        </div>

        <div
          class="controls flex justify-center items-center space-x-8 text-white"
        >
          <div
            class="play-pause-btn w-[50px] h-[50px] flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-[50%] transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none"
            @click="togglePlayPause"
          >
            <i v-if="isPlaying" class="fas fa-pause text-xl"></i>
            <i v-else class="fas fa-play text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <audio
      ref="audioPlayer"
      :src="audioSrc"
      @loadedmetadata="onMetadataLoaded"
      @timeupdate="onTimeUpdate"
      @ended="onAudioEnded"
    ></audio>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from "vue";

// 响应式状态
const showPlayer = ref(false);
const trackTitle = ref("未知曲目");
const audioSrc = ref("");
const progress = ref(0);
const currentTimeFormatted = ref("0:00");
const durationFormatted = ref("0:00");
const isPlaying = ref(false);

// 主题颜色相关
const themeColors = ref(generateRandomTheme());

// 全屏功能相关函数
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().catch((err) => {
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
  if (event.key.toLowerCase() === "f" && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    toggleFullscreen();
  }
};

// 生成随机主题色
function generateRandomTheme() {
  // 生成色调（0-360）
  let hue = Math.floor(Math.random() * 360);

  // 调整颜色亮度和对比度
  // 对于黄色等亮色，特别处理以降低亮度
  let saturation = 30 + Math.floor(Math.random() * 30); // 30%-60%的饱和度，降低饱和度减少刺眼感
  let lightness = 60 + Math.floor(Math.random() * 15); // 60%-75%的亮度，整体降低亮度

  // 对于黄色系（45-60度）和橙色系（30-45度），进一步降低亮度并微调色调
  if (hue >= 30 && hue <= 60) {
    lightness -= 10; // 降低黄色系亮度
    saturation -= 5; // 稍微降低饱和度
  }

  // 主色调 - 用于按钮，但降低对比度
  const primaryHue = hue;
  const primarySaturation = saturation - 10; // 降低按钮饱和度
  const primaryLightness = lightness - 15; // 按钮稍深，但不要太深

  // 渐变结束颜色 - 稍微调整色调以获得协调的颜色
  const endHue = (hue + 25) % 360; // 减少色调差异，降低对比度
  const endLightness = lightness - 5;

  // 强调色 - 用于进度条等，使用类似色而非互补色，降低对比度
  const accentHue = (hue + 30) % 360; // 使用类似色而非互补色
  const accentSaturation = saturation;
  const accentLightness = lightness - 10;

  // 艺术字颜色 - 使用与背景协调但有足够区分度的颜色
  const artisticTextHue = hue;
  const artisticTextSaturation = saturation + 10;
  const artisticTextLightness = 20; // 深色文字，确保可读性

  return {
    startColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    endColor: `hsl(${endHue}, ${saturation}%, ${endLightness}%)`,
    primaryColor: `hsl(${primaryHue}, ${primarySaturation}%, ${primaryLightness}%)`,
    accentColor: `hsl(${accentHue}, ${accentSaturation}%, ${accentLightness}%)`,
    textGlowColor: `hsl(${primaryHue}, ${primarySaturation}%, ${primaryLightness}%)`,
    artisticTextColor: `hsl(${artisticTextHue}, ${artisticTextSaturation}%, ${artisticTextLightness}%)`,
  };
}

// 重新生成随机主题
const regenerateTheme = () => {
  themeColors.value = generateRandomTheme();
};

// 页面加载时自动生成随机主题
// 可以通过刷新页面触发重新生成

// 组件挂载时添加键盘事件监听
document.addEventListener("keydown", handleKeyPress);

// 模板引用
const fileInput = ref(null);
const audioPlayer = ref(null);
const particlesContainer = ref(null);
const clickParticlesContainer = ref(null);

// 存储当前的blob URL，用于清理
let currentBlobUrl = "";

// 工具函数
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

// 清理音频资源
const cleanupAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
  }
  // 释放之前的blob URL，避免内存泄漏
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = "";
  }
};

// 方法函数
const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // 先清理之前的资源
    cleanupAudio();

    const fileName = file.name.replace(/\.[^/.]+$/, "");
    trackTitle.value = fileName;

    // 创建新的blob URL并保存引用
    currentBlobUrl = URL.createObjectURL(file);
    audioSrc.value = currentBlobUrl;

    showPlayer.value = true;

    // 播放音乐
    setTimeout(() => {
      if (audioPlayer.value) {
        audioPlayer.value.loop = true;
        audioPlayer.value.play().catch((err) => {
          console.warn("播放失败:", err);
          isPlaying.value = false;
        });
        isPlaying.value = true;
      }
    }, 100);
  }
};

const togglePlayPause = () => {
  if (audioPlayer.value) {
    if (audioPlayer.value.paused) {
      audioPlayer.value.play().catch((err) => {
        console.warn("播放失败:", err);
        isPlaying.value = false;
      });
      isPlaying.value = true;
    } else {
      audioPlayer.value.pause();
      isPlaying.value = false;
    }
  }
};

const onMetadataLoaded = () => {
  if (audioPlayer.value) {
    durationFormatted.value = formatTime(audioPlayer.value.duration);
  }
};

const onTimeUpdate = () => {
  if (audioPlayer.value && audioPlayer.value.duration) {
    const audio = audioPlayer.value;
    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTimeFormatted.value = formatTime(audio.currentTime);
  }
};

const seekAudio = (event) => {
  if (audioPlayer.value && audioPlayer.value.duration) {
    const progressContainer = event.currentTarget;
    const width = progressContainer.clientWidth;
    const clickX = event.offsetX;
    const duration = audioPlayer.value.duration;
    audioPlayer.value.currentTime = (clickX / width) * duration;
  }
};

// 粒子动画相关变量
let particleInterval = null;

const onAudioEnded = () => {
  isPlaying.value = false;
  stopParticleAnimation();
};

// 开始粒子动画
const startParticleAnimation = () => {
  if (!particlesContainer.value || particleInterval) return;

  // 每秒创建几个圆环
  particleInterval = setInterval(() => {
    createParticleRing();
  }, 2000);
};

// 停止粒子动画
const stopParticleAnimation = () => {
  if (particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  // 清除所有粒子
  if (particlesContainer.value) {
    particlesContainer.value.innerHTML = "";
  }
};

// 创建粒子圆环
const createParticleRing = () => {
  if (!particlesContainer.value) return;

  const ring = document.createElement("div");
  ring.className = "particle-ring";

  // 设置圆环样式
  const baseSize = 200; // 基础大小
  const randomOffset = Math.random() * 10 - 5;
  const size = baseSize + randomOffset;

  ring.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border: 2px solid ${themeColors.accentColor};
    opacity: 0.8;
    animation: expandAndFade 2s ease-out forwards;
  `;

  particlesContainer.value.appendChild(ring);

  // 动画结束后移除元素
  setTimeout(() => {
    if (ring.parentNode) {
      ring.parentNode.removeChild(ring);
    }
  }, 2000);
};

// 监听播放状态变化，控制粒子动画
watch(
  () => isPlaying.value,
  (newVal) => {
    if (newVal) {
      startParticleAnimation();
    } else {
      stopParticleAnimation();
    }
  }
);

// 处理背景点击事件，创建点击粒子特效
const handleBackgroundClick = (event) => {
  // 避免点击播放器控件时也触发粒子效果
  if (
    event.target.closest(".audio-player") ||
    event.target.closest(".play-pause-btn")
  ) {
    return;
  }

  // 获取点击位置
  const x = event.clientX;
  const y = event.clientY;

  // 创建点击粒子
  createClickParticles(x, y);
};

// 创建点击粒子
const createClickParticles = (x, y) => {
  if (!clickParticlesContainer.value) return;

  // 生成5-8个粒子
  const particleCount = 5 + Math.floor(Math.random() * 4);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "click-particle";

    // 计算随机角度和距离
    const angle =
      (Math.PI * 2 * i) / particleCount + Math.random() * 0.5 - 0.25;
    const distance = 30 + Math.random() * 20;
    const translateX = Math.cos(angle) * distance;
    const translateY = Math.sin(angle) * distance;

    // 随机大小和颜色
    const size = 4 + Math.random() * 6;
    const opacity = 0.7 + Math.random() * 0.3;
    const colors = [
      themeColors.value.primaryColor,
      themeColors.value.accentColor,
      themeColors.value.startColor,
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // 设置粒子样式
    particle.style.cssText = `
      position: fixed;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      background: ${randomColor};
      opacity: ${opacity};
      border-radius: 50%;
      box-shadow: 0 0 8px ${randomColor};
      pointer-events: none;
      z-index: 100;
      animation: clickParticleMove 1s ease-out forwards;
      --translateX: ${translateX}px;
      --translateY: ${translateY}px;
      --delay: ${Math.random() * 0.3}s;
    `;

    clickParticlesContainer.value.appendChild(particle);
    particles.push(particle);
  }

  // 动画结束后移除所有粒子
  setTimeout(() => {
    particles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
  }, 1200);
};

// 组件卸载时清理资源
onUnmounted(() => {
  cleanupAudio();
  stopParticleAnimation();
  // 清理点击粒子容器
  if (clickParticlesContainer.value) {
    clickParticlesContainer.value.innerHTML = "";
  }
  // 移除键盘事件监听器
  document.removeEventListener("keydown", handleKeyPress);
});
</script>

<style>
.artistic-text {
  font-family: "Microsoft YaHei", sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: textGlow 3s ease-in-out infinite alternate;
}

/* 流式渐变背景动画 */
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-animate {
  background-size: 400% 400%;
  animation: gradientFlow 15s linear infinite;
  will-change: background-position;
}

@keyframes textGlow {
  from {
    text-shadow:
      0 0 5px rgba(255, 255, 255, 0.7),
      0 0 10px var(--text-glow-color);
  }
  to {
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.9),
      0 0 20px var(--text-glow-color);
  }
}

/* 旋转唱片样式 */
.vinyl-record-container {
  perspective: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 200px;
  width: 200px;
}

/* 粒子容器 */
.particles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  pointer-events: none;
  z-index: 10;
}

/* 粒子圆环 */
.particle-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

@keyframes expandAndFade {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}

.vinyl-record {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  box-shadow:
    0 0 20px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(255, 255, 255, 0.3);
  border: 2px solid;
  transition: transform 0.3s ease;
  z-index: 20;
}

.vinyl-grooves {
  width: calc(100% - 80px);
  height: calc(100% - 80px);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: repeating-radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.2) 0px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(255, 255, 255, 0.2) 4px
  );
  border-radius: 50%;
}

.vinyl-center {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    inset 0 0 8px rgba(0, 0, 0, 0.5),
    0 0 15px rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

/* 旋转和震动动画 */
.vinyl-record-container-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vinyl-record-container-inner.is-vibrating {
  animation: rotate 20s linear infinite; /* 降低旋转速度到20秒 */
  transform-origin: center;
}

.vinyl-record.is-rotating {
  animation: vibrate 2s ease-in-out infinite alternate;
  transition: none;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes vibrate {
  from {
    transform: scale(1.02);
  }
  to {
    transform: scale(0.98);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .vinyl-record-container {
    height: 150px;
    width: 150px;
  }

  .particles-container {
    width: 150px;
    height: 150px;
  }

  .vinyl-record {
    width: 150px;
    height: 150px;
  }

  .vinyl-center {
    width: 25px;
    height: 25px;
  }

  .particle-ring {
    animation: expandAndFadeMobile 2s ease-out forwards;
  }
}

@keyframes expandAndFadeMobile {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 0;
  }
}

/* 点击粒子样式 */
.click-particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.click-particle {
  animation-delay: var(--delay);
}

@keyframes clickParticleMove {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--translateX), var(--translateY)) scale(0.2);
    opacity: 0;
  }
}
</style>
