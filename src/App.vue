<template>
  <div
    class="flex items-center justify-center h-screen w-screen"
    :style="{ 
      background: `linear-gradient(135deg, ${themeColors.startColor}, ${themeColors.endColor})`,
      '--text-glow-color': themeColors.textGlowColor,
      '--artistic-text-color': themeColors.artisticTextColor
    }"
  >
    <!-- 初始视图 -->
    <div
      v-show="!showPlayer"
      id="initial-view"
      class="flex flex-col items-center justify-center absolute inset-0 z-10"
    >
      <h1 
        class="artistic-text mb-12" 
        :style="{ color: themeColors.artisticTextColor }"
      >音乐之禅</h1>
      <div
        class="upload-btn flex items-center justify-center cursor-pointer text-white text-2xl rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"        
        :style="{ 
          background: themeColors.primaryColor, 
          'box-shadow': `0 4px 15px ${themeColors.primaryColor}60` 
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
            :style="{ width: progress + '%', background: themeColors.accentColor }"
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
import { ref, onUnmounted, computed } from "vue";

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
  const accentHue = (hue + 40) % 360; // 使用类似色而非互补色
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
    artisticTextColor: `hsl(${artisticTextHue}, ${artisticTextSaturation}%, ${artisticTextLightness}%)`
  };
}

// 重新生成随机主题
const regenerateTheme = () => {
  themeColors.value = generateRandomTheme();
};

// 页面加载时自动生成随机主题
// 可以通过刷新页面触发重新生成

// 模板引用
const fileInput = ref(null);
const audioPlayer = ref(null);

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

const onAudioEnded = () => {
  isPlaying.value = false;
};

// 组件卸载时清理资源
onUnmounted(() => {
  cleanupAudio();
});
</script>

<style>
.artistic-text {
  font-family: "Microsoft YaHei", sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: textGlow 3s ease-in-out infinite alternate;
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
</style>
