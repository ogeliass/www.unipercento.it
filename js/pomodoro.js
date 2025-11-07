/* =================================================================== */
/* File: js/pomodoro.js
/* Desc: Script specifico per il Pomodoro Timer
/* =================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Elementi DOM
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const timerText = document.getElementById('timer-text');
    const timerStatus = document.getElementById('timer-status');
    const timerProgress = document.querySelector('.timer-progress');
    const pomodorosCompleted = document.getElementById('pomodoros-completed');
    const focusMinutes = document.getElementById('focus-minutes');
    const breakMinutes = document.getElementById('break-minutes');
    const applySettingsBtn = document.getElementById('apply-settings');
    
    // Pulsanti modalità
    const focusModeBtn = document.getElementById('focus-mode');
    const shortBreakModeBtn = document.getElementById('short-break-mode');
    const longBreakModeBtn = document.getElementById('long-break-mode');
    
    // Impostazioni predefinite
    let settings = {
        focusTime: 25,
        shortBreak: 5,
        longBreak: 15
    };
    
    // Statistiche
    let stats = {
        pomodorosCompleted: 0,
        focusMinutes: 0,
        breakMinutes: 0
    };
    
    // Stato del timer
    let timerState = {
        mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
        timeLeft: settings.focusTime * 60,
        totalTime: settings.focusTime * 60,
        isRunning: false,
        interval: null
    };
    
    // Funzione per formattare il tempo
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Funzione per aggiornare il timer
    function updateTimer() {
        if (!timerText || !timerProgress) return;
        
        timerText.textContent = formatTime(timerState.timeLeft);
        
        // Aggiorna il progresso circolare
        const progress = timerState.timeLeft / timerState.totalTime;
        const circumference = 2 * Math.PI * 130; // 2πr
        const dashOffset = circumference * (1 - progress);
        timerProgress.style.strokeDasharray = circumference.toString();
        timerProgress.style.strokeDashoffset = dashOffset.toString();
        
        // Cambia il colore in base alla modalità
        timerProgress.style.stroke = 
            timerState.mode === 'focus' ? 'var(--primary)' :
            timerState.mode === 'shortBreak' ? 'var(--success)' : 'var(--accent)';
    }
    
    // Imposta la modalità
    function setMode(mode) {
        // Resetta il timer se è in esecuzione
        if (timerState.isRunning) {
            pauseTimer();
        }
        
        // Imposta la nuova modalità
        timerState.mode = mode;
        
        // Aggiorna i pulsanti modalità
        if (focusModeBtn) focusModeBtn.classList.remove('active');
        if (shortBreakModeBtn) shortBreakModeBtn.classList.remove('active');
        if (longBreakModeBtn) longBreakModeBtn.classList.remove('active');
        
        // Imposta il tempo in base alla modalità
        switch(mode) {
            case 'focus':
                timerState.timeLeft = settings.focusTime * 60;
                timerState.totalTime = settings.focusTime * 60;
                if (timerStatus) timerStatus.textContent = 'Pronto per studiare';
                if (focusModeBtn) focusModeBtn.classList.add('active');
                break;
            case 'shortBreak':
                timerState.timeLeft = settings.shortBreak * 60;
                timerState.totalTime = settings.shortBreak * 60;
                if (timerStatus) timerStatus.textContent = 'Piccola pausa';
                if (shortBreakModeBtn) shortBreakModeBtn.classList.add('active');
                break;
            case 'longBreak':
                timerState.timeLeft = settings.longBreak * 60;
                timerState.totalTime = settings.longBreak * 60;
                if (timerStatus) timerStatus.textContent = 'Lunga pausa';
                if (longBreakModeBtn) longBreakModeBtn.classList.add('active');
                break;
        }
        
        updateTimer();
    }
    
    // Start timer
    function startTimer() {
        if (!timerState.isRunning) {
            timerState.isRunning = true;
            if (startBtn) startBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'flex';
            
            // Aggiorna lo stato
            if (timerStatus) {
                if (timerState.mode === 'focus') {
                    timerStatus.textContent = 'Studiando...';
                } else {
                    timerStatus.textContent = 'In pausa...';
                }
            }
            
            timerState.interval = setInterval(() => {
                timerState.timeLeft--;
                
                if (timerState.timeLeft <= 0) {
                    completeTimer();
                } else {
                    updateTimer();
                }
            }, 1000);
        }
    }
    
    // Pause timer
    function pauseTimer() {
        if (timerState.isRunning) {
            timerState.isRunning = false;
            clearInterval(timerState.interval);
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (startBtn) startBtn.style.display = 'flex';
            
            // Aggiorna lo stato
            if (timerStatus) {
                if (timerState.mode === 'focus') {
                    timerStatus.textContent = 'Studio in pausa';
                } else {
                    timerStatus.textContent = 'Pausa interrotta';
                }
            }
        }
    }
    
    // Reset timer
    function resetTimer() {
        pauseTimer();
        setMode(timerState.mode); // Reimposta il timer alla modalità corrente
    }
    
    // Completa timer
    function completeTimer() {
        pauseTimer();
        
        // Suono di completamento
        playSound();
        
        // Aggiorna statistiche
        if (timerState.mode === 'focus') {
            stats.pomodorosCompleted++;
            stats.focusMinutes += settings.focusTime;
            if (timerStatus) timerStatus.textContent = 'Sessione completata!';
            
            // Suggerisci una pausa breve
            setTimeout(() => {
                if (confirm('Sessione completata! Vuoi fare una pausa breve?')) {
                    setMode('shortBreak');
                } else {
                    setMode('focus'); // Resetta per un'altra sessione
                }
            }, 500);
        } else {
            // Aggiorna i minuti di pausa
            const breakMinutes = 
                timerState.mode === 'shortBreak' ? settings.shortBreak : settings.longBreak;
            stats.breakMinutes += breakMinutes;
            
            if (timerStatus) timerStatus.textContent = 'Pausa completata!';
             setTimeout(() => {
                if (confirm('Pausa completata! Pronto a tornare a studiare?')) {
                    setMode('focus');
                }
            }, 500);
        }
        
        updateStats();
        showBrowserNotification();
    }
    
    // Riproduci suono
    function playSound() {
        try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
            audio.play().catch(e => console.warn("Impossibile riprodurre l'audio:", e));
        } catch (e) {
            console.warn("Errore riproduzione audio:", e);
        }
    }
    
    // Mostra notifica browser
    function showBrowserNotification() {
        if (!("Notification" in window)) return;
        
        const title = timerState.mode === 'focus' ? 'Tempo di studio completato!' : 'Pausa completata!';
        const body = timerState.mode === 'focus' ? 'Ottimo lavoro! Prenditi una pausa.' : 'La pausa è finita. Pronto per studiare?';
        
        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: 'img/favicon.png' });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body, icon: 'img/favicon.png' });
                }
            });
        }
    }
    
    // Aggiorna statistiche
    function updateStats() {
        if (pomodorosCompleted) pomodorosCompleted.textContent = stats.pomodorosCompleted;
        if (focusMinutes) focusMinutes.textContent = stats.focusMinutes;
        if (breakMinutes) breakMinutes.textContent = stats.breakMinutes;
        
        // Salva le statistiche nel localStorage
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }
    
    // Carica statistiche dal localStorage
    function loadStats() {
        const savedStats = localStorage.getItem('pomodoroStats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
            updateStats();
        }
    }
    
    // Applica impostazioni
    function applySettings() {
        settings.focusTime = parseInt(document.getElementById('focus-time').value) || 25;
        settings.shortBreak = parseInt(document.getElementById('short-break').value) || 5;
        settings.longBreak = parseInt(document.getElementById('long-break').value) || 15;
        
        // Salva impostazioni
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        
        // Reimposta il timer con le nuove impostazioni
        setMode(timerState.mode);
        
        // Mostra conferma
        alert('Impostazioni applicate con successo!');
    }
    
    // Carica impostazioni
    function loadSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            
            // Aggiorna i campi di input
            const focusInput = document.getElementById('focus-time');
            const shortInput = document.getElementById('short-break');
            const longInput = document.getElementById('long-break');
            
            if (focusInput) focusInput.value = settings.focusTime;
            if (shortInput) shortInput.value = settings.shortBreak;
            if (longInput) longInput.value = settings.longBreak;
        }
        
        // Inizializza il timer
        setMode('focus');
    }
    
    // Event listeners (con controlli di esistenza)
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (applySettingsBtn) applySettingsBtn.addEventListener('click', applySettings);
    
    if (focusModeBtn) focusModeBtn.addEventListener('click', () => setMode('focus'));
    if (shortBreakModeBtn) shortBreakModeBtn.addEventListener('click', () => setMode('shortBreak'));
    if (longBreakModeBtn) longBreakModeBtn.addEventListener('click', () => setMode('longBreak'));
    
    // Inizializzazione
    loadSettings();
    loadStats();
    if (pauseBtn) pauseBtn.style.display = 'none';
});