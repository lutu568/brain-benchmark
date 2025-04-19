/**
 * 数字记忆测试
 * 玩家需要在短时间内记住并重复显示的数字
 */

// 数字记忆测试 - 简化版
document.addEventListener('DOMContentLoaded', function() {
    console.log('数字记忆测试加载完成');
    
    // 游戏状态
    const gameState = {
        level: 1,                // 当前关卡
        numberToRemember: '',    // 当前需要记忆的数字
        timerDuration: 7000,     // 数字显示时间（毫秒）
        timerTimeout: null       // 计时器timeout
    };
    
    // 获取DOM元素
    const startScreen = document.getElementById('start-screen');
    const numberDisplayScreen = document.getElementById('number-display-screen');
    const numberInputScreen = document.getElementById('number-input-screen');
    const resultScreen = document.getElementById('result-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    const continueBtn = document.getElementById('continue-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    const currentLevelDisplay = document.getElementById('current-level');
    const numberToRememberDisplay = document.getElementById('number-to-remember');
    const numberInput = document.getElementById('number-input');
    const correctNumberDisplay = document.getElementById('correct-number');
    const finalLevelDisplay = document.getElementById('final-level');
    const finalDigitsDisplay = document.getElementById('final-digits');
    const percentileDisplay = document.getElementById('percentile');
    
    // 调试信息 - 检查元素是否找到
    const elementsToCheck = {
        'start-screen': startScreen,
        'number-display-screen': numberDisplayScreen,
        'number-input-screen': numberInputScreen,
        'result-screen': resultScreen,
        'game-over-screen': gameOverScreen,
        'start-btn': startBtn,
        'submit-btn': submitBtn,
        'continue-btn': continueBtn,
        'restart-btn': restartBtn,
        'current-level': currentLevelDisplay,
        'number-to-remember': numberToRememberDisplay,
        'number-input': numberInput,
        'correct-number': correctNumberDisplay,
        'final-level': finalLevelDisplay
    };
    
    // 检查所有元素是否存在
    let allElementsFound = true;
    for (const [id, element] of Object.entries(elementsToCheck)) {
        if (!element) {
            console.error(`找不到元素: #${id}`);
            allElementsFound = false;
        }
    }
    
    if (!allElementsFound) {
        console.error('部分DOM元素未找到，游戏可能无法正常运行');
        alert('页面加载错误，请刷新页面重试');
        return;
    }
    
    console.log('所有必要元素已找到');
    
    // 添加事件监听器
    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    continueBtn.addEventListener('click', nextLevel);
    restartBtn.addEventListener('click', restartGame);
    
    // 键盘事件 - 回车键提交
    numberInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // 显示初始屏幕
    showScreen(startScreen);
    updateLevelDisplay();
    
    // 生成随机数字
    function generateNumber(length) {
        let number = '';
        // 第一位不为0
        number += Math.floor(Math.random() * 9) + 1;
        
        // 生成剩余位数
        for (let i = 1; i < length; i++) {
            number += Math.floor(Math.random() * 10);
        }
        
        return number;
    }
    
    // 开始游戏
    function startGame() {
        console.log('游戏开始');
        gameState.level = 1;
        updateLevelDisplay();
        showNextNumber();
    }
    
    // 显示下一个数字
    function showNextNumber() {
        // 生成新数字 (数字长度 = 当前级别 + 2)
        const numberLength = gameState.level + 2;
        gameState.numberToRemember = generateNumber(numberLength);
        
        // 显示数字
        numberToRememberDisplay.textContent = gameState.numberToRemember;
        showScreen(numberDisplayScreen);
        
        // 重置计时器
        resetTimer();
        
        // 设置计时器
        gameState.timerTimeout = setTimeout(function() {
            showInputScreen();
        }, gameState.timerDuration);
    }
    
    // 显示输入屏幕
    function showInputScreen() {
        clearTimeout(gameState.timerTimeout);
        showScreen(numberInputScreen);
        numberInput.value = '';
        numberInput.focus();
    }
    
    // 检查答案
    function checkAnswer() {
        const userAnswer = numberInput.value.trim();
        
        if (!userAnswer) {
            alert('请输入数字');
            return;
        }
        
        const isCorrect = (userAnswer === gameState.numberToRemember);
        
        if (isCorrect) {
            // 答案正确
            document.getElementById('success-message').classList.add('active');
            document.getElementById('failure-message').classList.remove('active');
        } else {
            // 答案错误
            document.getElementById('success-message').classList.remove('active');
            document.getElementById('failure-message').classList.add('active');
            correctNumberDisplay.textContent = gameState.numberToRemember;
            
            // 2秒后显示游戏结束
            setTimeout(function() {
                showGameOver();
            }, 2000);
        }
        
        showScreen(resultScreen);
    }
    
    // 下一级别
    function nextLevel() {
        gameState.level++;
        updateLevelDisplay();
        showNextNumber();
    }
    
    // 游戏结束
    function showGameOver() {
        showScreen(gameOverScreen);
        
        finalLevelDisplay.textContent = gameState.level;
        
        const digitsCount = gameState.level + 2;
        if (finalDigitsDisplay) {
            finalDigitsDisplay.textContent = digitsCount;
        }
        
        // 计算百分位
        const userPercentile = calculatePercentile(gameState.level);
        if (percentileDisplay) {
            percentileDisplay.textContent = userPercentile + '%';
        }
    }
    
    // 重新开始游戏
    function restartGame() {
        gameState.level = 1;
        updateLevelDisplay();
        showNextNumber();
    }
    
    // 更新级别显示
    function updateLevelDisplay() {
        currentLevelDisplay.textContent = gameState.level;
    }
    
    // 显示指定屏幕
    function showScreen(screenToShow) {
        // 隐藏所有屏幕
        const allScreens = document.querySelectorAll('.game-screen');
        allScreens.forEach(function(screen) {
            screen.classList.remove('active');
        });
        
        // 显示所选屏幕
        screenToShow.classList.add('active');
    }
    
    // 重置计时器
    function resetTimer() {
        const timerBar = document.getElementById('timer-bar');
        const timerProgress = document.getElementById('timer-progress');
        
        if (timerProgress) {
            timerProgress.remove();
        }
        
        if (timerBar) {
            const newProgress = document.createElement('div');
            newProgress.id = 'timer-progress';
            timerBar.appendChild(newProgress);
            
            // 强制重绘触发CSS动画
            void timerBar.offsetWidth;
        }
    }
    
    // 计算百分位
    function calculatePercentile(level) {
        // 简化的百分位计算
        if (level <= 5) return level * 10;
        if (level <= 8) return 50 + (level - 5) * 10;
        if (level <= 10) return 80 + (level - 8) * 5;
        if (level <= 15) return 90 + (level - 10) * 2;
        return 99;
    }
}); 