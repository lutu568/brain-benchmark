/**
 * 数字记忆测试
 * 玩家需要在短时间内记住并重复显示的数字
 */

// 游戏状态
const gameState = {
    level: 1,                // 当前关卡
    numberToRemember: null,  // 当前需要记忆的数字
    gameActive: false,       // 游戏是否进行中
    timerDuration: 7000,     // 数字显示时间（毫秒）
    maxTime: 7000,           // 最大计时器时间
    timerTimeout: null,      // 计时器 timeout ID
    animationTimeout: null,  // 动画 timeout ID
    history: []              // 历史记录
};

// DOM 元素
const elements = {
    startScreen: document.getElementById('start-screen'),
    numberScreen: document.getElementById('number-display-screen'),
    inputScreen: document.getElementById('number-input-screen'),
    resultScreen: document.getElementById('result-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    
    startBtn: document.getElementById('start-btn'),
    submitBtn: document.getElementById('submit-btn'),
    nextLevelBtn: document.getElementById('continue-btn'),
    restartBtn: document.getElementById('restart-btn'),
    backHomeBtn: document.getElementById('share-btn'),
    
    levelDisplay: document.getElementById('current-level'),
    numberToRemember: document.getElementById('number-to-remember'),
    numberInput: document.getElementById('number-input'),
    correctNumber: document.getElementById('correct-number'),
    
    successMessage: document.getElementById('success-message'),
    failureMessage: document.getElementById('failure-message'),
    
    finalLevel: document.getElementById('final-level'),
    percentileResult: document.getElementById('percentile-result'),
    
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    historyList: document.getElementById('history-list')
};

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    loadHistory();
    addEventListeners();
});

// 初始化游戏
function initGame() {
    // 设置初始屏幕
    showScreen(elements.startScreen);
    updateLevelDisplay();
}

// 添加事件监听器
function addEventListeners() {
    // 开始游戏按钮
    elements.startBtn.addEventListener('click', startGame);
    
    // 提交答案按钮
    elements.submitBtn.addEventListener('click', submitAnswer);
    
    // 回车提交答案
    elements.numberInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    
    // 下一关按钮
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    
    // 重新开始按钮
    elements.restartBtn.addEventListener('click', restartGame);
    
    // 分享按钮作为返回主页按钮
    elements.backHomeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// 开始游戏
function startGame() {
    gameState.level = 1;
    gameState.gameActive = true;
    
    updateLevelDisplay();
    startNewLevel();
}

// 开始新关卡
function startNewLevel() {
    // 生成要记忆的数字
    gameState.numberToRemember = generateNumberForLevel(gameState.level);
    
    // 显示数字屏幕
    showScreen(elements.numberScreen);
    
    // 显示数字
    elements.numberToRemember.textContent = gameState.numberToRemember;
    
    // 创建新的计时器元素
    resetTimer();
    
    // 设置计时器，到时后自动切换到输入屏幕
    gameState.timerTimeout = setTimeout(() => {
        showInputScreen();
    }, gameState.timerDuration);
}

// 显示输入屏幕
function showInputScreen() {
    // 清除计时器
    clearTimeout(gameState.timerTimeout);
    
    // 显示输入屏幕
    showScreen(elements.inputScreen);
    
    // 清空输入框并聚焦
    elements.numberInput.value = '';
    elements.numberInput.focus();
}

// 提交答案
function submitAnswer() {
    const userAnswer = elements.numberInput.value.trim();
    
    // 验证答案
    if (!userAnswer) {
        showToast('请输入您记住的数字');
        return;
    }
    
    // 检查答案是否正确
    const isCorrect = (userAnswer === gameState.numberToRemember.toString());
    
    // 显示结果
    showResultScreen(isCorrect);
}

// 显示结果屏幕
function showResultScreen(isCorrect) {
    showScreen(elements.resultScreen);
    
    // 隐藏所有结果消息
    elements.successMessage.classList.remove('active');
    elements.failureMessage.classList.remove('active');
    
    if (isCorrect) {
        // 显示成功消息
        elements.successMessage.classList.add('active');
    } else {
        // 显示失败消息
        elements.failureMessage.classList.add('active');
        elements.correctNumber.textContent = gameState.numberToRemember;
        
        // 记录结果
        saveResult();
        
        // 2秒后显示游戏结束屏幕
        setTimeout(() => {
            showGameOverScreen();
        }, 2000);
    }
}

// 下一关
function nextLevel() {
    // 增加关卡等级
    gameState.level++;
    updateLevelDisplay();
    
    // 开始新关卡
    startNewLevel();
}

// 游戏结束屏幕
function showGameOverScreen() {
    showScreen(elements.gameOverScreen);
    
    // 更新最终级别
    elements.finalLevel.textContent = gameState.level;
    
    // 计算并显示百分位
    calculatePercentile(gameState.level);
    
    // 游戏结束
    gameState.gameActive = false;
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameState.level = 1;
    gameState.gameActive = true;
    
    updateLevelDisplay();
    
    // 开始新一轮游戏
    startNewLevel();
}

// 显示指定屏幕
function showScreen(screenToShow) {
    // 隐藏所有屏幕
    const allScreens = document.querySelectorAll('.game-screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 显示指定屏幕
    screenToShow.classList.add('active');
}

// 更新级别显示
function updateLevelDisplay() {
    elements.levelDisplay.textContent = gameState.level;
}

// 根据级别生成数字
function generateNumberForLevel(level) {
    // 基础数字位数
    const baseDigits = level + 2;
    
    // 生成随机数字
    let number = '';
    for (let i = 0; i < baseDigits; i++) {
        // 第一位不能为0
        if (i === 0) {
            number += Math.floor(Math.random() * 9) + 1;
        } else {
            number += Math.floor(Math.random() * 10);
        }
    }
    
    return number;
}

// 重置计时器
function resetTimer() {
    const timerBar = document.getElementById('timer-bar');
    
    // 移除旧的进度条
    const oldProgress = document.getElementById('timer-progress');
    if (oldProgress) {
        oldProgress.remove();
    }
    
    // 创建新的进度条
    const newProgress = document.createElement('div');
    newProgress.id = 'timer-progress';
    timerBar.appendChild(newProgress);
    
    // 强制重绘以触发动画
    void timerBar.offsetWidth;
}

// 保存结果到本地存储
function saveResult() {
    const result = {
        level: gameState.level,
        date: new Date().toISOString(),
        number: gameState.numberToRemember
    };
    
    // 读取现有历史记录
    let history = [];
    try {
        const savedHistory = localStorage.getItem('numberMemoryHistory');
        if (savedHistory) {
            history = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
    
    // 添加新结果
    history.unshift(result);
    
    // 限制历史记录数量
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    // 保存到本地存储
    try {
        localStorage.setItem('numberMemoryHistory', JSON.stringify(history));
        gameState.history = history;
        updateHistoryDisplay();
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

// 加载历史记录
function loadHistory() {
    try {
        const savedHistory = localStorage.getItem('numberMemoryHistory');
        if (savedHistory) {
            gameState.history = JSON.parse(savedHistory);
        }
        updateHistoryDisplay();
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// 更新历史记录显示
function updateHistoryDisplay() {
    // 清空列表
    elements.historyList.innerHTML = '';
    
    if (gameState.history && gameState.history.length > 0) {
        // 添加历史记录项
        gameState.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const dateFormatted = new Date(item.date).toLocaleDateString();
            
            historyItem.innerHTML = `
                <span class="level">水平 ${item.level}</span>
                <span class="date">${dateFormatted}</span>
            `;
            
            elements.historyList.appendChild(historyItem);
        });
    } else {
        // 没有历史记录
        const emptyItem = document.createElement('div');
        emptyItem.className = 'history-item empty';
        emptyItem.textContent = '没有历史记录';
        elements.historyList.appendChild(emptyItem);
    }
}

// 计算百分位
function calculatePercentile(level) {
    // 人口分布数据（不同级别与百分位的大致对应）
    const percentiles = [
        { level: 1, percentile: 10 },
        { level: 2, percentile: 20 },
        { level: 3, percentile: 30 },
        { level: 4, percentile: 40 },
        { level: 5, percentile: 50 },
        { level: 6, percentile: 60 },
        { level: 7, percentile: 70 },
        { level: 8, percentile: 80 },
        { level: 9, percentile: 85 },
        { level: 10, percentile: 90 },
        { level: 11, percentile: 93 },
        { level: 12, percentile: 95 },
        { level: 13, percentile: 97 },
        { level: 14, percentile: 98 },
        { level: 15, percentile: 99 },
    ];
    
    // 找到对应百分位
    let userPercentile = 99.9; // 默认极高
    
    for (let i = percentiles.length - 1; i >= 0; i--) {
        if (level >= percentiles[i].level) {
            userPercentile = percentiles[i].percentile;
            
            // 如果超过15级，保持99.9
            if (level > percentiles[percentiles.length - 1].level) {
                userPercentile = 99.9;
            }
            
            break;
        }
    }
    
    // 更新百分位显示
    if (elements.percentileResult) {
        document.querySelector('.percentile-result p').innerHTML = 
            `超过了 <span class="highlight">${userPercentile}%</span> 的用户`;
    }
}

// 显示Toast消息
function showToast(message) {
    if (elements.toast) {
        if (elements.toastMessage) {
            elements.toastMessage.textContent = message;
        } else {
            elements.toast.textContent = message;
        }
        
        elements.toast.classList.remove('hidden');
        elements.toast.classList.add('visible');
        
        // 3秒后隐藏
        setTimeout(() => {
            elements.toast.classList.remove('visible');
            elements.toast.classList.add('hidden');
        }, 3000);
    }
} 