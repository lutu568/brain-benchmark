/**
 * 数字记忆测试
 * 玩家需要在短时间内记住并重复显示的数字
 */

// 数字记忆测试 - 修复版

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('数字记忆测试页面加载完成');
    
    // 确保页面内容可见（不依赖loaded类）
    document.body.style.opacity = "1";
    document.body.style.transform = "translateY(0)";
    
    // 添加页面加载动画
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
    
    // 检查样式表是否加载
    const styleSheets = Array.from(document.styleSheets);
    const styleSheetsLoaded = styleSheets.some(sheet => 
        sheet.href && (sheet.href.includes('styles.css') || sheet.href.includes('number-memory.css'))
    );
    
    if (!styleSheetsLoaded) {
        console.warn('警告: 外部样式表可能未加载');
        // 如果样式表未加载，添加内联样式保证基本功能
        const emergencyStyles = document.createElement('style');
        emergencyStyles.textContent = `
            body { opacity: 1 !important; transform: none !important; }
            .game-screen.active { display: block !important; }
            .btn { display: inline-block; padding: 10px; background: #2962ff; color: white; }
        `;
        document.head.appendChild(emergencyStyles);
    }
    
    // 显示调试面板
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
        debugPanel.style.display = 'block';
        debugPanel.textContent = '调试模式 - 页面已加载';
    }
    
    // 游戏状态
    const gameState = {
        level: 1,                // 当前关卡
        numberToRemember: '',    // 当前需要记忆的数字
        timerDuration: 7000,     // 数字显示时间（毫秒）
        timerTimeout: null       // 计时器timeout
    };
    
    // 获取DOM元素
    const elements = {};
    
    try {
        // 游戏屏幕
        elements.startScreen = document.getElementById('start-screen');
        elements.numberScreen = document.getElementById('number-display-screen');
        elements.inputScreen = document.getElementById('number-input-screen');
        elements.resultScreen = document.getElementById('result-screen');
        elements.gameOverScreen = document.getElementById('game-over-screen');
        
        // 按钮
        elements.startBtn = document.getElementById('start-btn');
        elements.submitBtn = document.getElementById('submit-btn');
        elements.continueBtn = document.getElementById('continue-btn');
        elements.restartBtn = document.getElementById('restart-btn');
        elements.shareBtn = document.getElementById('share-btn');
        
        // 其他元素
        elements.levelDisplay = document.getElementById('current-level');
        elements.numberDisplay = document.getElementById('number-to-remember');
        elements.numberInput = document.getElementById('number-input');
        elements.correctAnswer = document.getElementById('correct-number');
        elements.finalLevel = document.getElementById('final-level');
        elements.finalDigits = document.getElementById('final-digits');
        elements.percentile = document.getElementById('percentile');
        
        // 消息容器
        elements.successMessage = document.getElementById('success-message');
        elements.failureMessage = document.getElementById('failure-message');
        
        // 调试信息
        updateDebug('所有DOM元素已找到');
    } catch (error) {
        console.error('DOM元素查找错误:', error);
        updateDebug('错误: DOM元素查找失败 - ' + error.message);
        return; // 停止执行
    }
    
    // 检查关键元素是否存在
    const requiredElements = [
        'startScreen', 'numberScreen', 'inputScreen', 'resultScreen', 
        'startBtn', 'submitBtn', 'continueBtn', 
        'numberDisplay', 'numberInput'
    ];
    
    let missingElements = [];
    for (const key of requiredElements) {
        if (!elements[key]) {
            missingElements.push(key);
        }
    }
    
    if (missingElements.length > 0) {
        const errorMsg = '缺少关键元素: ' + missingElements.join(', ');
        console.error(errorMsg);
        updateDebug('错误: ' + errorMsg);
        alert('页面加载错误，缺少必要元素');
        return; // 停止执行
    }
    
    // 添加事件监听器
    elements.startBtn.addEventListener('click', startGame);
    elements.submitBtn.addEventListener('click', checkAnswer);
    elements.continueBtn.addEventListener('click', nextLevel);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.shareBtn.addEventListener('click', shareResult);
    
    // 键盘事件 - 回车键提交
    elements.numberInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // 设置初始屏幕
    showScreen(elements.startScreen);
    updateLevelDisplay();
    updateDebug('初始化完成，等待开始游戏');
    
    // 开始游戏
    function startGame() {
        updateDebug('游戏开始');
        gameState.level = 1;
        updateLevelDisplay();
        showToast('开始挑战！');
        showNextNumber();
    }
    
    // 显示下一个数字
    function showNextNumber() {
        // 生成新数字 (数字长度 = 当前级别 + 2)
        const numberLength = gameState.level + 2;
        gameState.numberToRemember = generateNumber(numberLength);
        
        // 显示数字
        elements.numberDisplay.textContent = gameState.numberToRemember;
        showScreen(elements.numberScreen);
        
        updateDebug('显示数字: ' + gameState.numberToRemember);
        
        // 重置计时器
        resetTimer();
        
        // 设置计时器
        gameState.timerTimeout = setTimeout(function() {
            showInputScreen();
        }, gameState.timerDuration);
    }
    
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
    
    // 显示输入屏幕
    function showInputScreen() {
        clearTimeout(gameState.timerTimeout);
        showScreen(elements.inputScreen);
        elements.numberInput.value = '';
        elements.numberInput.focus();
        updateDebug('显示输入屏幕');
    }
    
    // 检查答案
    function checkAnswer() {
        const userAnswer = elements.numberInput.value.trim();
        
        if (!userAnswer) {
            showToast('请输入数字');
            return;
        }
        
        updateDebug('检查答案: 用户输入=' + userAnswer + ', 正确答案=' + gameState.numberToRemember);
        
        const isCorrect = (userAnswer === gameState.numberToRemember);
        
        if (isCorrect) {
            // 答案正确
            elements.successMessage.classList.add('active');
            elements.failureMessage.classList.remove('active');
            updateDebug('答案正确');
            showToast('回答正确！');
        } else {
            // 答案错误
            elements.successMessage.classList.remove('active');
            elements.failureMessage.classList.add('active');
            elements.correctAnswer.textContent = gameState.numberToRemember;
            updateDebug('答案错误');
            showToast('回答错误！');
            
            // 2秒后显示游戏结束
            setTimeout(function() {
                showGameOver();
            }, 2000);
        }
        
        showScreen(elements.resultScreen);
    }
    
    // 下一级别
    function nextLevel() {
        gameState.level++;
        updateLevelDisplay();
        updateDebug('进入下一级: ' + gameState.level);
        showNextNumber();
    }
    
    // 游戏结束
    function showGameOver() {
        showScreen(elements.gameOverScreen);
        
        elements.finalLevel.textContent = gameState.level;
        
        // 计算最终记住的位数
        const digitsCount = gameState.level + 2 - 1; // 最后一关答错了，所以减1
        if (elements.finalDigits) {
            elements.finalDigits.textContent = digitsCount;
        }
        
        // 计算百分位
        const userPercentile = calculatePercentile(gameState.level);
        if (elements.percentile) {
            elements.percentile.textContent = userPercentile + '%';
        }
        
        updateDebug('游戏结束: 级别=' + gameState.level + ', 百分位=' + userPercentile);
        showToast('测试结束！你的最终成绩: ' + digitsCount + ' 位数字');
    }
    
    // 重新开始游戏
    function restartGame() {
        gameState.level = 1;
        updateLevelDisplay();
        updateDebug('重新开始游戏');
        showToast('重新开始挑战！');
        showNextNumber();
    }
    
    // 更新级别显示
    function updateLevelDisplay() {
        elements.levelDisplay.textContent = gameState.level;
    }
    
    // 显示指定屏幕
    function showScreen(screenToShow) {
        // 隐藏所有屏幕
        const allScreens = [
            elements.startScreen,
            elements.numberScreen,
            elements.inputScreen,
            elements.resultScreen,
            elements.gameOverScreen
        ];
        
        // 确保屏幕元素存在再操作
        allScreens.forEach(function(screen) {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        // 显示所选屏幕
        if (screenToShow) {
            screenToShow.classList.add('active');
            updateDebug('显示屏幕: ' + screenToShow.id);
        }
    }
    
    // 重置计时器
    function resetTimer() {
        const timerBar = document.getElementById('timer-bar');
        const timerProgress = document.getElementById('timer-progress');
        
        if (!timerBar) {
            console.error('找不到计时器元素');
            return;
        }
        
        // 移除旧的进度条
        if (timerProgress) {
            timerProgress.remove();
        }
        
        // 添加新的进度条并强制重绘
        setTimeout(() => {
            const newProgress = document.createElement('div');
            newProgress.id = 'timer-progress';
            timerBar.appendChild(newProgress);
            
            // 强制重绘触发CSS动画
            void timerBar.offsetWidth;
        }, 10);
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
    
    // 更新调试信息
    function updateDebug(message) {
        console.log('调试:', message);
        if (debugPanel) {
            debugPanel.textContent = message;
        }
    }
    
    // Toast 通知功能
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    let toastTimeout = null;
    
    function showToast(message) {
        console.log('显示提示:', message); // 输出到控制台作为备份
        
        // 检查toast元素是否存在
        if (!toast || !toastMessage) {
            console.warn('Toast元素不存在，创建一个临时的');
            // 如果toast元素不存在，创建一个临时的
            const tempToast = document.createElement('div');
            tempToast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:4px;z-index:1000;';
            tempToast.textContent = message;
            document.body.appendChild(tempToast);
            
            setTimeout(() => {
                tempToast.remove();
            }, 3000);
            return;
        }
        
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }
        
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('visible');
        
        // 确保toast可见，即使CSS没有加载
        toast.style.display = 'block';
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
            toast.style.opacity = '0';
            
            setTimeout(() => {
                toast.classList.add('hidden');
                toast.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    // 显示欢迎消息
    showToast('欢迎参加数字记忆测试！');
    
    // 添加分享结果功能
    function shareResult() {
        // 获取最终结果
        const level = elements.finalLevel.textContent;
        const digits = elements.finalDigits.textContent;
        const percentile = elements.percentile.textContent;
        
        // 创建分享文本
        const shareText = `我在BrainBenchmark数字记忆测试中记住了${digits}位数字，超过了${percentile}的用户！来挑战我吧！`;
        
        // 复制到剪贴板
        navigator.clipboard.writeText(shareText)
            .then(() => {
                showToast('结果已复制到剪贴板！');
            })
            .catch(err => {
                console.error('无法复制结果: ', err);
                showToast('复制失败，请手动分享。');
            });
    }
}); 