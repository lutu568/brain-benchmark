/**
 * Number Memory Test
 * Players need to remember and repeat displayed numbers in a short time
 */

// Number Memory Test - Fixed Version

// Execute when page is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Number Memory Test page loaded');
    
    // Ensure page content is visible (not depending on loaded class)
    document.body.style.opacity = "1";
    document.body.style.transform = "translateY(0)";
    
    // Add page loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
    
    // Check if stylesheets are loaded
    const styleSheets = Array.from(document.styleSheets);
    const styleSheetsLoaded = styleSheets.some(sheet => 
        sheet.href && (sheet.href.includes('styles.css') || sheet.href.includes('number-memory.css'))
    );
    
    if (!styleSheetsLoaded) {
        console.warn('Warning: External stylesheets may not be loaded');
        // If stylesheets are not loaded, add inline styles to ensure basic functionality
        const emergencyStyles = document.createElement('style');
        emergencyStyles.textContent = `
            body { opacity: 1 !important; transform: none !important; }
            .game-screen.active { display: block !important; }
            .btn { display: inline-block; padding: 10px; background: #2962ff; color: white; }
        `;
        document.head.appendChild(emergencyStyles);
    }
    
    // Display debug panel
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
        debugPanel.style.display = 'block';
        debugPanel.textContent = 'Debug Mode - Page Loaded';
    }
    
    // Game state
    const gameState = {
        level: 1,                // Current level
        numberToRemember: '',    // Current number to memorize
        timerDuration: 7000,     // Number display time (milliseconds)
        timerTimeout: null       // Timer timeout
    };
    
    // Get DOM elements
    const elements = {};
    
    try {
        // Game screens
        elements.startScreen = document.getElementById('start-screen');
        elements.numberScreen = document.getElementById('number-display-screen');
        elements.inputScreen = document.getElementById('number-input-screen');
        elements.resultScreen = document.getElementById('result-screen');
        elements.gameOverScreen = document.getElementById('game-over-screen');
        
        // Buttons
        elements.startBtn = document.getElementById('start-btn');
        elements.submitBtn = document.getElementById('submit-btn');
        elements.continueBtn = document.getElementById('continue-btn');
        elements.restartBtn = document.getElementById('restart-btn');
        elements.shareBtn = document.getElementById('share-btn');
        
        // Other elements
        elements.levelDisplay = document.getElementById('current-level');
        elements.numberDisplay = document.getElementById('number-to-remember');
        elements.numberInput = document.getElementById('number-input');
        elements.correctAnswer = document.getElementById('correct-number');
        elements.finalLevel = document.getElementById('final-level');
        elements.finalDigits = document.getElementById('final-digits');
        elements.percentile = document.getElementById('percentile');
        
        // Message containers
        elements.successMessage = document.getElementById('success-message');
        elements.failureMessage = document.getElementById('failure-message');
        
        // Debug info
        updateDebug('All DOM elements found');
    } catch (error) {
        console.error('DOM element search error:', error);
        updateDebug('Error: DOM element search failed - ' + error.message);
        return; // Stop execution
    }
    
    // Check if key elements exist
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
        const errorMsg = 'Missing key elements: ' + missingElements.join(', ');
        console.error(errorMsg);
        updateDebug('Error: ' + errorMsg);
        alert('Page loading error, missing required elements');
        return; // Stop execution
    }
    
    // Add event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.submitBtn.addEventListener('click', checkAnswer);
    elements.continueBtn.addEventListener('click', nextLevel);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.shareBtn.addEventListener('click', shareResult);
    
    // Keyboard event - Enter key to submit
    elements.numberInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Set initial screen
    showScreen(elements.startScreen);
    updateLevelDisplay();
    updateDebug('Initialization complete, waiting for game start');
    
    // Start game
    function startGame() {
        updateDebug('Game started');
        gameState.level = 1;
        updateLevelDisplay();
        showToast('Challenge started!');
        showNextNumber();
    }
    
    // Show next number
    function showNextNumber() {
        // Generate new number (number length = current level + 2)
        const numberLength = gameState.level + 2;
        gameState.numberToRemember = generateNumber(numberLength);
        
        // Display number
        elements.numberDisplay.textContent = gameState.numberToRemember;
        showScreen(elements.numberScreen);
        
        updateDebug('Displaying number: ' + gameState.numberToRemember);
        
        // Reset timer
        resetTimer();
        
        // Set timer
        gameState.timerTimeout = setTimeout(function() {
            showInputScreen();
        }, gameState.timerDuration);
    }
    
    // Generate random number
    function generateNumber(length) {
        let number = '';
        // First digit not 0
        number += Math.floor(Math.random() * 9) + 1;
        
        // Generate remaining digits
        for (let i = 1; i < length; i++) {
            number += Math.floor(Math.random() * 10);
        }
        
        return number;
    }
    
    // Show input screen
    function showInputScreen() {
        clearTimeout(gameState.timerTimeout);
        showScreen(elements.inputScreen);
        elements.numberInput.value = '';
        elements.numberInput.focus();
        updateDebug('Showing input screen');
    }
    
    // Check answer
    function checkAnswer() {
        const userAnswer = elements.numberInput.value.trim();
        
        if (!userAnswer) {
            showToast('Please enter a number');
            return;
        }
        
        updateDebug('Checking answer: userInput=' + userAnswer + ', correctAnswer=' + gameState.numberToRemember);
        
        const isCorrect = (userAnswer === gameState.numberToRemember);
        
        if (isCorrect) {
            // Answer correct
            elements.successMessage.classList.add('active');
            elements.failureMessage.classList.remove('active');
            updateDebug('Answer correct');
            showToast('Correct answer!');
        } else {
            // Answer incorrect
            elements.successMessage.classList.remove('active');
            elements.failureMessage.classList.add('active');
            elements.correctAnswer.textContent = gameState.numberToRemember;
            updateDebug('Answer incorrect');
            showToast('Wrong answer!');
            
            // Show game over after 2 seconds
            setTimeout(function() {
                showGameOver();
            }, 2000);
        }
        
        showScreen(elements.resultScreen);
    }
    
    // Next level
    function nextLevel() {
        gameState.level++;
        updateLevelDisplay();
        updateDebug('Moving to next level: ' + gameState.level);
        showNextNumber();
    }
    
    // Show game over and final results
    function showGameOver() {
        // Set final results
        const level = gameState.level;
        const digitsCount = gameState.level - 1;
        elements.finalLevel.textContent = digitsCount;
        elements.finalDigits.textContent = digitsCount;
        
        // Calculate percentile
        const percentile = calculatePercentile(digitsCount);
        elements.percentile.textContent = percentile + '%';
        
        // 增强版评级展示
        let rating, ratingClass, stars, message;
        
        if (digitsCount >= 14) {
            rating = 'Memory Master';
            ratingClass = 'excellent';
            stars = '⭐⭐⭐⭐⭐';
            message = 'Exceptional memory capacity! You have a photographic memory.';
        } else if (digitsCount >= 12) {
            rating = 'Exceptional';
            ratingClass = 'great';
            stars = '⭐⭐⭐⭐⭐';
            message = 'Remarkable memory! You\'re in the top 1% of users.';
        } else if (digitsCount >= 10) {
            rating = 'Very Good';
            ratingClass = 'very-good';
            stars = '⭐⭐⭐⭐';
            message = 'Impressive! Your memory capacity is well above average.';
        } else if (digitsCount >= 8) {
            rating = 'Above Average';
            ratingClass = 'good';
            stars = '⭐⭐⭐⭐';
            message = 'Great job! Your memory is better than most people.';
        } else if (digitsCount >= 6) {
            rating = 'Average';
            ratingClass = 'average';
            stars = '⭐⭐⭐';
            message = 'Good work! You have a normal memory capacity.';
        } else if (digitsCount >= 4) {
            rating = 'Below Average';
            ratingClass = 'below-average';
            stars = '⭐⭐';
            message = 'With practice, you can improve your memory capacity.';
        } else {
            rating = 'Beginner';
            ratingClass = 'needs-practice';
            stars = '⭐';
            message = 'Regular memory exercises will help you improve quickly!';
        }
        
        // 创建或更新评级元素
        let ratingElement = document.querySelector('.memory-rating');
        if (!ratingElement) {
            ratingElement = document.createElement('div');
            ratingElement.className = 'memory-rating';
            // 插入到百分比结果之后
            elements.percentile.parentNode.parentNode.appendChild(ratingElement);
        }
        
        ratingElement.innerHTML = `
            <span class="rating ${ratingClass}">${rating}</span><br>
            ${stars}<br>
            <span class="rating-message">${message}</span>
        `;
        
        // Show game over screen
        showScreen(elements.gameOverScreen);
        
        // 保存结果到本地存储
        saveMemoryResult(digitsCount);
        
        showToast('Test complete! Your final score: ' + digitsCount + ' digits');
    }
    
    // 保存测试结果到本地存储
    function saveMemoryResult(score) {
        let history = JSON.parse(localStorage.getItem('brainBenchmark_history') || '{}');
        if (!history.memory) history.memory = [];
        
        // 添加新成绩和日期
        history.memory.unshift({
            score: score,
            date: new Date().toISOString()
        });
        
        // 保留最近10条记录
        if (history.memory.length > 10) history.memory = history.memory.slice(0, 10);
        
        localStorage.setItem('brainBenchmark_history', JSON.stringify(history));
        
        // 更新并显示历史记录
        updateMemoryHistory(history.memory);
    }
    
    // 更新历史记录显示
    function updateMemoryHistory(records) {
        // 查找历史记录容器
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        if (records.length === 0) {
            historyList.innerHTML = '<div class="history-item empty">No history yet</div>';
            return;
        }
        
        // 显示最近5条记录
        const recentRecords = records.slice(0, 5);
        
        recentRecords.forEach((record, index) => {
            const date = new Date(record.date);
            const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            
            const item = document.createElement('div');
            item.className = 'history-item';
            
            item.innerHTML = `
                <span class="history-date">${formattedDate}</span>
                <span class="history-score">${record.score} digits</span>
                ${index === 0 ? '<span class="history-badge">Latest</span>' : ''}
            `;
            
            historyList.appendChild(item);
        });
        
        // 如果有超过一条记录，计算并显示个人最佳
        if (records.length > 1) {
            const bestRecord = [...records].sort((a, b) => b.score - a.score)[0];
            const bestDate = new Date(bestRecord.date);
            const formattedBestDate = `${bestDate.getMonth()+1}/${bestDate.getDate()} ${String(bestDate.getHours()).padStart(2, '0')}:${String(bestDate.getMinutes()).padStart(2, '0')}`;
            
            const bestItem = document.createElement('div');
            bestItem.className = 'history-item best';
            
            bestItem.innerHTML = `
                <span class="history-date">${formattedBestDate}</span>
                <span class="history-score">${bestRecord.score} digits</span>
                <span class="history-badge best">Personal Best</span>
            `;
            
            // 将个人最佳插入到列表顶部
            historyList.insertBefore(bestItem, historyList.firstChild);
        }
    }
    
    // Restart game
    function restartGame() {
        gameState.level = 1;
        updateLevelDisplay();
        updateDebug('Restarting game');
        showToast('Challenge restarted!');
        showNextNumber();
    }
    
    // Update level display
    function updateLevelDisplay() {
        elements.levelDisplay.textContent = gameState.level;
    }
    
    // Show specified screen
    function showScreen(screenToShow) {
        // Hide all screens
        const allScreens = [
            elements.startScreen,
            elements.numberScreen,
            elements.inputScreen,
            elements.resultScreen,
            elements.gameOverScreen
        ];
        
        // Make sure screen elements exist before operating
        allScreens.forEach(function(screen) {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        // Show selected screen
        if (screenToShow) {
            screenToShow.classList.add('active');
            updateDebug('Showing screen: ' + screenToShow.id);
        }
    }
    
    // Reset timer
    function resetTimer() {
        const timerBar = document.getElementById('timer-bar');
        const timerProgress = document.getElementById('timer-progress');
        
        if (!timerBar) {
            console.error('Timer element not found');
            return;
        }
        
        // Remove old progress bar
        if (timerProgress) {
            timerProgress.remove();
        }
        
        // Add new progress bar and force redraw
        setTimeout(() => {
            const newProgress = document.createElement('div');
            newProgress.id = 'timer-progress';
            timerBar.appendChild(newProgress);
            
            // Force redraw to trigger CSS animation
            void timerBar.offsetWidth;
        }, 10);
    }
    
    // Calculate percentile
    function calculatePercentile(level) {
        // Simplified percentile calculation
        if (level <= 5) return level * 10;
        if (level <= 8) return 50 + (level - 5) * 10;
        if (level <= 10) return 80 + (level - 8) * 5;
        if (level <= 15) return 90 + (level - 10) * 2;
        return 99;
    }
    
    // Update debug info
    function updateDebug(message) {
        console.log('Debug:', message);
        if (debugPanel) {
            debugPanel.textContent = message;
        }
    }
    
    // Toast notification functionality
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    let toastTimeout = null;
    
    function showToast(message) {
        console.log('Showing toast:', message); // Output to console as backup
        
        // Check if toast element exists
        if (!toast || !toastMessage) {
            console.warn('Toast element does not exist, creating a temporary one');
            // If toast element doesn't exist, create a temporary one
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
        
        // Ensure toast is visible, even if CSS hasn't loaded
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
    
    // Show welcome message
    showToast('Welcome to the Number Memory Test!');
    
    // Add share result functionality
    function shareResult() {
        // Get final results
        const level = elements.finalLevel.textContent;
        const digits = elements.finalDigits.textContent;
        const percentile = elements.percentile.textContent;
        const rating = document.querySelector('.rating').textContent;
        
        // Create enhanced share text
        const shareText = `🧠 BrainBenchmark: I memorized ${digits} digits (${rating})\n💯 Better than ${percentile} of users\n🔗 Test your memory at https://braingame.cyou/number-memory.html`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareText)
            .then(() => {
                showToast('Result copied to clipboard!');
            })
            .catch(err => {
                console.error('Unable to copy result: ', err);
                showToast('Copy failed, please share manually.');
            });
    }
}); 