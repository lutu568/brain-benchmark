// 反应时间测试的逻辑代码

// 获取DOM元素
const reactionBox = document.getElementById('reaction-box');
const reactionContent = document.getElementById('reaction-content');
const instruction = document.querySelector('.instruction');
const currentTimeDisplay = document.getElementById('current-time');
const attemptDisplays = [
    document.getElementById('attempt-1'),
    document.getElementById('attempt-2'),
    document.getElementById('attempt-3'),
    document.getElementById('attempt-4'),
    document.getElementById('attempt-5')
];
const avgTimeDisplay = document.getElementById('avg-time');
const percentileDisplay = document.getElementById('percentile');
const ratingText = document.getElementById('rating-text');
const restartBtn = document.getElementById('restart-btn');
const shareSection = document.getElementById('share-section');
const copyResultBtn = document.getElementById('copy-result');
const downloadCertBtn = document.getElementById('download-certificate');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// 测试状态变量
let state = 'initial'; // 'initial', 'waiting', 'ready', 'testing', 'finished', 'completed'
let startTime, endTime;
let currentAttempt = 0;
let attemptResults = [];
let waitTimeout = null;
let toastTimeout = null;

// 参考数据 - 反应时间百分位 (ms)
const percentileData = {
    1: 400,  // 1% 的人比这更慢
    5: 350,
    10: 330,
    20: 310,
    30: 290,
    40: 275,
    50: 265,  // 中位数
    60: 255,
    70: 240,
    80: 225,
    90: 210,
    95: 195,
    99: 170   // 只有1%的人比这更快
};

// 评价系统
const ratingSystem = {
    0: { text: "反应迟钝", class: "rating-poor" },
    20: { text: "较慢", class: "rating-below-average" },
    40: { text: "一般", class: "rating-average" },
    60: { text: "较快", class: "rating-good" },
    80: { text: "非常快", class: "rating-excellent" },
    95: { text: "超级快！", class: "rating-exceptional" }
};

// 初始化测试
function initTest() {
    resetTest();
    
    // 添加事件监听器
    reactionBox.addEventListener('click', handleClick);
    reactionBox.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
        }
    });
    
    restartBtn.addEventListener('click', function() {
        resetTest();
        startTest();
    });
    
    copyResultBtn.addEventListener('click', copyResults);
    downloadCertBtn.addEventListener('click', downloadCertificate);
    
    // 初始化页面状态
    reactionBox.classList.add('waiting');
    reactionContent.textContent = '点击开始';
    instruction.textContent = '点击此区域开始测试';
    state = 'initial';
    
    // 添加页面加载动画
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
}

// 重置测试
function resetTest() {
    // 清除所有定时器
    if (waitTimeout) {
        clearTimeout(waitTimeout);
        waitTimeout = null;
    }
    
    // 重置状态
    reactionBox.className = 'waiting';
    currentAttempt = 0;
    attemptResults = [];
    state = 'initial';
    
    // 重置显示
    reactionContent.textContent = '点击开始';
    instruction.textContent = '点击此区域开始测试';
    currentTimeDisplay.textContent = '-';
    
    for (let i = 0; i < attemptDisplays.length; i++) {
        attemptDisplays[i].textContent = '-';
        attemptDisplays[i].parentElement.classList.remove('active', 'best', 'worst');
    }
    
    avgTimeDisplay.textContent = '-';
    percentileDisplay.textContent = '-';
    ratingText.textContent = '完成测试后显示';
    ratingText.className = '';
    
    // 隐藏按钮和分享区域
    restartBtn.classList.add('hidden');
    shareSection.classList.add('hidden');
}

// 处理点击事件
function handleClick() {
    switch (state) {
        case 'initial':
            // 开始测试
            startTest();
            break;
        
        case 'waiting':
            // 如果在等待期间点击，显示过早点击警告
            showEarlyClick();
            break;
        
        case 'ready':
            // 记录反应时间
            endTime = performance.now();
            const reactionTime = Math.round(endTime - startTime);
            recordResult(reactionTime);
            break;
        
        case 'finished':
            // 继续下一次测试
            continueTest();
            break;
            
        case 'completed':
            // 重置状态，重新开始
            resetTest();
            startTest();
            break;
    }
}

// 开始测试
function startTest() {
    state = 'waiting';
    reactionBox.classList.remove('waiting');
    reactionBox.classList.add('ready');
    reactionContent.textContent = '等待绿色...';
    instruction.textContent = '当屏幕变绿时，请立即点击';
    
    // 随机2-5秒后变为绿色
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    waitTimeout = setTimeout(() => {
        if (state === 'waiting') {
            state = 'ready';
            reactionBox.classList.remove('ready');
            reactionBox.classList.add('go');
            reactionContent.textContent = '点击!';
            instruction.textContent = '现在!';
            startTime = performance.now(); // 使用performance.now()获得更精确的时间
        }
    }, randomDelay);
}

// 显示过早点击警告
function showEarlyClick() {
    clearTimeout(waitTimeout);
    state = 'waiting';
    reactionBox.classList.remove('ready');
    reactionBox.classList.add('early');
    reactionContent.textContent = '太早了!';
    instruction.textContent = '请等待绿色出现再点击';
    
    // 显示提示消息
    showToast('点击太早了，请等待屏幕变绿再点击');
    
    // 1.5秒后重新开始
    setTimeout(() => {
        if (state === 'waiting') {
            startTest();
        }
    }, 1500);
}

// 记录结果
function recordResult(reactionTime) {
    state = 'finished';
    reactionBox.classList.remove('go');
    reactionBox.classList.add('clicked');
    
    // 显示当前结果
    currentTimeDisplay.textContent = `${reactionTime} ms`;
    reactionContent.textContent = `${reactionTime} ms`;
    
    // 防止不合理的值（如果过快可能是作弊）
    if (reactionTime < 100) {
        showToast('反应时间过快，可能不准确。请认真测试。');
        reactionTime = 100;
    }
    
    // 记录这次尝试的结果
    attemptResults.push(reactionTime);
    attemptDisplays[currentAttempt].textContent = `${reactionTime} ms`;
    
    // 高亮当前尝试
    const attemptItem = attemptDisplays[currentAttempt].parentElement;
    attemptItem.classList.add('active');
    
    // 更新尝试计数
    currentAttempt++;
    
    // 如果完成了所有尝试
    if (currentAttempt >= 5) {
        finishTest();
    } else {
        // 1.5秒后准备下一次尝试
        setTimeout(() => {
            if (state === 'finished') {
                instruction.textContent = '点击继续下一次测试';
                reactionContent.textContent = '点击继续';
            }
        }, 1500);
    }
}

// 继续测试
function continueTest() {
    reactionBox.classList.remove('clicked');
    reactionBox.classList.add('waiting');
    startTest();
}

// 完成测试
function finishTest() {
    state = 'completed';
    
    // 分析结果
    const results = analyzeResults(attemptResults);
    
    // 更新尝试记录的样式（标记最好和最差的尝试）
    updateAttemptStyles(results.bestIndex, results.worstIndex);
    
    // 显示平均结果
    avgTimeDisplay.textContent = `${results.avg} ms`;
    
    // 计算并显示百分位
    const percentile = calculatePercentile(results.avg);
    percentileDisplay.textContent = `${percentile}%`;
    
    // 显示评价
    const rating = getRating(percentile);
    ratingText.textContent = rating.text;
    ratingText.className = rating.class;
    
    // 更新显示
    reactionContent.textContent = `平均: ${results.avg} ms`;
    instruction.textContent = `超过了 ${percentile}% 的用户`;
    
    // 显示重新开始按钮和分享区域
    restartBtn.classList.remove('hidden');
    shareSection.classList.remove('hidden');
    
    // 显示祝贺消息
    showToast('测试完成！你的平均反应时间为 ' + results.avg + ' ms');
}

// 分析结果
function analyzeResults(results) {
    const sum = results.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / results.length);
    
    // 找出最好和最差的尝试
    let bestTime = Infinity;
    let worstTime = -Infinity;
    let bestIndex = 0;
    let worstIndex = 0;
    
    for (let i = 0; i < results.length; i++) {
        if (results[i] < bestTime) {
            bestTime = results[i];
            bestIndex = i;
        }
        if (results[i] > worstTime) {
            worstTime = results[i];
            worstIndex = i;
        }
    }
    
    return {
        avg,
        bestTime,
        worstTime,
        bestIndex,
        worstIndex
    };
}

// 更新尝试记录的样式
function updateAttemptStyles(bestIndex, worstIndex) {
    // 移除之前的所有样式
    for (let i = 0; i < attemptDisplays.length; i++) {
        const attemptItem = attemptDisplays[i].parentElement;
        attemptItem.classList.remove('active');
    }
    
    // 添加最好和最差的样式
    attemptDisplays[bestIndex].parentElement.classList.add('best');
    attemptDisplays[worstIndex].parentElement.classList.add('worst');
}

// 计算百分位
function calculatePercentile(time) {
    // 找到第一个大于等于用户时间的百分位
    const keys = Object.keys(percentileData).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < keys.length; i++) {
        if (time >= percentileData[keys[i]]) {
            if (i === 0) return 0;
            
            // 线性插值计算更精确的百分位
            const lowerPercentile = keys[i-1];
            const upperPercentile = keys[i];
            const lowerTime = percentileData[lowerPercentile];
            const upperTime = percentileData[upperPercentile];
            
            // 反向映射（时间越短越好）
            const ratio = (lowerTime - time) / (lowerTime - upperTime);
            return Math.round(lowerPercentile + ratio * (upperPercentile - lowerPercentile));
        }
    }
    
    return 99; // 如果比所有参考值都好
}

// 获取评价
function getRating(percentile) {
    const ratingKeys = Object.keys(ratingSystem).map(Number).sort((a, b) => a - b);
    
    for (let i = ratingKeys.length - 1; i >= 0; i--) {
        if (percentile >= ratingKeys[i]) {
            return ratingSystem[ratingKeys[i]];
        }
    }
    
    return ratingSystem[0]; // 默认最低评价
}

// 复制结果功能
function copyResults() {
    const avg = avgTimeDisplay.textContent;
    const percentile = percentileDisplay.textContent;
    const rating = ratingText.textContent;
    
    const resultText = `我在BrainBenchmark脑力基准测试中的反应时间为${avg}，超过了${percentile}的用户！评价：${rating}`;
    
    // 使用剪贴板API复制
    navigator.clipboard.writeText(resultText)
        .then(() => {
            showToast('结果已复制到剪贴板！');
        })
        .catch(err => {
            console.error('无法复制结果: ', err);
            showToast('复制失败，请手动复制。');
        });
}

// 下载证书功能（简单实现）
function downloadCertificate() {
    // 在实际应用中，这里可以生成一个实际的证书
    showToast('证书功能即将推出！');
}

// 显示Toast消息
function showToast(message) {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// 添加键盘支持
document.addEventListener('keydown', function(e) {
    if (state === 'ready' && (e.key === ' ' || e.key === 'Enter')) {
        handleClick();
    }
});

// 确保应用全局错误处理
window.addEventListener('error', function(e) {
    console.error('应用错误：', e.message);
    showToast('出现错误，请刷新页面重试。');
});

// 添加页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden && state === 'waiting') {
        // 如果页面不可见且处于等待状态，重置测试
        clearTimeout(waitTimeout);
        resetTest();
        showToast('测试已重置，请重新开始。');
    }
});

// 初始化测试
document.addEventListener('DOMContentLoaded', initTest); 