// GIF动画配置
const GIFS = {
  idle: '站立.gif',      // 默认待机
  wave: '挥手.gif',      // 点击反馈
  jump: '蹦跳.gif',      // 吉祥结果
  squat: '蹲下.gif',     // 凶卦结果
  sleep: '睡觉.gif',     // 长时间无操作
  run: '奔跑.gif'        // 鼠标快速移动
};

let currentGif = 'idle';
let idleTimeout = null;
let sleepTimeout = null;
let lastMousePos = { x: 0, y: 0 };
let lastMouseTime = Date.now();
let isShowingResult = false;
let isFirstClick = !localStorage.getItem('divination_clicked'); // 检测是否首次点击
let isCleanedUp = false; // 标记扩展是否已清理

// 拖拽相关变量
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartPosX = 0;
let dragStartPosY = 0;
let hasDragged = false; // 标记是否发生了拖拽（用于区分点击和拖拽）

// 无操作进入睡眠的时间（毫秒）
const SLEEP_DELAY = 30000; // 30秒无操作进入睡眠

// 检查扩展上下文是否有效
function isExtensionContextValid() {
  try {
    chrome.runtime.getURL('');
    return true;
  } catch (e) {
    return false;
  }
}

// 安全获取资源URL
function safeGetURL(path) {
  try {
    return chrome.runtime.getURL(path);
  } catch (e) {
    console.log('[MiniCz] 扩展上下文已失效，请刷新页面');
    cleanup();
    return '';
  }
}

// 清理函数 - 扩展失效时调用
function cleanup() {
  if (isCleanedUp) return; // 防止重复清理
  isCleanedUp = true;
  
  clearTimeout(idleTimeout);
  clearTimeout(sleepTimeout);
  
  // 停止音频
  if (window.divinationAudio) {
    try { window.divinationAudio.pause(); } catch(e) {}
    window.divinationAudio = null;
  }
  
  const container = document.getElementById('divination-pet-container');
  if (container) container.remove();
  const popup = document.getElementById('divination-result');
  if (popup) popup.remove();
  
  console.log('[MiniCz] 扩展上下文已失效，已清理资源');
}

// 创建宠物元素
function createPetElement() {
  // 防止重复创建或已清理
  if (isCleanedUp || document.getElementById('divination-pet-container')) {
    return;
  }
  
  // 检查扩展上下文
  if (!isExtensionContextValid()) {
    cleanup();
    return;
  }
  
  // 宠物容器
  const container = document.createElement('div');
  container.id = 'divination-pet-container';
  
  // 恢复保存的位置，默认右下角
  const savedPos = localStorage.getItem('divination_pet_position');
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos);
      container.style.left = pos.x + 'px';
      container.style.top = pos.y + 'px';
    } catch (e) {
      container.style.right = '20px';
      container.style.bottom = '20px';
    }
  } else {
    container.style.right = '20px';
    container.style.bottom = '20px';
  }
  
  // 宠物图片
  const pet = document.createElement('div');
  pet.id = 'divination-pet';
  pet.title = '点击占卜 | 拖拽移动';
  
  const petImg = document.createElement('img');
  const initialUrl = safeGetURL('assets/' + GIFS.idle);
  if (!initialUrl) return; // 扩展已失效
  petImg.src = initialUrl;
  petImg.id = 'divination-pet-img';
  petImg.draggable = false;
  pet.appendChild(petImg);
  
  container.appendChild(pet);
  document.body.appendChild(container);
  
  // 预加载所有GIF（检查扩展状态）
  Object.values(GIFS).forEach(gif => {
    if (isCleanedUp) return;
    const url = safeGetURL('assets/' + gif);
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
  
  // 预加载所有语音（如果VOICE_PACKS存在）
  if (typeof VOICE_PACKS !== 'undefined' && !isCleanedUp) {
    Object.values(VOICE_PACKS).flat().forEach(audio => {
      if (isCleanedUp) return;
      const url = safeGetURL('assets/' + audio);
      if (url) {
        const a = new Audio();
        a.src = url;
      }
    });
  }
  
  // 开始待机状态
  setGif('idle');
  resetSleepTimer();
  
  // 绑定点击事件（需要区分拖拽和点击）
  container.addEventListener('click', (e) => {
    if (hasDragged) {
      hasDragged = false;
      return; // 如果是拖拽则不触发点击
    }
    performDivination();
  });
  
  // 拖拽功能 - mousedown
  container.addEventListener('mousedown', (e) => {
    if (isCleanedUp || e.button !== 0) return; // 只响应左键
    
    isDragging = true;
    hasDragged = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = container.getBoundingClientRect();
    dragStartPosX = rect.left;
    dragStartPosY = rect.top;
    
    container.classList.add('dragging');
    
    // 清除 right/bottom 定位，改用 left/top
    container.style.right = 'auto';
    container.style.bottom = 'auto';
    container.style.left = dragStartPosX + 'px';
    container.style.top = dragStartPosY + 'px';
    
    e.preventDefault();
  });
  
  // 拖拽功能 - mousemove (全局)
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || isCleanedUp) return;
    
    const cont = document.getElementById('divination-pet-container');
    if (!cont) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    // 超过5px才算拖拽
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDragged = true;
    }
    
    let newX = dragStartPosX + deltaX;
    let newY = dragStartPosY + deltaY;
    
    // 限制在窗口范围内（使用固定尺寸100x100）
    const petSize = 100;
    newX = Math.max(0, Math.min(window.innerWidth - petSize, newX));
    newY = Math.max(0, Math.min(window.innerHeight - petSize, newY));
    
    cont.style.left = newX + 'px';
    cont.style.top = newY + 'px';
  });
  
  // 拖拽功能 - mouseup (全局)
  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    
    isDragging = false;
    
    const cont = document.getElementById('divination-pet-container');
    if (cont) {
      cont.classList.remove('dragging');
      
      // 保存位置
      if (hasDragged) {
        const rect = cont.getBoundingClientRect();
        localStorage.setItem('divination_pet_position', JSON.stringify({
          x: rect.left,
          y: rect.top
        }));
      }
    }
  });
  
  // 3D视差效果 - 鼠标跟随 + 快速移动检测
  document.addEventListener('mousemove', (e) => {
    try {
      // 拖拽时跳过3D效果
      if (isDragging) return;
      
      // 检查扩展上下文是否有效
      if (!isExtensionContextValid()) {
        cleanup();
        return;
      }
      
      const petElement = document.getElementById('divination-pet');
      if (!petElement) return;
      
      const rect = petElement.getBoundingClientRect();
      const petCenterX = rect.left + rect.width / 2;
      const petCenterY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - petCenterX) / 50;
      const deltaY = (e.clientY - petCenterY) / 50;
      
      // 限制旋转角度
      const rotateY = Math.max(-15, Math.min(15, deltaX));
      const rotateX = Math.max(-15, Math.min(15, -deltaY));
      
      petElement.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      // 检测鼠标快速移动
      const now = Date.now();
      const timeDiff = now - lastMouseTime;
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastMousePos.x, 2) + 
        Math.pow(e.clientY - lastMousePos.y, 2)
      );
      const speed = distance / Math.max(timeDiff, 1);
      
      // 如果鼠标移动速度足够快且不在显示结果中，显示奔跑动画
      if (speed > 2 && !isShowingResult && currentGif !== 'run') {
        setGif('run');
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          if (isCleanedUp) return;
          if (!isShowingResult) setGif('idle');
        }, 500);
      }
      
      lastMousePos = { x: e.clientX, y: e.clientY };
      lastMouseTime = now;
      
      // 重置睡眠计时器
      resetSleepTimer();
    } catch (e) {
      // 扩展上下文失效，清理资源
      cleanup();
    }
  });
  
  // 鼠标离开时恢复
  pet.addEventListener('mouseleave', () => {
    if (isCleanedUp) return;
    pet.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
  });
}

// 设置当前GIF动画
function setGif(type) {
  if (isCleanedUp) return; // 已清理则不执行
  
  try {
    if (!isExtensionContextValid()) {
      cleanup();
      return;
    }
    
    const petImg = document.getElementById('divination-pet-img');
    if (!petImg || !GIFS[type]) return;
    
    currentGif = type;
    // 添加时间戳强制刷新GIF从头播放
    const url = safeGetURL('assets/' + GIFS[type]);
    if (url) petImg.src = url + '?t=' + Date.now();
  } catch (e) {
    cleanup();
  }
}

// 重置睡眠计时器
function resetSleepTimer() {
  if (isCleanedUp) return;
  
  clearTimeout(sleepTimeout);
  
  // 如果当前是睡眠状态，唤醒到待机
  if (currentGif === 'sleep' && !isShowingResult) {
    setGif('idle');
  }
  
  sleepTimeout = setTimeout(() => {
    if (isCleanedUp) return;
    if (!isShowingResult && currentGif === 'idle') {
      setGif('sleep');
    }
  }, SLEEP_DELAY);
}

// 执行占卜
function performDivination() {
  // 防止连续点击或已清理
  if (isShowingResult || isCleanedUp) return;
  
  try {
    if (!isExtensionContextValid()) {
      cleanup();
      return;
    }
    
    const result = divineByTime();
    
    // 首次点击固定播放"还在顿.mp3"
    let audioFile;
    if (isFirstClick) {
      audioFile = '还在顿.mp3';
      isFirstClick = false;
      localStorage.setItem('divination_clicked', 'true');
    } else {
      audioFile = getAudioFile(result.hexagram.level);
    }
    
    console.log('[MiniCz] 卦象:', result.hexagram.name, '| 吉凶:', result.hexagram.level, '| 语音:', audioFile);
    
    isShowingResult = true;
    resetSleepTimer();
    
    // 播放挥手动画（点击反馈）
    setGif('wave');
    
    // 显示卦象结果弹窗
    showResultPopup(result, audioFile);
    
    // 1.5秒后根据结果显示对应动画并播放语音
    setTimeout(() => {
      if (isCleanedUp) return;
      
      // 根据吉凶显示不同动画
      if (result.hexagram.level === '吉') {
        setGif('jump');  // 吉祥 - 蹦跳
      } else if (result.hexagram.level === '凶') {
        setGif('squat'); // 凶卦 - 蹲下
      } else {
        setGif('idle');  // 中等 - 待机
      }
      
      // 播放语音
      playAudio(audioFile);
      
      // 5秒后恢复待机（给语音播放更多时间）
      setTimeout(() => {
        if (isCleanedUp) return;
        isShowingResult = false;
        setGif('idle');
        hideResultPopup();
        resetSleepTimer();
      }, 5000);
    }, 1500);
  } catch (e) {
    cleanup();
  }
}

// 显示卦象结果弹窗
function showResultPopup(result, audioFile) {
  if (isCleanedUp) return;
  
  // 移除旧弹窗
  hideResultPopup();
  
  const popup = document.createElement('div');
  popup.id = 'divination-result';
  popup.className = 'show';
  
  // 获取宠物位置，让弹窗跟随宠物
  const container = document.getElementById('divination-pet-container');
  if (container) {
    const rect = container.getBoundingClientRect();
    const popupWidth = 280;
    const popupHeight = 280; // 估计高度
    
    // 计算弹窗位置（在宠物上方）
    let popupX = rect.left + (rect.width / 2) - (popupWidth / 2);
    let popupY = rect.top - popupHeight - 10;
    
    // 边界检查
    if (popupX < 10) popupX = 10;
    if (popupX + popupWidth > window.innerWidth - 10) popupX = window.innerWidth - popupWidth - 10;
    if (popupY < 10) {
      // 如果上方空间不够，放到宠物下方
      popupY = rect.bottom + 10;
    }
    
    popup.style.left = popupX + 'px';
    popup.style.top = popupY + 'px';
  }
  
  const levelColor = getLevelColor(result.hexagram.level);
  
  popup.innerHTML = `
    <button id="divination-close">&times;</button>
    <div class="hexagram-symbol">${result.hexagram.symbol}</div>
    <div class="hexagram-name">${result.hexagram.name}卦</div>
    <div class="level-container">
      <span class="hexagram-level" style="background: ${levelColor}; color: #fff;">${result.hexagram.level}</span>
    </div>
    <div class="hexagram-desc">${result.hexagram.desc}</div>
    <div class="hexagram-time">${result.time}</div>
  `;
  
  document.body.appendChild(popup);
  
  // 关闭按钮
  document.getElementById('divination-close').addEventListener('click', () => {
    if (isCleanedUp) return;
    hideResultPopup();
    isShowingResult = false;
    setGif('idle');
  });
}

// 隐藏结果弹窗
function hideResultPopup() {
  try {
    const popup = document.getElementById('divination-result');
    if (popup) {
      popup.remove();
    }
  } catch (e) {
    // 忽略DOM操作错误
  }
}

// 播放语音
function playAudio(audioFile) {
  if (isCleanedUp) return;
  
  try {
    if (!isExtensionContextValid()) {
      cleanup();
      return;
    }
    
    const audioUrl = safeGetURL('assets/' + audioFile);
    if (!audioUrl) return;
    
    // 停止之前的音频
    if (window.divinationAudio) {
      try { window.divinationAudio.pause(); } catch(e) {}
      window.divinationAudio = null;
    }
    
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    audio.play().catch(err => {
      console.log('音频播放失败（可能需要用户交互）:', err);
    });
    
    window.divinationAudio = audio;
  } catch (e) {
    cleanup();
  }
}

// 页面加载完成后创建宠物
console.log('[MiniCz] 脚本已加载');

function init() {
  // 初始化前检查扩展上下文
  if (!isExtensionContextValid()) {
    console.log('[MiniCz] 扩展上下文无效，跳过初始化');
    return;
  }
  
  console.log('[MiniCz] 开始创建宠物...');
  try {
    createPetElement();
    if (!isCleanedUp) {
      console.log('[MiniCz] 宠物创建成功！');
    }
  } catch (e) {
    console.error('[MiniCz] 创建失败:', e);
    cleanup();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
