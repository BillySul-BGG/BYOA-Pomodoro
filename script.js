class PomodoroTimer {
    constructor(container, title, workTime = 25, breakTime = 5) {
        this.container = container;
        this.timerId = null;
        this.isWorkTime = true;
        this.workTime = workTime * 60; // Convert to seconds
        this.breakTime = breakTime * 60; // Convert to seconds
        this.timeLeft = this.workTime;

        // Get elements
        this.minutesDisplay = container.querySelector('.minutes');
        this.secondsDisplay = container.querySelector('.seconds');
        this.startButton = container.querySelector('.start');
        this.pauseButton = container.querySelector('.pause');
        this.resetButton = container.querySelector('.reset');
        this.modeText = container.querySelector('.mode-text');

        // Bind event listeners
        this.startButton.addEventListener('click', () => this.startTimer());
        this.pauseButton.addEventListener('click', () => this.pauseTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());

        // Initialize display
        this.updateDisplay();

        // Add delete button handler
        const deleteButton = container.querySelector('.delete-timer');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.deleteTimer());
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        const deciseconds = Math.floor((this.timeLeft % 1) * 10);
        
        if (this.timeLeft < 60) {
            // For times less than 1 minute, show seconds with decimal
            this.minutesDisplay.textContent = '00';
            this.secondsDisplay.textContent = 
                seconds.toString().padStart(2, '0') + 
                (deciseconds > 0 ? `.${deciseconds}` : '');
        } else {
            // For times >= 1 minute, show standard MM:SS format
            this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
            this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        }
    }

    switchMode() {
        this.isWorkTime = !this.isWorkTime;
        this.timeLeft = this.isWorkTime ? this.workTime : this.breakTime;
        this.modeText.textContent = this.isWorkTime ? 'Work Time' : 'Break Time';
        this.updateDisplay();
    }

    startTimer() {
        if (this.timerId === null) {
            this.timerId = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft === 0) {
                    clearInterval(this.timerId);
                    this.timerId = null;
                    
                    // If it was work time, switch to break time
                    if (this.isWorkTime) {
                        this.switchMode();
                        this.startTimer();
                    } else {
                        // If break time finished, dissolve the timer
                        this.container.classList.add('dissolving');
                        setTimeout(() => {
                            this.container.remove();
                        }, 500);
                    }
                }
            }, 1000);
        }
    }

    pauseTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
    }

    resetTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.isWorkTime = true;
        this.timeLeft = this.workTime;
        this.modeText.textContent = 'Work Time';
        this.updateDisplay();
    }

    deleteTimer() {
        clearInterval(this.timerId);
        this.container.classList.add('dissolving');
        setTimeout(() => {
            this.container.remove();
        }, 500);
    }
}

// Modal handling
const setupModal = document.querySelector('.setup-modal');
const addTimerBtn = document.querySelector('.add-timer-btn');
const createTimerBtn = document.getElementById('create-timer');
const cancelTimerBtn = document.getElementById('cancel-timer');
const timersGrid = document.querySelector('.timers-grid');

// Create default timer
const defaultTimerContainer = document.querySelector('[data-timer-id="default"]');
new PomodoroTimer(defaultTimerContainer);

// Show modal when clicking add timer button
addTimerBtn.addEventListener('click', () => {
    setupModal.classList.add('visible');
});

// Hide modal when clicking cancel
cancelTimerBtn.addEventListener('click', () => {
    setupModal.classList.remove('visible');
});

// Update the modal time inputs to accept decimal values
const timeInputs = document.querySelectorAll('#work-time, #break-time');
timeInputs.forEach(input => {
    input.setAttribute('type', 'number');
    input.setAttribute('step', '0.1');
    input.setAttribute('min', '0.1');
});

// Create new timer
createTimerBtn.addEventListener('click', () => {
    const title = document.getElementById('timer-title').value || 'New Timer';
    const workTime = parseFloat(document.getElementById('work-time').value) || 25;
    const breakTime = parseFloat(document.getElementById('break-time').value) || 5;

    // Create new timer container
    const newTimerContainer = document.createElement('div');
    newTimerContainer.className = 'container';
    newTimerContainer.innerHTML = `
        <button class="delete-timer">×</button>
        <h2>${title}</h2>
        <div class="timer">
            <span class="minutes">25</span>:<span class="seconds">00</span>
        </div>
        <div class="controls">
            <button class="start">Start</button>
            <button class="pause">Pause</button>
            <button class="reset">Reset</button>
        </div>
        <div class="mode">
            <span class="mode-text">Work Time</span>
        </div>
    `;

    // Insert new timer before the add timer button
    timersGrid.insertBefore(newTimerContainer, document.querySelector('.add-timer'));

    // Initialize new timer
    new PomodoroTimer(newTimerContainer, title, workTime, breakTime);

    // Hide modal and reset form
    setupModal.classList.remove('visible');
    document.getElementById('timer-title').value = '';
    document.getElementById('work-time').value = '25';
    document.getElementById('break-time').value = '5';
}); 