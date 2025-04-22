// Reaction Time Test Logic Code

// Get DOM elements
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

// Test state variables
let state = 'initial'; // 'initial', 'waiting', 'ready', 'testing', 'finished', 'completed'
let startTime, endTime;
let currentAttempt = 0;
let attemptResults = [];
let waitTimeout = null;
let toastTimeout = null;

// Reference data - Reaction time percentiles (ms)
const percentileData = {
    1: 400,  // 1% of people are slower than this
    5: 350,
    10: 330,
    20: 310,
    30: 290,
    40: 275,
    50: 265,  // Median
    60: 255,
    70: 240,
    80: 225,
    90: 210,
    95: 195,
    99: 170   // Only 1% of people are faster than this
};

// Rating system
const ratingSystem = {
    0: { text: "Slow", class: "rating-poor" },
    20: { text: "Below Average", class: "rating-below-average" },
    40: { text: "Average", class: "rating-average" },
    60: { text: "Good", class: "rating-good" },
    80: { text: "Excellent", class: "rating-excellent" },
    95: { text: "Exceptional!", class: "rating-exceptional" }
};

// Initialize test
function initTest() {
    resetTest();
    
    // Add event listeners
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
    
    // Initialize page state
    reactionBox.classList.add('waiting');
    reactionContent.textContent = 'Click to Start';
    instruction.textContent = 'Click this area to start the test';
    state = 'initial';
    
    // Add page loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
}

// Reset test
function resetTest() {
    // Clear all timers
    if (waitTimeout) {
        clearTimeout(waitTimeout);
        waitTimeout = null;
    }
    
    // Reset state
    reactionBox.className = 'waiting';
    currentAttempt = 0;
    attemptResults = [];
    state = 'initial';
    
    // Reset display
    reactionContent.textContent = 'Click to Start';
    instruction.textContent = 'Click this area to start the test';
    currentTimeDisplay.textContent = '-';
    
    for (let i = 0; i < attemptDisplays.length; i++) {
        attemptDisplays[i].textContent = '-';
        attemptDisplays[i].parentElement.classList.remove('active', 'best', 'worst');
    }
    
    avgTimeDisplay.textContent = '-';
    percentileDisplay.textContent = '-';
    ratingText.textContent = 'Displayed after test completion';
    ratingText.className = '';
    
    // Hide buttons and share area
    restartBtn.classList.add('hidden');
    shareSection.classList.add('hidden');
}

// Handle click event
function handleClick() {
    switch (state) {
        case 'initial':
            // Start test
            startTest();
            break;
        
        case 'waiting':
            // If clicked during waiting period, show early click warning
            showEarlyClick();
            break;
        
        case 'ready':
            // Record reaction time
            endTime = performance.now();
            const reactionTime = Math.round(endTime - startTime);
            recordResult(reactionTime);
            break;
        
        case 'finished':
            // Continue to next test
            continueTest();
            break;
            
        case 'completed':
            // Reset state, start again
            resetTest();
            startTest();
            break;
    }
}

// Start test
function startTest() {
    state = 'waiting';
    reactionBox.classList.remove('waiting');
    reactionBox.classList.add('ready');
    reactionContent.textContent = 'Wait for green...';
    instruction.textContent = 'Click as soon as the screen turns green';
    
    // Change to green after random 2-5 seconds
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    waitTimeout = setTimeout(() => {
        if (state === 'waiting') {
            state = 'ready';
            reactionBox.classList.remove('ready');
            reactionBox.classList.add('go');
            reactionContent.textContent = 'Click!';
            instruction.textContent = 'Now!';
            startTime = performance.now(); // Use performance.now() for more accurate time
        }
    }, randomDelay);
}

// Show early click warning
function showEarlyClick() {
    clearTimeout(waitTimeout);
    state = 'waiting';
    reactionBox.classList.remove('ready');
    reactionBox.classList.add('early');
    reactionContent.textContent = 'Too Early!';
    instruction.textContent = 'Wait for green to appear before clicking';
    
    // Show notification message
    showToast('Clicked too early! Wait for the screen to turn green before clicking');
    
    // Restart after 1.5 seconds
    setTimeout(() => {
        if (state === 'waiting') {
            startTest();
        }
    }, 1500);
}

// Record result
function recordResult(reactionTime) {
    state = 'finished';
    reactionBox.classList.remove('go');
    reactionBox.classList.add('clicked');
    
    // Display current result
    currentTimeDisplay.textContent = `${reactionTime} ms`;
    reactionContent.textContent = `${reactionTime} ms`;
    
    // Prevent unreasonable values (if too fast might be cheating)
    if (reactionTime < 100) {
        showToast('Reaction time too fast, may not be accurate. Please test honestly.');
        reactionTime = 100;
    }
    
    // Record this attempt's result
    attemptResults.push(reactionTime);
    attemptDisplays[currentAttempt].textContent = `${reactionTime} ms`;
    
    // Highlight current attempt
    const attemptItem = attemptDisplays[currentAttempt].parentElement;
    attemptItem.classList.add('active');
    
    // Update attempt count
    currentAttempt++;
    
    // If all attempts are completed
    if (currentAttempt >= 5) {
        finishTest();
    } else {
        // Prepare for next attempt after 1.5 seconds
        setTimeout(() => {
            if (state === 'finished') {
                instruction.textContent = 'Click to continue to next attempt';
                reactionContent.textContent = 'Click to continue';
            }
        }, 1500);
    }
}

// Continue test
function continueTest() {
    reactionBox.classList.remove('clicked');
    reactionBox.classList.add('waiting');
    startTest();
}

// Complete test
function finishTest() {
    state = 'completed';
    
    // Analyze results
    const results = analyzeResults(attemptResults);
    
    // Update attempt record styles (mark best and worst attempts)
    updateAttemptStyles(results.bestIndex, results.worstIndex);
    
    // Display average result
    avgTimeDisplay.textContent = `${results.avg} ms`;
    
    // Calculate and display percentile
    const percentile = calculatePercentile(results.avg);
    percentileDisplay.textContent = `${percentile}%`;
    
    // Display rating
    const rating = getRating(percentile);
    ratingText.textContent = rating.text;
    ratingText.className = rating.class;
    
    // Update display
    reactionContent.textContent = `Average: ${results.avg} ms`;
    instruction.textContent = `Better than ${percentile}% of users`;
    
    // Show restart button and share area
    restartBtn.classList.remove('hidden');
    shareSection.classList.remove('hidden');
    
    // Show congratulation message
    showToast('Test complete! Your average reaction time is ' + results.avg + ' ms');
}

// Analyze results
function analyzeResults(results) {
    const sum = results.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / results.length);
    
    // Find best and worst attempts
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

// Update attempt record styles
function updateAttemptStyles(bestIndex, worstIndex) {
    // Remove all previous styles
    for (let i = 0; i < attemptDisplays.length; i++) {
        const attemptItem = attemptDisplays[i].parentElement;
        attemptItem.classList.remove('active');
    }
    
    // Add best and worst styles
    attemptDisplays[bestIndex].parentElement.classList.add('best');
    attemptDisplays[worstIndex].parentElement.classList.add('worst');
}

// Calculate percentile
function calculatePercentile(time) {
    // Find the first percentile greater than or equal to user's time
    const keys = Object.keys(percentileData).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < keys.length; i++) {
        if (time >= percentileData[keys[i]]) {
            if (i === 0) return 0;
            
            // Linear interpolation for more accurate percentile
            const lowerPercentile = keys[i-1];
            const upperPercentile = keys[i];
            const lowerTime = percentileData[lowerPercentile];
            const upperTime = percentileData[upperPercentile];
            
            // Reverse mapping (shorter time is better)
            const ratio = (lowerTime - time) / (lowerTime - upperTime);
            return Math.round(lowerPercentile + ratio * (upperPercentile - lowerPercentile));
        }
    }
    
    return 99; // If better than all reference values
}

// Get rating
function getRating(percentile) {
    const ratingKeys = Object.keys(ratingSystem).map(Number).sort((a, b) => a - b);
    
    for (let i = ratingKeys.length - 1; i >= 0; i--) {
        if (percentile >= ratingKeys[i]) {
            return ratingSystem[ratingKeys[i]];
        }
    }
    
    return ratingSystem[0]; // Default lowest rating
}

// Copy results function
function copyResults() {
    const avg = avgTimeDisplay.textContent;
    const percentile = percentileDisplay.textContent;
    const rating = ratingText.textContent;
    
    const resultText = `🧠 BrainBenchmark: My reaction time is ${avg} (${rating})\n💯 Better than ${percentile} of users\n🔗 Test your reaction time at https://braingame.cyou/reaction-time.html`;
    
    // Use clipboard API to copy
    navigator.clipboard.writeText(resultText)
        .then(() => {
            showToast('Results copied to clipboard!');
        })
        .catch(err => {
            console.error('Unable to copy results: ', err);
            showToast('Copy failed, please copy manually.');
        });
}

// Download certificate function (simple implementation)
function downloadCertificate() {
    // In a real application, this would generate an actual certificate
    showToast('Certificate feature coming soon!');
}

// Show Toast message
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

// Add keyboard support
document.addEventListener('keydown', function(e) {
    if (state === 'ready' && (e.key === ' ' || e.key === 'Enter')) {
        handleClick();
    }
});

// Ensure application global error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.message);
    showToast('An error occurred, please refresh the page and try again.');
});

// Add page visibility change handling
document.addEventListener('visibilitychange', function() {
    if (document.hidden && state === 'waiting') {
        // If page is not visible and in waiting state, reset test
        clearTimeout(waitTimeout);
        resetTest();
        showToast('Test has been reset, please start again.');
    }
});

// Initialize test
document.addEventListener('DOMContentLoaded', initTest);

function displayResults() {
    const avgTime = calculateAverage(attempts.filter(time => time > 0));
    document.getElementById('avg-time').textContent = avgTime.toFixed(1) + ' ms';

    // 隐藏盒子和当前结果
    document.getElementById('reaction-box').classList.add('hidden');
    document.getElementById('current-result').classList.add('hidden');

    // 显示最终结果
    document.querySelector('.final-results').classList.remove('hidden');
    document.getElementById('restart-btn').classList.remove('hidden');
    document.getElementById('share-section').classList.remove('hidden');

    // 计算百分位数和评级
    let percentile = calculatePercentile(avgTime);
    document.getElementById('percentile').textContent = percentile + '%';

    // 增强版评级展示
    let rating = 'Average', ratingClass = '', stars = '⭐⭐⭐', message = '';
    
    if (avgTime < 180) {
        rating = 'Lightning Fast';
        ratingClass = 'excellent';
        stars = '⭐⭐⭐⭐⭐';
        message = 'Incredible reflexes! You\'re among the elite performers.';
    } else if (avgTime < 210) {
        rating = 'Excellent';
        ratingClass = 'great';
        stars = '⭐⭐⭐⭐⭐';
        message = 'Outstanding performance! Your reflexes are superior.';
    } else if (avgTime < 240) {
        rating = 'Very Good';
        ratingClass = 'very-good';
        stars = '⭐⭐⭐⭐';
        message = 'Great job! Your reaction time is well above average.';
    } else if (avgTime < 270) {
        rating = 'Good';
        ratingClass = 'good';
        stars = '⭐⭐⭐⭐';
        message = 'Nice work! Your reaction time is better than most people.';
    } else if (avgTime < 300) {
        rating = 'Above Average';
        ratingClass = 'above-average';
        stars = '⭐⭐⭐';
        message = 'Good performance! You\'re above the average reaction time.';
    } else if (avgTime < 330) {
        rating = 'Average';
        ratingClass = 'average';
        stars = '⭐⭐⭐';
        message = 'Your reaction time is within the average range.';
    } else if (avgTime < 360) {
        rating = 'Below Average';
        ratingClass = 'below-average';
        stars = '⭐⭐';
        message = 'Keep practicing! You can improve your reaction time.';
    } else {
        rating = 'Needs Practice';
        ratingClass = 'needs-practice';
        stars = '⭐';
        message = 'Everyone starts somewhere! Regular practice will help you improve.';
    }

    document.getElementById('rating-text').innerHTML = `<span class="rating ${ratingClass}">${rating}</span><br>${stars}<br><span class="rating-message">${message}</span>`;
    
    // 保存结果到本地存储
    saveTestResult('reaction', avgTime);
}

// 新增函数：保存测试结果到本地存储
function saveTestResult(testType, score) {
    let history = JSON.parse(localStorage.getItem('brainBenchmark_history') || '{}');
    if (!history[testType]) history[testType] = [];
    
    // 添加新成绩和日期
    history[testType].unshift({
        score: score,
        date: new Date().toISOString()
    });
    
    // 保留最近10条记录
    if (history[testType].length > 10) history[testType] = history[testType].slice(0, 10);
    
    localStorage.setItem('brainBenchmark_history', JSON.stringify(history));
    updateHistoryDisplay(testType, history[testType]);
}

// 新增函数：更新历史记录显示
function updateHistoryDisplay(testType, records) {
    const container = document.querySelector('.attempt-list');
    if (!container) return;
    
    // 在尝试记录下添加历史最佳区域
    let historySection = document.querySelector('.history-section');
    if (!historySection) {
        historySection = document.createElement('div');
        historySection.className = 'history-section';
        historySection.innerHTML = '<h4>Your Best Times</h4><div class="history-list"></div>';
        container.parentNode.appendChild(historySection);
    }
    
    const historyList = historySection.querySelector('.history-list');
    historyList.innerHTML = '';
    
    if (records.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No previous records</div>';
        return;
    }
    
    // 只显示前3条最佳记录
    const bestRecords = [...records].sort((a, b) => a.score - b.score).slice(0, 3);
    
    bestRecords.forEach((record, index) => {
        const date = new Date(record.date);
        const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `<span class="history-rank">#${index+1}</span> <span class="history-score">${record.score.toFixed(1)} ms</span> <span class="history-date">${formattedDate}</span>`;
        historyList.appendChild(el);
    });
} 