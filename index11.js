// ==========================================
// LOADING SCREEN SYSTEM
// ==========================================
window.addEventListener('load', () => {
    const prog = document.getElementById('loadProgress');
    prog.style.width = '100%';
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => document.getElementById('loadingScreen').remove(), 500);
    }, 1200);
});

// ==========================================
// AVATAR BORDERS MAP
// ==========================================
const BORDER_STYLES_MAP = {
    "border-shadow-recruit": "border-2 border-purple-900/60 shadow-[0_0_12px_rgba(176,38,255,0.4)]",
    "border-elite-knight": "border-2 border-[var(--sys-cyan,#00f0ff)] shadow-[0_0_18px_rgba(0,240,255,0.7)] animate-pulse",
    "border-shadow-commander": "border-4 border-double border-purple-600 shadow-[0_0_25px_rgba(147,51,234,0.9)]",
    "border-shadow-monarch": "border-2 border-sys-gold shadow-[0_0_35px_rgba(255,215,0,0.95),_inset_0_0_15px_rgba(176,38,255,0.6)]"
};

function applyEquippedAvatarBorder() {
    const avatarContainer = document.getElementById('avatar-container');
    if (!avatarContainer) return;

    const currentBorderId = localStorage.getItem('equipped_avatar_border');

    Object.values(BORDER_STYLES_MAP).forEach(cssClass => {
        cssClass.split(" ").forEach(cls => avatarContainer.classList.remove(cls));
    });

    if (currentBorderId && BORDER_STYLES_MAP[currentBorderId]) {
        const targetClasses = BORDER_STYLES_MAP[currentBorderId].split(" ");
        targetClasses.forEach(cls => avatarContainer.classList.add(cls));
    }
}

window.addEventListener('DOMContentLoaded', applyEquippedAvatarBorder);


// ==========================================
// UTILITIES & UI
// ==========================================
const UI = {
    toggleTimerSettings() {
        if (typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
        document.getElementById('timerModal').classList.toggle('hidden');
    }
};

const Toast = {
    show(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        const colors = {
            success: 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
            error: 'border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.3)]',
            info: 'border-[var(--sys-cyan)] text-[var(--sys-cyan)] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
        };
        toast.className = `pointer-events-auto px-5 py-3 bg-[#02040a]/95 border backdrop-blur-md text-sm font-bold sys-font tracking-wide animate-system-pop ${colors[type] || colors.info}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
    }
};

// ==========================================
// SYSTEM RESET ENGINE (HARD RESET)
// ==========================================
const SystemReset = {
    confirmAndReset() {
        if(window.SoundEffects) SoundEffects.playSystemClick();

        const firstConfirm = confirm("⚠️ Sovereign Security Warning: Are you sure you want to erase all data?\n(Level resets to 1, all Gold, XP, Quests, and Logs will be lost permanently).");
        if (!firstConfirm) return;

        const secondConfirm = confirm("‼️ Final Warning: This resets the system to zero. Execute 'Memory Wipe'?");
        if (!secondConfirm) return;

        const keysToReset = [
            'monarch_system_data', 
            'sovereign_active_quest', 
            'directive_start_time', 
            'sovereign_active_program', 
            'SL_QUESTS', 
            'sovereign_system_logs',
            'sovereign_titles_index',
            'sl_onboarding_complete',
            'sl_player_data'
        ];

        keysToReset.forEach(key => localStorage.removeItem(key));

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('title_cache_')) {
                localStorage.removeItem(key);
            }
        });

        alert("🔄 Memory wiped and system fully reset. Redirecting to registration portal.");

        window.location.href = 'index.html';
    }
};

// ==========================================
// SOUND EFFECTS
// ==========================================
const SoundEffects = {
    track1: new Audio('SHADOWBORN.mp3'),
    track2: new Audio('Kingdom_of_Iron.mp3'),
    currentTrackNumber: null,
    isMusicPlaying: false,

    init() {
        this.track1.loop = true;
        this.track2.loop = true;
    },

    toggleMusic(trackNumber) {
        const icon1 = document.getElementById('musicIcon1');
        const icon2 = document.getElementById('musicIcon2');

        if (this.isMusicPlaying && this.currentTrackNumber === trackNumber) {
            this.stopAllAudio();
            return;
        }
        if (this.isMusicPlaying) this.stopAllAudio();

        this.isMusicPlaying = true;
        this.currentTrackNumber = trackNumber;

        if (trackNumber === 1) {
            this.track1.play().catch(err => console.log("Auto-play blocked:", err));
            if (icon1) icon1.textContent = '⏸️';
            if (icon2) icon2.textContent = '🎼';
        } else if (trackNumber === 2) {
            this.track2.play().catch(err => console.log("Auto-play blocked:", err));
            if (icon1) icon1.textContent = '🎵';
            if (icon2) icon2.textContent = '⏸️';
        }
    },

    stopAllAudio() {
        this.track1.pause(); this.track1.currentTime = 0;
        this.track2.pause(); this.track2.currentTime = 0;
        const icon1 = document.getElementById('musicIcon1');
        const icon2 = document.getElementById('musicIcon2');
        if (icon1) icon1.textContent = '🎵';
        if (icon2) icon2.textContent = '🎼';
        this.isMusicPlaying = false;
        this.currentTrackNumber = null;
    },

    playSystemClick() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.1);
        } catch(e) {}
    },

    playSuccess() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.3);
            });
        } catch(e) {}
    },

    playLevelUp() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [440, 554, 659, 880, 1108];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
                gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        } catch(e) {}
    }
};
SoundEffects.init();

// ==========================================
// DIRECTIVE TIMER ENGINE
// ==========================================
const DirectiveTimer = {
    startTime: null,
    timerInterval: null,
    isRunning: false,

    start(savedStartTime) {
        if (this.isRunning) return;
        this.startTime = savedStartTime || Date.now();
        this.isRunning = true;
        localStorage.setItem('directive_start_time', this.startTime.toString());
        localStorage.setItem('active_theme_bg', 'shadow_monarch_video.mp4');
        localStorage.setItem('name_glow_color', '#00f0ff');
        this.update();
        this.timerInterval = setInterval(() => this.update(), 1000);
    },

    stop() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.startTime = null;
        localStorage.removeItem('directive_start_time');
    },

    update() {
        if (!this.startTime) return;
        const elapsed = Date.now() - this.startTime;
        const timerEl = document.getElementById('directiveTimer');
        const progressEl = document.getElementById('directiveProgressBar');
        if (timerEl) timerEl.textContent = this.formatTime(elapsed);
        if (progressEl) {
            const progress = Math.min((elapsed / (25 * 60 * 1000)) * 100, 100);
            progressEl.style.width = `${progress}%`;
        }
    },

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    reset() {
        this.stop();
        const timerEl = document.getElementById('directiveTimer');
        const progressEl = document.getElementById('directiveProgressBar');
        if (timerEl) timerEl.textContent = '00:00:00';
        if (progressEl) progressEl.style.width = '0%';
    }
};

// ==========================================
// ANIME POPUP ENGINE
// ==========================================
const AnimePopup = {
    currentQuest: null,
    questStartTime: null,
    playerLevel: 24,
    playerXP: 0,
    playerGold: 0,

    show(title, description, timeLimit, rewardXP) {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        this.syncPlayerState();

        this.currentQuest = { 
            title: title, 
            rewardXP: rewardXP || 10, 
            timeLimit: timeLimit || "25:00",
            type: this.inferQuestType(title),
            details: description,
            acceptedAt: null,
            active: false
        };

        document.getElementById('animePopupTitle').textContent = title;
        document.getElementById('animePopupDesc').innerHTML = description;
        document.getElementById('animePopupTime').textContent = `TIME: ${this.currentQuest.timeLimit}`;
        document.getElementById('animePopupReward').textContent = `REWARD: +${this.currentQuest.rewardXP} EXP`;
        document.getElementById('directiveTargetTime').textContent = this.currentQuest.timeLimit;

        const modal = document.getElementById('animeSystemPopup');
        modal.classList.remove('hidden');
    },

    inferQuestType(title) {
        const t = title.toLowerCase();
        if (t.match(/code|eng|ai|dev|prog|lab/)) return 'coding_ai';
        if (t.match(/sport|phys|ppl|run|train|fight|gym|bjj/)) return 'sports';
        if (t.match(/lang|english|book|quran|spirit|sharia|read/)) return 'languages_books';
        if (t.match(/dungeon|mind|chess|sudoku|memory/)) return 'dungeons';
        return 'coding_ai';
    },

    syncPlayerState() {
        try {
            const coreData = JSON.parse(localStorage.getItem('monarch_system_data')) || {};
            this.playerLevel = coreData.level || 1;
            this.playerXP = coreData.xp || 0;
            this.playerGold = coreData.gold || 0;
        } catch(e) {}
    },

    acceptQuest() {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        document.getElementById('animeSystemPopup').classList.add('hidden');
        if(this.currentQuest) {
            this.currentQuest.acceptedAt = Date.now();
            this.currentQuest.active = true;
            localStorage.setItem('sovereign_active_quest', JSON.stringify(this.currentQuest));

            document.getElementById('activeDirectiveText').textContent = this.currentQuest.title;
            document.getElementById('activeDirectiveBar').classList.remove('hidden');
            DirectiveTimer.start(this.currentQuest.acceptedAt);

            if(window.SovereignEngine) SovereignEngine.state.activeQuest = this.currentQuest;
            if(window.Toast) Toast.show('Quest activated: ' + this.currentQuest.title, 'success');
        }
    },

  completeQuest() {
        let quest = this.currentQuest || (window.SovereignEngine ? SovereignEngine.state.activeQuest : null);
        if (!quest) {
            try { quest = JSON.parse(localStorage.getItem('sovereign_active_quest')); } catch(e){}
        }
        if (!quest) {
            document.getElementById('activeDirectiveBar').classList.add('hidden');
            if (window.DirectiveTimer) DirectiveTimer.stop();
            return;
        }

        const questType = quest.type || 'coding_ai';
        const baseReward = (window.SovereignEngine ? SovereignEngine.config.weights[questType] : null) || 10;
        const acceptedAt = quest.acceptedAt || Date.now();
        const elapsedMinutes = Math.floor((Date.now() - acceptedAt) / 60000);

        let timeBonus = 0;
        if (elapsedMinutes >= 25) timeBonus = 10;
        if (elapsedMinutes >= 60) timeBonus = 25;

        const totalXP = baseReward + timeBonus;
        const goldReward = totalXP * 2;

        if(window.PlayerState) {
            PlayerState.addXP(totalXP);
            PlayerState.addGold(goldReward);
        }

        if(window.SovereignEngine) {
            SovereignEngine.logToSystem('quest', `Cleared quest: [${quest.title}] | +${totalXP} XP`);
        }

        document.getElementById('activeDirectiveBar').classList.add('hidden');
        if (window.DirectiveTimer) DirectiveTimer.stop();
        localStorage.removeItem('sovereign_active_quest');
        localStorage.removeItem('directive_start_time');
        if(window.SovereignEngine) SovereignEngine.state.activeQuest = null;
        this.currentQuest = null;

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 140,
                spread: 80,
                origin: { y: 0.5 },
                colors: ['#00f0ff', '#7000ff', '#120024'], 
                scalar: 0.5,     
                gravity: 0.8,     
                startVelocity: 45, 
                ticks: 80
            });

            setTimeout(() => {
                confetti({
                    particleCount: 40,
                    spread: 360,
                    origin: { y: 0.45 },
                    colors: ['#ffb700', '#ffffff'],
                    scalar: 0.4,
                    gravity: 0.2,
                    startVelocity: 15,
                    ticks: 120
                });
            }, 250);
        }

        const systemMessage = `Quest Completed: [${quest.title}] | +${totalXP} XP | +${goldReward} GOLD`;
        if(window.Toast) {
            Toast.show(systemMessage, 'success');
        }
    },

    cancelQuest() {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        let questToCancel = this.currentQuest || (window.SovereignEngine ? SovereignEngine.state.activeQuest : null);
        if (!questToCancel) {
            try { questToCancel = JSON.parse(localStorage.getItem('sovereign_active_quest')); } catch(e){}
        }

        DirectiveTimer.stop();
        document.getElementById('activeDirectiveBar').classList.add('hidden');

        if(questToCancel && window.PlayerState) {
            PlayerState.addXP(-10);
            if(window.SovereignEngine) SovereignEngine.logToSystem('penalty', `Canceled quest: [${questToCancel.title}] | -10 XP`);
            if(window.Toast) Toast.show('Quest canceled! Penalty: -10 XP', 'error');
        }

        localStorage.removeItem('sovereign_active_quest');
        localStorage.removeItem('directive_start_time');
        if(window.SovereignEngine) SovereignEngine.state.activeQuest = null;
        this.currentQuest = null;
    }
};

// ==========================================
// SYSTEM PLAYER STATE ENGINE (ANTI-OVERWRITE SHIELD)
// ==========================================
const PlayerState = {
    data: {
        level: 1,
        xp: 0,
        gold: 0,
        title: "[]",
        avatar: "", // ← هنا تُخزّن الصورة كـ Base64
        stats: { str: 10, vit: 10, agi: 10, int: 10, sen: 10 },
        inventory: [] 
    },

    init() {
        let saved = localStorage.getItem('monarch_system_data');

        if (!saved) {
            const legacyData = localStorage.getItem('sl_player_data');
            if (legacyData) {
                try {
                    const parsedLegacy = JSON.parse(legacyData);
                    this.data.name = parsedLegacy.name || this.data.name;
                    this.data.title = parsedLegacy.title || this.data.title;
                    this.data.level = parsedLegacy.level || this.data.level;
                    this.data.xp = parsedLegacy.exp || this.data.xp;
                    this.data.registeredAt = parsedLegacy.registeredAt || this.data.registeredAt;
                    this.save();
                    saved = localStorage.getItem('monarch_system_data');
                } catch(e) {}
            }
        }

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = {
                    ...this.data,
                    ...parsed,
                    stats: { ...this.data.stats, ...(parsed.stats || {}) },
                    inventory: parsed.inventory || []
                };
            } catch (e) {
                console.error("[System Shield]: Error merging central logs", e);
            }
        } else {
            this.save();
        }

        // 🔥 هذا السطر الجديد: يسترجع الصورة فور تحميل الصفحة
        this.restoreAvatar();
        this.updateUI();
        this.updateNameDisplay();
    },

    // ─── دالة جديدة: استرجاع الصورة من الذاكرة ───
    restoreAvatar() {
        const avatarImg = document.getElementById('monarch-avatar-display');
        if (avatarImg && this.data.avatar && this.data.avatar.startsWith('data:image')) {
            avatarImg.src = this.data.avatar;
        }
    },

    save() {
        try {
            if (window.SovereignCore) {
                SovereignCore.save(this.data);
            } else {
                localStorage.setItem('monarch_system_data', JSON.stringify(this.data));
                if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel('sovereign_sync');
                    bc.postMessage({ type: 'SYSTEM_DATA_UPDATED' });
                }
            }
        } catch (e) {
            console.error("[System Shield]: Failed to secure local cloud save", e);
        }
    },

    addStat(statName, amount) {
        if (this.data.stats[statName] !== undefined) {
            this.data.stats[statName] += amount;
            if (this.data.stats[statName] < 0) this.data.stats[statName] = 0;
            this.save();
            this.updateUI();
        }
    },

    spendAP(statName) {
        if ((this.data.authority || 0) >= 5) {
            this.data.authority -= 5;
            this.addStat(statName, 5);
            if(window.Toast) Toast.show(`+5 ${statName.toUpperCase()} consumed 5 Authority`, 'success');
        } else {
            if(window.Toast) Toast.show('Insufficient Authority Points!', 'error');
        }
    },

    // ─── دالة تحديث الصورة (مُحسّنة) ───
    updateAvatar(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            if(window.Toast) Toast.show("⚠️ Image size too large! Choose an image under 3MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            this.data.avatar = base64Image;          // ← حفظ في الذاكرة
            document.getElementById('monarch-avatar-display').src = base64Image; // ← عرض فوري
            this.save();                              // ← حفظ دائم في localStorage
            if(window.Toast) Toast.show("🔮 Sovereign aura integrated successfully", "success");
        };
        reader.readAsDataURL(file);
    },

    addXP(amount) {
        this.data.xp += amount;
        if (this.data.xp < 0) this.data.xp = 0;
        let xpNeeded = this.data.level * 100;
        while (this.data.xp >= xpNeeded) {
            this.data.xp -= xpNeeded;
            this.data.level++;
            xpNeeded = this.data.level * 100;
            if(window.SoundEffects) SoundEffects.playLevelUp();
            if(window.Milestone) Milestone.show(this.data.level);
        }
        this.save();
        this.updateUI();
    },

    addGold(amount) {
        this.data.gold += amount;
        if (this.data.gold < 0) this.data.gold = 0;
        this.save();
        this.updateUI();
    },

    addReward(xpAmount, goldAmount) {
        this.addXP(xpAmount);
        this.addGold(goldAmount);
    },

    updateNameDisplay() {
        const nameEl = document.getElementById('playerNameDisplay');
        if (nameEl && this.data.name) {
            nameEl.textContent = this.data.name;
        }

        const titleEl = document.getElementById('monarch-active-title');
        if (titleEl && this.data.title) {
            titleEl.textContent = this.data.title;
        }
    },

    updateUI() {
        if(document.getElementById('player-level')) document.getElementById('player-level').textContent = this.data.level;
        if(document.getElementById('currentLevel')) document.getElementById('currentLevel').textContent = this.data.level;
        
        if(document.getElementById('stat-sen-val')) document.getElementById('stat-sen-val').textContent = this.data.stats.sen;
        if(document.getElementById('stat-str')) document.getElementById('stat-str').textContent = this.data.stats.str;
        if(document.getElementById('stat-vit')) document.getElementById('stat-vit').textContent = this.data.stats.vit;
        if(document.getElementById('stat-agi')) document.getElementById('stat-agi').textContent = this.data.stats.agi;
        if(document.getElementById('stat-int')) document.getElementById('stat-int').textContent = this.data.stats.int;
        if(document.getElementById('stat-sen')) document.getElementById('stat-sen').textContent = this.data.stats.sen;

        if(document.getElementById('playerGold')) document.getElementById('playerGold').textContent = this.data.gold;
        if(document.getElementById('availablePoints')) document.getElementById('availablePoints').textContent = this.data.authority || 0;
        if(document.getElementById('stat-authority')) document.getElementById('stat-authority').textContent = this.data.authority || 0;
        if(document.getElementById('stat-lethality')) document.getElementById('stat-lethality').textContent = (this.data.lethality || 0) + '%';
        
        const xpNeeded = this.data.level * 100;
        
        if(document.getElementById('xpText')) {
            document.getElementById('xpText').textContent = `${this.data.xp} / ${xpNeeded}`;
        }
        
        if(document.getElementById('xpBar')) {
            const percentage = Math.min((this.data.xp / xpNeeded) * 100, 100);
            document.getElementById('xpBar').style.width = `${percentage}%`;
        }
    }
};

// ==========================================
// QUEST SYSTEM
// ==========================================
const QuestSystem = {
    tasks: [],
    filter: 'all',
    init() {
        const saved = localStorage.getItem('SL_QUESTS');
        this.tasks = saved ? JSON.parse(saved) : [];
        this.render();
    },
    setFilter(mode) {
        this.filter = mode;
        this.render();
    },
    addTask() {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        const inp = document.getElementById('taskInput');
        const prio = document.getElementById('prioritySelect').value;
        const statSelect = document.getElementById('statSelect').value;
        if(!inp || !inp.value.trim()) return;
        const task = { id: Date.now(), text: inp.value.trim(), priority: prio, completed: false, stat: statSelect, createdAt: new Date().toISOString() };
        this.tasks.unshift(task);
        inp.value = '';
        this.save();
        this.render();
        Toast.show('Quest deployed to system window', 'success');
    },
    toggleTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return;
        const task = this.tasks[taskIndex];
        let xpReward = task.priority === 'high' ? 100 : task.priority === 'medium' ? 50 : 20;
        let goldReward = task.priority === 'high' ? 30 : task.priority === 'medium' ? 15 : 5;
        let authorityReward = task.priority === 'high' ? 10 : task.priority === 'medium' ? 5 : 2;

        if (!task.completed) {
            task.completed = true;
            if(window.PlayerState) {
                PlayerState.data.authority = (PlayerState.data.authority || 0) + authorityReward;
                PlayerState.addXP(xpReward);
                PlayerState.addGold(goldReward);
                PlayerState.addStat(task.stat || 'int', 1);
            }
            Toast.show(`Quest Cleared! +${xpReward} EXP`, 'success');
            if(window.SoundEffects) SoundEffects.playSuccess();
            if(typeof confetti === 'function') confetti({particleCount: 80, spread: 60, origin: {y: 0.7}, colors: ['#00f0ff','#9d4edd']});
        } else {
            task.completed = false;
            if(window.PlayerState) {
                PlayerState.data.authority = Math.max(0, (PlayerState.data.authority || 0) - authorityReward);
                PlayerState.addXP(-xpReward);
                PlayerState.addGold(-goldReward);
                if (PlayerState.data.gold < 0) PlayerState.data.gold = 0;
                PlayerState.addStat(task.stat || 'int', -1);
            }
            Toast.show(`Quest Reversed! Rewards Deducted.`, 'error');
            if(window.SoundEffects) SoundEffects.playSystemClick();
        }
        this.save();
        this.render();
    },
    deleteTask(id) {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    },
    render() {
        const container = document.getElementById('taskContainer');
        const titleEl = document.getElementById('taskListTitle');
        const backBtn = document.getElementById('backToAllBtn');
        if(!container) return;
        container.innerHTML = '';

        if (titleEl) {
            titleEl.textContent = this.filter === 'active' ? '⚔️ ACTIVE ENGAGEMENTS (Incomplete)' : '⚔️ Active Directives Log';
            titleEl.className = this.filter === 'active' 
                ? 'font-black text-sm text-amber-400 tracking-wide uppercase sys-font' 
                : 'font-black text-sm text-[var(--sys-cyan)] tracking-wide uppercase sys-font';
        }
        if (backBtn) {
            backBtn.classList.toggle('hidden', this.filter !== 'active');
        }

        let activeCount = 0; let completedCount = 0;

        const displayTasks = this.filter === 'active' 
            ? this.tasks.filter(t => !t.completed) 
            : this.tasks;

        if (displayTasks.length === 0) {
            const emptyMsg = this.filter === 'active' 
                ? '<p>[NO INCOMPLETE ENGAGEMENTS DETECTED]</p><p class="text-[10px] mt-2">All directives have been cleared.</p>'
                : '<p>[NO ACTIVE QUESTS DETECTED]</p>';
            container.innerHTML = `<div class="text-center py-10 opacity-30 sys-font">${emptyMsg}</div>`;
            this.updateStatsUI(0, 0, 0);
            return;
        }
        const statColors = { 'int': 'text-[var(--sys-cyan)]', 'str': 'text-rose-500', 'vit': 'text-emerald-500', 'agi': 'text-sky-400', 'sen': 'text-[var(--sys-purple)]' };
        displayTasks.forEach(task => {
            task.completed ? completedCount++ : activeCount++;
            const escapedText = task.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const div = document.createElement('div');
            div.className = `task-card flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm border-y border-y-slate-800 transition-all ${task.completed ? 'completed opacity-50' : ''}`;
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <button onclick="QuestSystem.toggleTask(${task.id})" class="w-6 h-6 rounded border-2 border-[var(--sys-cyan)] flex items-center justify-center hover:bg-[var(--sys-cyan)] hover:bg-opacity-20 transition-colors ${task.completed ? 'bg-[var(--sys-cyan)]' : ''}">
                        ${task.completed ? '<span class="text-black text-xs font-black">✓</span>' : ''}
                    </button>
                    <div>
                        <div class="font-bold text-white text-sm ${task.completed ? 'line-through text-slate-500' : ''}">${escapedText}</div>
                        <div class="flex gap-2 mt-1">
                            <span class="sys-font text-[10px] px-2 py-0.5 border border-slate-700 bg-black/50 ${statColors[task.stat || 'int']} uppercase tracking-widest">+1 ${(task.stat || 'int').toUpperCase()}</span>
                            <span class="sys-font text-[10px] px-2 py-0.5 border border-slate-700 bg-black/50 text-amber-400 uppercase tracking-widest">RANK: ${(task.priority || 'medium').toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <button onclick="QuestSystem.deleteTask(${task.id})" class="text-slate-600 hover:text-rose-500 transition-colors p-2">🗑️</button>
            `;
            container.appendChild(div);
        });
        const lethalityRate = Math.round((completedCount / this.tasks.length) * 100);
        if(window.PlayerState) {
            PlayerState.data.lethality = lethalityRate;
            PlayerState.save();
        }
        this.updateStatsUI(activeCount, this.tasks.length, lethalityRate);
    },
    updateStatsUI(active, all, lethality) {
        if(document.getElementById('cnt-active-val')) document.getElementById('cnt-active-val').textContent = active;
        if(document.getElementById('stat-lethality')) document.getElementById('stat-lethality').textContent = `${lethality}%`;
    },
    save() { localStorage.setItem('SL_QUESTS', JSON.stringify(this.tasks)); }
};

// ==========================================
// POMODORO TIMER
// ==========================================
const Pomodoro = {
    defaultTime: parseInt(localStorage.getItem('SL_SYS_TIMER')) || (5 * 3600),
    timeLeft: 0, timer: null, isRunning: false,
    init() { this.timeLeft = this.defaultTime; this.updateUI(); },
    saveSettings() {
        const h = parseInt(document.getElementById('inputHours').value) || 0;
        const m = parseInt(document.getElementById('inputMinutes').value) || 0;
        const tot = (h * 3600) + (m * 60);
        if (tot > 0) {
            this.defaultTime = tot;
            localStorage.setItem('SL_SYS_TIMER', this.defaultTime.toString());
            document.getElementById('timerModal').classList.add('hidden');
            clearInterval(this.timer); this.timeLeft = this.defaultTime; this.isRunning = false;
            this.toggle();
        }
    },
    toggle() {
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
        const btn = document.getElementById('timerBtn');
        const st = document.getElementById('timerStatus');
        if (this.isRunning) {
            clearInterval(this.timer);
            btn.textContent = 'START'; btn.classList.remove('bg-rose-600/30');
            st.textContent = 'PAUSED'; st.className = 'sys-font text-[9px] px-2 py-0.5 bg-amber-900 border border-amber-600 text-amber-300 uppercase';
        } else {
            if (this.timeLeft <= 0) this.timeLeft = this.defaultTime;
            this.timer = setInterval(() => { if (this.timeLeft > 0) { this.timeLeft--; this.updateUI(); } else { this.finish(); } }, 1000);
            btn.textContent = '⏸️'; btn.classList.add('bg-rose-600/30');
            st.textContent = 'IN COMBAT'; st.className = 'sys-font text-[9px] px-2 py-0.5 bg-rose-900 border border-rose-600 text-rose-300 uppercase animate-pulse';
        }
        this.isRunning = !this.isRunning;
    },
    reset() {
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
        clearInterval(this.timer);
        this.timeLeft = this.defaultTime; this.isRunning = false;
        const btn = document.getElementById('timerBtn'); btn.textContent = 'START'; btn.classList.remove('bg-rose-600/30');
        const st = document.getElementById('timerStatus');
        st.textContent = 'IDLE'; st.className = 'sys-font text-[9px] px-2 py-0.5 bg-slate-800 border border-slate-600 text-slate-300 uppercase';
        this.updateUI();
    },
    finish() {
        clearInterval(this.timer);
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSuccess();
        if (typeof confetti !== 'undefined') confetti({ particleCount: 100, colors: ['#00f0ff'] });
        this.reset();
    },
    updateUI() {
        const h = Math.floor(this.timeLeft / 3600).toString().padStart(2, '0');
        const m = Math.floor((this.timeLeft % 3600) / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        if(document.getElementById('timerDisplay')) document.getElementById('timerDisplay').textContent = `${h}:${m}:${s}`;
    }
};

const Milestone = {
    show(newLevel) {
        const modal = document.getElementById('milestoneModal');
        if (!modal) return;
        document.getElementById('milestoneOldLevel').textContent = newLevel - 1;
        document.getElementById('milestoneLevelText').textContent = newLevel;
        modal.classList.remove('hidden');
        if(window.SoundEffects) SoundEffects.playLevelUp();
        if(typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00f0ff', '#9d4edd', '#ffffff'] });
        }
    },
    hide() {
        document.getElementById('milestoneModal').classList.add('hidden');
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
    }
};

const Utils = {
    formatDecimalTime(dec) {
        const h = Math.floor(dec);
        const m = Math.floor((dec - h) * 60);
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    },
    getCurrentDecimalTime() {
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
    },
    getDayName(idx) {
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        return days[idx];
    }
};

// ==========================================
// PROGRAM DATA
// ==========================================
// ==========================================
// PROGRAM DATA (Mind Games & Neural System)
// ==========================================
const PROGRAM_DATA = {
week1: {
    id: 'week1',
    title: 'Integrated Operations Charter',
    version: 'v9.0',
    range: 'LVL 1 → 25',
    desc: 'Comprehensive Foundational Phase: Building the programming, physical, and spiritual base, establishing the full sovereign path.',
   schedule: [
  { 
    start: 5.0,  
    end: 6.5,  
    title: 'Protocol 01: Spiritual Anchoring & Quranic Recitation', 
    desc: 'Fajr prayer in congregation at the mosque + reading prayer remembrances and full morning Adhkar + memorizing or repeating the Holy Quran and reciting two full Hizbs with deep contemplation.' 
  },
  { 
    start: 6.5,  
    end: 8.5,  
    title: 'Protocol 02: Pure Front-End Architecture', 
    desc: 'Learn programming and Front-End web development focusing entirely on the core trio: HTML5, CSS3, and JavaScript to build advanced system interfaces. Sunday: learn HTML, Monday: learn CSS, Tuesday: learn JS, Wednesday: comprehensive review, Thursday: practical application on an integrated front-end project, Friday: project review, Saturday: rest or follow up as needed.' 
  },
  { 
    start: 8.5,  
    end: 10.0, 
    title: 'Protocol 03: AI Core Foundation (Python)', 
    desc: 'Studying Python and its programming applications, understanding algorithms and foundational data structures to launch into AI engineering.' 
  },
  { 
    start: 10.0, 
    end: 11.5, 
    title: 'Protocol 04: Data Analytics (Excel Mastery)', 
    desc: 'Learn advanced data analysis skills using pivot tables and mathematical formulas in Microsoft Excel and linking them to mechanisms for understanding the language of numbers in AI.' 
  },
  { 
    start: 11.5, 
    end: 13.0, 
    title: 'Protocol 05: English Linguistic Deepening', 
    desc: 'Dividing the session equally into three strict pillars: the first third for technical educational videos, the second third for listening immersion, and the third for reading and writing.' 
  },
  { 
    start: 13.0, 
    end: 14.0, 
    title: 'Protocol 06: Matrix Analytics (NumPy Engine)', 
    desc: 'Deep diving into the NumPy library for AI, studying multidimensional matrix processing and complex mathematical data analysis with high efficiency.' 
  },
  { 
    start: 14.0, 
    end: 15.5, 
    title: 'Protocol 07: Deep Recovery Break', 
    desc: 'Taking a long power nap or deep rest to recover brain cells and muscles (includes performing Dhuhr prayer and eating a protein-rich lunch).' 
  },
  { 
    start: 15.5, 
    end: 16.5, 
    title: 'Protocol 08 & 10: Asr Sync & Devotional Enlightenment', 
    desc: 'Performing Asr prayer on time with prayer remembrances and full evening Adhkar + listening to religious sermons to nourish the spiritual and moral side.' 
  },
  { 
    start: 16.5, 
    end: 17.5, 
    title: 'Protocol 09: Cognitive Evolution Lab', 
    desc: 'Raising fluid intelligence and isolating the mind by reading cultural books, playing tactical chess matches, or watching deep intellectual content (like Nasser Al-Aqueel and documentaries).' 
  },
  { 
    start: 17.5, 
    end: 19.0, 
    title: 'Protocol 11 & 13: Integrated Gym & Sports Alpha', 
    desc: 'Practicing home gym or fitness center exercises to build physical strength + refining skills and motor technique for favorite sports (football, basketball, etc.).' 
  },
  { 
    start: 19.0, 
    end: 21.0, 
    title: 'Protocol 12: Academic Experimental Curriculum', 
    desc: 'Rigorous academic study of core subjects for the Experimental Sciences certificate (Mathematics, Sciences, Physics) according to the periodic schedule to ensure absolute academic excellence.' 
  },
  { 
    start: 21.0, 
    end: 22.0, 
    title: 'Protocol 14: System Evaluation & Sleep Sequence', 
    desc: 'Reviewing daily sovereign system performance and updating task records for tomorrow + reading complete sleep Adhkar, and entering deep sleep to rest body and mind at exactly 10:00 PM.' 
  }
],
    days: {
    0: { 
      sport: '🏀 Basketball: Learn stationary shooting + learn ball control and dribbling in a stationary position', 
      ppl: 'Back & Biceps: Intense Back and Biceps Exercises', 
      cognitive: 'Digital Book Project: Session 01 for digital book creation and formatting', 
      academic: 'Core Subject 1: New Lesson' 
    },
    1: { 
      sport: '🥋 Brazilian Jiu-Jitsu 🇧🇷 [Grip claws and closed guard control: Collar & Sleeve and pulling the opponent to break their posture for 150 reps] + [Defensive wall and escaping side control hell: Bridging and Hip Escapes for 100 reps]', 
      ppl: 'Chest & Shoulders: Building upper, lower, and lateral chest muscles, regular mid-muscles, and shoulders', 
      cognitive: 'Chess & History: Learn tactical chess + watch a documentary (historical, political, scientific, or natural)', 
      academic: 'Core Subject 2: New Lesson' 
    },
    2: { 
      sport: '🏀 Basketball: Learn moving with the ball and controlling it + moving shots and rebounds + learn dynamic dribbling', 
      ppl: 'Legs & Triceps: Building and blasting thigh muscles + triceps', 
      cognitive: 'Intellectual Dev: Reading technical and cultural books (half an hour) + watching Nasser Al-Aqueel (half an hour)', 
      academic: 'Core Subject 3: New Lesson' 
    },
    3: { 
      sport: '⚽ Football Focus: Mastering dribbling skills + superior ball control + ball juggling and trapping', 
      ppl: 'Calves & Forearms: Targeted calf exercises + forearm exercises to increase grip strength', 
      cognitive: 'Sudoku & Docs: Playing Sudoku mind game + economic, tech, or investigative documentaries', 
      academic: 'Core Subject 1 Review: Comprehensive review and solving applications for Core Subject 1' 
    },
    4: { 
      sport: '🥋 Brazilian Jiu-Jitsu 🇧🇷 [Swift triple submission sequence: Consecutive quick attack Armbar -> Triangle -> Omoplata for 80 reps per side] + [Passing aggressive knee slice guard: Knee Slice Pass for 60 reps with Underhook control]', 
      ppl: 'Abs & Biceps Core: Isolation and shaping exercises for abs + biceps', 
      cognitive: 'Tactical Chess: Deepening chess strategies + watching Nasser Al-Aqueel intellectual content', 
      academic: 'Minor Electives: Studying and reviewing 3 very minor elective subjects to relieve routine pressure' 
    },
    5: { 
      sport: '🏃 Cardio Endurance: Free running for a distance ranging from 5 to 10 kilometers to increase respiratory efficiency', 
      ppl: 'Strategic Rest: Passive rest period and full muscle recovery for the young monarch to rebuild tissues', 
      cognitive: 'Digital Book Phase 2: Session 02 for creating, developing, and authoring the digital book', 
      academic: 'Standard Review: Reviewing Core Subject 2 + studying and reviewing 3 medium/regular subjects (not electives)' 
    },
    6: { 
      sport: '⚽ Football Combat: Deadly shooting skills with both feet + mastering trapping and taming the ball with both feet', 
      ppl: 'Lower Chest & Abs: Abs exercises + inner chest (the line between the two muscles) and lower chest muscle', 
      cognitive: 'Cognitive Boost: Watching self-development channels to stimulate awareness + playing complex mental Sudoku', 
      academic: 'Core Subject 3 Review: Reviewing and solidifying strengths for Core Subject 3' 
    }
  },
special: {
 days: {
  0: {
    title: 'Foundation Sunday',
    blocks: [
      { time: '05:00-06:30', title: 'Protocol 01: Spiritual Anchoring & Quranic Recitation', desc: 'Fajr prayer in congregation + Morning Adhkar + Quran memorization and recitation with deep contemplation.' },
      { time: '06:30-08:30', title: 'Protocol 02: Pure Front-End Architecture', desc: 'Learn programming and Front-End web development with absolute focus on HTML.' },
      { time: '08:30-10:00', title: 'Protocol 03: AI Core Foundation (Python)', desc: 'Studying Python and its programming applications, understanding algorithms and foundational data structures.' },
      { time: '10:00-11:30', title: 'Protocol 04: Data Analytics (Excel Mastery)', desc: 'Learn advanced data analysis skills using pivot tables and mathematical formulas in Microsoft Excel.' },
      { time: '11:30-13:00', title: 'Protocol 05: English Linguistic Deepening', desc: 'Dividing the session equally into three strict pillars: technical videos, listening, and reading/writing.' },
      { time: '13:00-14:00', title: 'Protocol 06: Matrix Analytics (NumPy Engine)', desc: 'Deep diving into the NumPy library for AI, studying multidimensional matrix processing.' },
      { time: '14:00-15:30', title: 'Protocol 07: Deep Recovery Break', desc: 'Power nap or deep rest to recover brain cells and muscles (includes Dhuhr prayer and protein lunch).' },
      { time: '15:30-16:30', title: 'Protocol 08 & 10: Asr Sync & Devotional Enlightenment', desc: 'Asr prayer on time with Adhkar + listening to religious sermons.' },
      { time: '16:30-17:30', title: 'Protocol 09: Cognitive Evolution Lab', desc: 'Digital Book Project (Session 01): Start creating and formatting the digital book to raise fluid intelligence.' },
      { time: '17:30-19:00', title: 'Protocol 11 & 13: Integrated Gym & Sports Alpha', desc: 'Intense back and biceps exercises + Basketball: stationary shooting and dribbling control.' },
      { time: '19:00-21:00', title: 'Protocol 12: Academic Experimental Curriculum', desc: 'Rigorous academic study for Core Subject 1 (New Lesson): Mathematics according to the curriculum.' },
      { time: '21:00-22:00', title: 'Protocol 14: System Evaluation & Sleep Sequence', desc: 'Reviewing daily system performance + sleep Adhkar, and entering deep sleep at exactly 10:00 PM.' }
    ]
  },
  1: {
    title: 'Fasting Protocol (Monday)',
    blocks: [
      { time: '02:45-05:00', title: 'Night Prayer and Suhoor', desc: 'Night prayer + protein-rich Suhoor + remembrance of Allah + quick mental review for the fasting day.' },
      { time: '05:00-06:30', title: 'Protocol 01: Spiritual Anchoring & Quranic Recitation', desc: 'Fajr prayer in congregation + Morning Adhkar + Quran memorization and recitation with deep contemplation.' },
      { time: '06:30-08:30', title: 'Protocol 02: Pure Front-End Architecture', desc: 'Learn programming and Front-End web development focusing on CSS rules and architecture.' },
      { time: '08:30-10:00', title: 'Protocol 03: AI Core Foundation (Python)', desc: 'Studying Python and its programming applications, understanding algorithms and foundational data structures.' },
      { time: '10:00-11:30', title: 'Protocol 04: Data Analytics (Excel Mastery)', desc: 'Learn advanced data analysis skills using pivot tables and mathematical formulas in Microsoft Excel.' },
      { time: '11:30-13:00', title: 'Protocol 05: English Linguistic Deepening', desc: 'Dividing the session equally into three strict pillars: technical videos, listening, and reading/writing.' },
      { time: '13:00-14:00', title: 'Protocol 06: Matrix Analytics (NumPy Engine)', desc: 'Deep diving into the NumPy library for AI, studying multidimensional matrix processing.' },
      { time: '14:00-15:30', title: 'Protocol 07: Deep Recovery Break', desc: 'Dhuhr prayer + rest + light nap dedicated to brain cell recovery for the fasting protocol.' },
      { time: '15:30-16:30', title: 'Protocol 08 & 10: Asr Sync & Devotional Enlightenment', desc: 'Asr prayer on time with Adhkar + listening to religious sermons.' },
      { time: '16:30-17:30', title: 'Protocol 09: Cognitive Evolution Lab', desc: 'Learn advanced tactical chess + watch a documentary to raise fluid intelligence.' },
      { time: '17:30-19:00', title: 'Protocol 11 & 13: Integrated Gym & Sports Alpha', desc: 'Chest and shoulders workout + Brazilian Jiu-Jitsu 🇧🇷 (Collar & Sleeve, Bridging and Hip Escapes).' },
      { time: '19:00-21:00', title: 'Protocol 12: Academic Experimental Curriculum', desc: 'Rigorous academic study for Core Subject 2 (New Lesson): Natural Sciences according to the curriculum.' },
      { time: '21:00-22:00', title: 'Protocol 14: System Evaluation & Sleep Sequence', desc: 'Reviewing daily system performance + sleep Adhkar, and entering deep sleep at exactly 10:00 PM.' }
    ]
  },
  2: {
    title: 'Momentum Tuesday',
    blocks: [
      { time: '05:00-06:30', title: 'Protocol 01: Spiritual Anchoring & Quranic Recitation', desc: 'Fajr prayer in congregation + Morning Adhkar + Quran memorization and recitation with deep contemplation.' },
      { time: '06:30-08:30', title: 'Protocol 02: Pure Front-End Architecture', desc: 'Learn programming and Front-End web development focusing on dynamic interactivity (JavaScript).' },
      { time: '08:30-10:00', title: 'Protocol 03: AI Core Foundation (Python)', desc: 'Studying Python and its programming applications, understanding algorithms and foundational data structures.' },
      { time: '10:00-11:30', title: 'Protocol 04: Data Analytics (Excel Mastery)', desc: 'Learn advanced data analysis skills using pivot tables and mathematical formulas in Microsoft Excel.' },
      { time: '11:30-13:00', title: 'Protocol 05: English Linguistic Deepening', desc: 'Dividing the session equally into three strict pillars: technical videos, listening, and reading/writing.' },
      { time: '13:00-14:00', title: 'Protocol 06: Matrix Analytics (NumPy Engine)', desc: 'Deep diving into the NumPy library for AI, studying multidimensional matrix processing.' },
      { time: '14:00-15:30', title: 'Protocol 07: Deep Recovery Break', desc: 'Power nap or deep rest to recover brain cells and muscles (includes Dhuhr prayer and protein lunch).' },
      { time: '15:30-16:30', title: 'Protocol 08 & 10: Asr Sync & Devotional Enlightenment', desc: 'Asr prayer on time with Adhkar + listening to religious sermons.' },
      { time: '16:30-17:30', title: 'Protocol 09: Cognitive Evolution Lab', desc: 'Raising fluid intelligence by reading cultural/tech books (half an hour) + Nasser Al-Aqueel content (half an hour).' },
      { time: '17:30-19:00', title: 'Protocol 11 & 13: Integrated Gym & Sports Alpha', desc: 'Blasting thigh muscles + triceps exercises + Basketball: moving control, shots, and dynamic dribbling.' },
      { time: '19:00-21:00', title: 'Protocol 12: Academic Experimental Curriculum', desc: 'Rigorous academic study for Core Subject 3 (New Lesson): Physics according to the curriculum.' },
      { time: '21:00-22:00', title: 'Protocol 14: System Evaluation & Sleep Sequence', desc: 'Reviewing daily system performance + sleep Adhkar, and entering deep sleep at exactly 10:00 PM.' }
    ]
  },
  3: {
    title: 'Mid-Week Grind',
    blocks: [
      { time: '05:00-06:30', title: 'Protocol 01: Spiritual Anchoring & Quranic Recitation', desc: 'Fajr prayer in congregation + Morning Adhkar + Quran memorization and recitation with deep contemplation.' },
      { time: '06:30-08:30', title: 'Protocol 02: Pure Front-End Architecture', desc: 'Comprehensive and intensive review of the core trio (HTML5, CSS3, JavaScript) to link components and solidify coding.' },
      { time: '08:30-10:00', title: 'Protocol 03: AI Core Foundation (Python)', desc: 'Studying Python and its programming applications, understanding algorithms and foundational data structures.' },
      { time: '10:00-11:30', title: 'Protocol 04: Data Analytics (Excel Mastery)', desc: 'Learn advanced data analysis skills using pivot tables and mathematical formulas in Microsoft Excel.' },
      { time: '11:30-13:00', title: 'Protocol 05: English Linguistic Deepening', desc: 'Dividing the session equally into three strict pillars: technical videos, listening, and reading/writing.' },
      { time: '13:00-14:00', title: 'Protocol 06: Matrix Analytics (NumPy Engine)', desc: 'Deep diving into the NumPy library for AI, studying multidimensional matrix processing.' },
      { time: '14:00-15:30', title: 'Protocol 07: Deep Recovery Break', desc: 'Power nap or deep rest to recover brain cells and muscles (includes Dhuhr prayer and protein lunch).' },
      { time: '15:30-16:30', title: 'Protocol 08 & 10: Asr Sync & Devotional Enlightenment', desc: 'Asr prayer on time with Adhkar + listening to religious sermons.' },
      { time: '16:30-17:30', title: 'Protocol 09: Cognitive Evolution Lab', desc: 'Playing Sudoku to train the mind + watching specialized documentaries (Economy & Tech or Investigative).' },
      { time: '17:30-19:00', title: 'Protocol 11 & 13: Integrated Gym & Sports Alpha', desc: 'Targeted calf exercises + forearm grip training + Football: mastering dribbling, ball control, and trapping.' },
      { time: '19:00-21:00', title: 'Protocol 12: Academic Experimental Curriculum', desc: 'Comprehensive review and intensive applications for Core Subject 1 (Math Review) to ensure complete retention.' },
      { time: '21:00-22:00', title: 'Protocol 14: System Evaluation & Sleep Sequence', desc: 'Reviewing daily system performance + sleep Adhkar, and entering deep sleep at exactly 10:00 PM.' }
    ]
  }
},
     4: {
  title: 'Achievement Thursday (Fasting and Diligence)',
  blocks: [
    { time: '02:45-05:00', title: 'Night Prayer and Suhoor', desc: 'Night prayer + protein-rich Suhoor + remembrance of Allah + quick mental review for discipline building.' },
    { time: '05:00-06:30', title: 'Protocol 01: Spiritual Anchoring & Quranic Recitation', desc: 'Fajr prayer in congregation + Morning Adhkar + new Quran memorization with deep contemplation.' },
    { time: '06:30-08:30', title: 'Religious Studies', desc: 'Studying Kitab at-Tawhid + mastering Tajweed rules and practical application of Islamic sciences.' },
    { time: '08:30-10:00', title: 'Study Marathon', desc: 'Strict academic focus on minor elective subjects using mind maps to ensure absolute excellence.' },
    { time: '10:00-11:30', title: 'Language Skills', desc: 'Comprehensive review of all English terms learned throughout the week, treating grammar as programming logic.' },
    { time: '11:30-13:30', title: 'Pure Front-End Architecture', desc: 'Intensive practical application on a complete front-end project (HTML5, CSS3, JavaScript).' },
    { time: '13:30-14:30', title: 'Abs & Biceps Core', desc: 'Isolation and shaping exercises for abs (Core) + blasting and isolating biceps to increase tactical physical strength.' },
    { time: '14:30-15:30', title: 'Asr Sync & Remembrance', desc: 'Performing Asr prayer on time with Adhkar during a quiet fasting recovery period for brain cells.' },
    { time: '15:30-17:00', title: 'Content Creation', desc: 'Engineering and creating advanced digital content for platforms (YouTube, Instagram, TikTok) focusing on monetization.' },
    { time: '17:00-18:00', title: 'Spiritual Balance', desc: 'Listening to humbling Quranic recitations + guided deep meditation, training to improve voice tone and depth.' },
    { time: '18:00-19:15', title: 'Cognitive Evolution Lab', desc: 'Tactical Chess session to deepen strategies + watching Nasser Al-Aqueel deep analytical content.' },
    { time: '19:15-20:45', title: '🥋 Brazilian Jiu-Jitsu 🇧🇷', desc: '[Swift triple submission sequence: Armbar -> Triangle -> Omoplata for 80 reps] + [Knee Slice Pass for 60 reps].' },
    { time: '20:45-21:30', title: 'Sports Analysis', desc: 'Visual tactical learning by watching and analyzing advanced basketball skills, movements, and techniques.' },
    { time: '21:30-22:00', title: 'System Evaluation & Sleep Sequence', desc: 'Reviewing daily system performance + sleep Adhkar, and entering deep sleep at exactly 10:00 PM.' }
  ]
},
   5: {
title: 'Creativity Friday',
blocks: [
{ time: '05:00-06:30', title: 'Spiritual Meditation', desc: 'Fajr prayer on time + Morning Adhkar + reciting and reflecting on Surah Al-Kahf to increase spiritual light.' },
{ time: '06:30-08:30', title: 'Core Discipline II', desc: 'Strict and intensive focus on reviewing and solving exercises for Core Subject 2 to ensure academic solidifying.' },
{ time: '08:30-10:30', title: 'Cinematic Editing & Reels', desc: 'Learning advanced video editing techniques focusing on Reels using CapCut, Adobe After Effects, or DaVinci Resolve.' },
{ time: '10:30-12:30', title: 'Cyber Defense & Security', desc: 'Studying and applying Ethical Hacking concepts and cyber security mechanisms to enhance tactical digital defense.' },
{ time: '12:30-14:30', title: 'Academic Balance', desc: 'Studying and reviewing 3 medium/regular subjects to maintain complete academic balance.' },
{ time: '14:30-15:15', title: 'Audio Meditation', desc: 'Harmonious listening to the Quran and guided deep meditation, focusing entirely on improving sovereign voice tone.' },
{ time: '15:15-16:00', title: 'Rest & Recovery', desc: 'Tactical nap and relaxation period to recharge mental and physical meters... rest, young monarch.' },
{ time: '16:00-16:30', title: 'Asr Sync & Remembrance', desc: 'Asr prayer on time with full evening Adhkar to secure the spiritual and psychological fortress.' },
{ time: '16:30-17:30', title: 'Pure Front-End Architecture', desc: 'Intensive practical application on a complete front-end project (HTML5, CSS3, JavaScript).' },
{ time: '17:30-18:30', title: 'Energy Generation', desc: 'Continuous targeted running for a full hour to raise fitness levels, cardio, and pump pure oxygen into the body.' },
{ time: '18:30-19:30', title: 'Tactical Football Analysis', desc: 'Professional visual learning by watching advanced football skills and analyzing player movements.' },
{ time: '19:30-20:30', title: 'Digital Book Phase 2', desc: 'Session 02 dedicated to authoring and formatting the digital book to raise creative expression.' },
{ time: '20:30-21:30', title: 'System Reward', desc: 'Full mental disconnect and system reward: Enjoying an anime episode, series, or movie for complete rest.' },
{ time: '21:30-22:00', title: 'System Review & Sleep Sequence', desc: 'Sleep Adhkar + running (System Review, Tactical Planning) protocol for weekly evaluation before sleeping at 10:00 PM.' }
]
},
 6: {
  title: 'Mastery Saturday',
  blocks: [
    { time: '05:00-06:30', title: 'Protocol 01: Spiritual Anchoring & Quranic Recitation', desc: 'Fajr prayer in congregation + Morning Adhkar + repeating memorized Quran with deep contemplation.' },
    { time: '06:30-08:30', title: 'Core Subject 3 Review', desc: 'Strict and intensive focus on reviewing strengths and solving applied problems for Core Subject 3.' },
    { time: '08:30-10:30', title: 'Cyber Defense & Security', desc: 'Studying and applying Ethical Hacking concepts and cyber security mechanisms to enhance tactical digital defense.' },
    { time: '10:30-12:30', title: 'Pure Front-End Architecture', desc: 'Intensive practical application on a complete front-end project (HTML5, CSS3, JavaScript).' },
    { time: '12:30-14:00', title: 'Cognitive Boost', desc: 'Watching self-development videos to stimulate awareness + playing complex mental Sudoku to increase cognitive flexibility.' },
    { time: '14:00-15:00', title: 'Auditory Meditation', desc: 'Harmonious listening to the Quran and meditation, with strict focus on voice tone modification exercises.' },
    { time: '15:00-16:00', title: 'Lower Chest & Abs', desc: 'Isolation exercises for Abs + high focus on inner chest and lower chest muscles to build a symmetrical body.' },
    { time: '16:00-17:30', title: '⚽ Football Combat', desc: 'Developing football skills: Intensive training on deadly shooting with both feet + precise ball trapping under pressure.' },
    { time: '17:30-18:00', title: 'Asr Sync & Evening Remembrance', desc: 'Asr prayer on time with full evening Adhkar to protect and fortify the system\'s spiritual energy.' },
    { time: '18:00-19:30', title: 'Language Skills', desc: 'Comprehensive review of all English terms learned throughout the week, treating grammar as programming logic.' },
    { time: '19:30-20:30', title: 'Academic Balance', desc: 'Studying and reviewing a medium subject to maintain a balanced academic excellence line.' },
    { time: '20:30-21:15', title: '🥋 BJJ Tactical Analysis', desc: 'Visual tactical learning by watching Brazilian Jiu-Jitsu (BJJ) matches to understand advanced submission strategies.' },
    { time: '21:15-21:45', title: 'Maximum Stimulation', desc: 'Full stretching and elongation exercises for muscle flexibility + organized preparation for deep rest.' },
    { time: '21:45-22:00', title: 'Sleep Sequence & Remembrance', desc: 'Full sleep Adhkar, closing all active processes to enter deep sleep at exactly 10:00 PM.' }
  ]
}
    }
    
},
 week2: {
    id: 'week2',
    title: 'System Update 8.0 — Infinity',
    version: '600',
    range: 'LVL 450 → 600',
        desc: 'Phase of Complete Sovereignty: Integrating chess logic into AI Agents, explosive running, and independent tactical operations.',

    schedule: [
      { start: 2.75, end: 5.0,  title: 'Night Prayer & Suhoor',    desc: 'Qiyam + Protein Suhoor + Adhkar + Mental Review' },
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session',        desc: 'Fajr + Adhkar + Recitation (Odd: Review / Even: New) + Stretching exercises' },
      { start: 6.0,  end: 8.5,  title: 'Deep Programming',         desc: 'AiMoha (Python/JS) — Chess Logic into AI Agents / Backend architecture development' },
      { start: 8.5,  end: 10.5, title: 'AI Academy',               desc: 'Advanced ML + LLMs + Algorithm App / Machine Learning courses' },
      { start: 10.5, end: 12.0, title: 'English Mastery',         desc: 'Lex Fridman Podcast + Tech Terms + Shadowing / Deep tech explanations and vocabulary' },
      { start: 12.0, end: 13.0, title: 'Applied Laboratory', desc: 'Grand Rest + Applied Laboratory / Real AI Projects + Systems Integration' },
      { start: 13.0, end: 15.0, title: 'Grand Rest + Applied Laboratory',       desc: 'Real AI Projects + Deep Learning & Neural Networks courses + Dhuhr + Intense Protein Lunch + Nap' },
      { start: 15.0, end: 16.5, title: 'PPL Preparation',          desc: 'Push(Handstand)/Pull(Explosive)/Legs(Jump) + Calisthenics' },
      { start: 16.5, end: 17.5, title: 'Running Block / Relaxation',            desc: '1 Hour Run (Wolfs Law Activation) / Psychological and physical relaxation' },
      { start: 17.5, end: 19.5, title: 'Academic Focus',           desc: 'Math/Science/Physics curriculum + Light Dinner' },
      { start: 19.5, end: 20.5, title: 'Team Competitions',        desc: 'Full Matches: Basketball/Football (High Intensity) / Reading + Docs + Mind games' },
      { start: 20.5, end: 21.5, title: 'Mental Elevation',         desc: 'Chess/Sudoku + Digital Books + Tech Docs' },
      { start: 21.5, end: 22.0, title: 'System Prep',              desc: 'Tomorrow Planning + Sleep Adhkar + Shutdown' }
    ],
    days: {
      0: { sport: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊', ppl: 'Pull (Explosive)', cognitive: 'Programming + AI (Chess Logic) / Digital Book Session 1', academic: 'Mathematics' },
      1: { sport: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊', ppl: 'Legs (Jumps/Wolf)', cognitive: 'Chess (AI Agent Analysis) / Barbering & Magic Tricks + Docs', academic: 'Natural Sciences' },
      2: { sport: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊', ppl: 'Push (Handstand)', cognitive: 'Programming + AI / Self-Development Reading', academic: 'Physics' },
      3: { sport: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊', ppl: 'Pull & Abs/Triceps', cognitive: 'Hard Sudoku (Error Tracking) / Dual N-Back + Docs', academic: 'Math Review' },
      4: { sport: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊', ppl: 'Intense Legs (Jumps)', cognitive: 'Islamic Studies (Tawhid/Tajweed) / Barbering & Magic Tricks', academic: 'Islamic/History/Geo' },
      5: { sport: 'Calm Walk (Recovery) / 🏃 1-Hour Run', ppl: 'Push (Handstand)', cognitive: 'Dual N-Back + Digital Book Check', academic: 'Science Review' },
      6: { sport: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊', ppl: 'Abs (Six-pack) & Triceps', cognitive: 'Ethical Hacking + Calibration / Weekly Evaluation', academic: 'Physics Review' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor', desc: 'Night Prayer + Protein-Rich Suhoor + Remembrance of Allah + Quick Mental Review' },
          { time: '05:00-06:30', title: 'Quran Session', desc: 'Recitation and Memorization of the Holy Quran (1.5 Hours)' },
          { time: '06:30-09:30', title: 'Religious Studies', desc: 'Riyadh as-Salihin + Al-Bidayah wa\'n-Nihayah + 40 Nawawi (3 Hours)' },
          { time: '09:30-11:30', title: 'Study Marathon', desc: 'History, Geography, and French using Mind Maps' },
          { time: '11:30-13:30', title: 'Language Skills', desc: 'Reviewing English Terminology and Grammar as Software Logic' },
          { time: '13:30-15:00', title: 'Website Development', desc: 'Developing and Monetizing Websites' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building', desc: 'Leg Muscles (Thighs/Calves) + Abdominal & Muscle Heads' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊' },
          { time: '18:30-19:30', title: 'Content Creation', desc: 'Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Spiritual Balance', desc: 'Listening to the Quran + Meditation and Voice Tone' },
          { time: '20:30-22:00', title: 'Mindset and Crafts', desc: 'Self-Development + Barbering 🪒 & Magic Tricks 🃏♣️' }
        ]
      },
      5: {
        title: 'Creativity Friday',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation', desc: 'Surah Al-Kahf + Morning Adhkar + Natural Sciences Review' },
          { time: '08:00-10:00', title: 'Mind Reset', desc: 'Preparing for Video Editing (Montage)' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology', desc: 'Learning Ethical Hacking + Study Marathon for Languages and Islamic Studies using Mind Maps' },
          { time: '14:00-15:00', title: 'Audio Meditation', desc: 'Listening to the Holy Quran and Meditation (includes voice tone improvement)' },
          { time: '15:00-16:00', title: 'Physical Preparation', desc: 'Push-ups (Chest and Shoulders)' },
          { time: '16:00-17:00', title: 'Website Management', desc: 'Following Up on Completed Website Projects' },
          { time: '17:00-18:30', title: 'Energy Generation', desc: 'One-hour run (Unless swimming later)' },
          { time: '18:30-19:30', title: 'Energy Generation', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning', desc: 'Self-Development + Updating "Hard Tasks" List + Viewing informative content' }
        ]
      },
      6: {
        title: 'Mastery Saturday',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus', desc: 'Physics Review + New Quran Memorization (5 Hours)' },
          { time: '10:00-14:00', title: 'Technical Immersion', desc: 'Advanced Ethical Hacking + English Mastery (4 Hours) + Philosophy' },
          { time: '14:00-15:00', title: 'Crafts', desc: 'Barbering 🪒 & Magic Tricks 🃏♣️' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy', desc: 'Physical Exercises: Abs (Six-pack) and Triceps' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc)' },
          { time: '17:00-18:30', title: 'Competitive Sports', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊' },
          { time: '18:30-19:30', title: 'Digital Arch & Energy Generation', desc: 'Football: Unleashing full physical energy on the pitch' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning', desc: 'Self-Development and Weekly Evaluation' }
        ]
      }
    }
},
week3: {
    id: 'week3',
    title: 'System Update 10.0 — Infinity',
    version: '800',
    range: 'LVL 600 → 800',
        desc: 'Advanced Technical Immersion Phase: Building Frontend and Backend architectures, Deep Learning and Neural Networks.',

    schedule: [
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session',        desc: 'Recitation + Fajr + Adhkar + Stretching exercises' },
      { start: 6.0,  end: 8.5,  title: 'Advanced Programming',         desc: 'Python/JS Projects - Architecture & Development (Frontend + Backend)' },
      { start: 8.5,  end: 10.5, title: 'AI Academy', desc: 'Deep Learning & Neural Networks / Machine Learning' },
      { start: 10.5, end: 12.0, title: 'English Mastery',        desc: 'Deep tech explanations + vocabulary for practical building' },
      { start: 12.0, end: 13.0, title: 'Rest & Useful Learning',              desc: 'Blender 3D Graphics Courses / Deep Learning' },
      { start: 13.0, end: 15.0, title: 'Grand Rest + Useful Learning', desc: 'Blender 3D Graphics Courses + Dhuhr + Protein Lunch + Nap' },
      { start: 15.0, end: 16.5, title: 'PPL & Calisthenics', desc: 'Push/Pull/Legs exercises + Calisthenics' },
      { start: 16.5, end: 17.5, title: 'Rest & Dinner',       desc: 'Recovery from fatigue' },
      { start: 17.5, end: 19.5, title: 'Academic Focus',          desc: 'Curriculum: Mathematics, Sciences, Physics' },
      { start: 19.5, end: 20.5, title: 'Mental & Physical Dev',  desc: 'Reading + Documentaries + Mind games + Physical Rest' },
      { start: 20.5, end: 22.0, title: 'System Prep',              desc: 'Tomorrow Planning + Evening Adhkar + Muscle/Mind Relaxation' }
    ],
    days: {
      0: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Pull (Back & Biceps)', cognitive: 'Digital Book Session 1', academic: 'Mathematics' },
      1: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Push (Chest upper/side/normal)', cognitive: 'Learn Music (Guitar/Piano) 💎 + Docs', academic: 'Natural Sciences' },
      2: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Pull (Back & Triceps)', cognitive: 'Reading Books + Self-Development', academic: 'Physics' },
      3: { sport: 'Basketball 🏀 / Football ⚽ / 1-Hour Run 🏃', ppl: 'Legs (Front & Calves)', cognitive: 'Dual N-Back + Docs', academic: 'Math Review' },
      4: { sport: 'Basketball 🏀 / Football ⚽ / 1-Hour Run 🏃', ppl: 'Abs & Biceps', cognitive: 'Learn Music (Guitar/Piano) 💎 + Self-Development', academic: 'Islamic/History/Geo' },
      5: { sport: 'Rest & 1-Hour Run 🏃', ppl: 'Push (Chest inner/pelvis/lower)', cognitive: 'Dual N-Back + Book Review', academic: 'Science Review' },
      6: { sport: 'Basketball 🏀 / Football ⚽ / 1-Hour Run 🏃', ppl: 'Abs (Six-pack) & Triceps', cognitive: 'Dual N-Back + Weekly Evaluation + FL Studio', academic: 'Physics Review' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor', desc: 'Night Prayer + Protein-Rich Suhoor + Remembrance of Allah + Quick Mental Review' },
          { time: '05:00-06:30', title: 'Quran Session', desc: 'Recitation and Memorization of the Holy Quran (1.5 Hours)' },
          { time: '06:30-09:30', title: 'Religious Studies', desc: 'Aqidah + Riyadh as-Salihin + Al-Bidayah wa\'n-Nihayah + 40 Nawawi (3 Hours)' },
          { time: '09:30-11:30', title: 'Study Marathon', desc: 'History, Geography, and French using Mind Maps' },
          { time: '11:30-13:30', title: 'Language Skills', desc: 'Reviewing English Terminology and Grammar as Software Logic' },
          { time: '13:30-15:00', title: 'Website Development', desc: 'Developing and Monetizing Websites' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building', desc: 'Leg Muscles (Thighs/Calves) + Abdominal & Muscle Heads' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 or Basketball 🏀' },
          { time: '18:30-19:30', title: 'Content Creation', desc: 'Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Study Marathon', desc: 'History, Geography, and French using Mind Maps' },
          { time: '20:30-22:00', title: 'Crafts', desc: 'Learn Music (Guitar/Piano) 💎' }
        ]
      },
      5: {
        title: 'Creativity Friday',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation', desc: 'Surah Al-Kahf + Morning Adhkar + Natural Sciences Review' },
          { time: '08:00-10:00', title: 'Mind Reset', desc: 'Preparing for Video Editing (Montage)' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology', desc: 'Learning Ethical Hacking + Study Marathon using Mind Maps' },
          { time: '14:00-15:00', title: 'Audio Meditation', desc: 'Listening to the Holy Quran and Meditation' },
          { time: '15:00-16:00', title: 'Physical Preparation', desc: 'Push-ups (Chest and Shoulders)' },
          { time: '16:00-17:00', title: 'Website Management', desc: 'Following Up on Completed Website Projects' },
          { time: '17:00-18:30', title: 'Energy Generation', desc: 'One-hour run (Unless swimming later)' },
          { time: '18:30-19:30', title: 'Energy Generation', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning', desc: 'Self-Development + Updating "Hard Tasks" List' }
        ]
      },
      6: {
        title: 'Mastery Saturday',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus', desc: 'Physics Review + New Quran Memorization (5 Hours)' },
          { time: '10:00-14:00', title: 'Technical Immersion / FL Studio', desc: 'Ethical Hacking + FL Studio (Session 1) + English Mastery (4 Hours) + Philosophy' },
          { time: '14:00-15:00', title: 'Crafts / FL Studio', desc: 'Learn FL Studio (Session 2)' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy', desc: 'Physical Exercises: Abdominal Exercises (Six-pack) and Triceps' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc)' },
          { time: '17:00-18:30', title: 'Competitive Sports', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 or Basketball 🏀' },
          { time: '18:30-19:30', title: 'Digital Architecture', desc: 'System Programming and Web Project Monitoring & Updates' },
          { time: '19:30-20:30', title: 'Calibration', desc: 'Sudoku + System Calibration & Comprehensive Review... Weekly Evaluation' },
          { time: '20:30-22:00', title: 'Maximum Stimulation', desc: 'Stretching Workouts + Sleep Preparation and visual learning (Sports)' }
        ]
      }
    }
},
week4: {
    id: 'week4',
    title: 'System Update 11.0 — Infinity',
    version: '1000',
    range: 'LVL 800 → 1000',
        desc: 'Spiritual and Technical Mastery Phase: Focus on Aqidah and Tawhid, Applied Technical Lab, and full mastery of languages/skills.',

    schedule: [
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session',        desc: 'Recitation + Fajr + Adhkar + Stretching exercises' },
      { start: 6.0,  end: 8.5,  title: 'Advanced Programming',         desc: 'Kitab at-Tawhid and Aqidah' },
      { start: 8.5,  end: 10.5, title: 'AI Academy & Tech Lab', desc: 'Applied Technical Laboratory' },
      { start: 10.5, end: 12.0, title: 'English Mastery',        desc: 'Deep tech explanations + practical building (Move to another language if mastered)' },
      { start: 12.0, end: 13.0, title: 'Rest & Useful Learning',              desc: 'Blender 3D Graphics Courses / Deep Learning' },
      { start: 13.0, end: 15.0, title: 'Grand Rest + Useful Learning', desc: 'Blender 3D Graphics Courses + Dhuhr + Protein Lunch + Nap' },
      { start: 15.0, end: 16.5, title: 'PPL & Calisthenics', desc: 'Push/Pull/Legs exercises + Calisthenics' },
      { start: 16.5, end: 17.5, title: 'Rest & Dinner',       desc: 'Recovery from fatigue' },
      { start: 17.5, end: 19.5, title: 'Academic Focus',          desc: 'Curriculum: Mathematics, Sciences, Physics' },
      { start: 19.5, end: 20.5, title: 'Mental & Physical Dev',  desc: 'Reading + Documentaries + Mind games + Physical Rest' },
      { start: 20.5, end: 22.0, title: 'System Prep & Pelvic Stretching',              desc: 'Tomorrow Planning + Evening Adhkar + Muscle Relaxation + Opening the pelvis' }
    ],
    days: {
      0: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Pull (Back & Biceps)', cognitive: 'Digital Book Session 1 / FL Studio for Quran', academic: 'Mathematics' },
      1: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Push (Chest upper/side/normal)', cognitive: 'Documentary / FL Studio for Quran', academic: 'Natural Sciences' },
      2: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Pull (Back & Triceps)', cognitive: 'Reading Books + Self-Development', academic: 'Physics' },
      3: { sport: 'Basketball 🏀 / Football ⚽ / 1-Hour Run 🏃', ppl: 'Legs (Front & Calves)', cognitive: 'Documentary', academic: 'Math Review' },
      4: { sport: 'Basketball 🏀 / Football ⚽ / 1-Hour Run 🏃', ppl: 'Abs & Biceps', cognitive: 'Self-Development + FL Studio for Quran', academic: 'Islamic/History/Geo' },
      5: { sport: 'Rest & 1-Hour Run 🏃', ppl: 'Push (Chest inner/pelvis/lower)', cognitive: 'Dual N-Back + Book Review', academic: 'Science Review' },
      6: { sport: 'Basketball 🏀 / Football ⚽ / 1-Hour Run 🏃', ppl: 'Abs (Six-pack) & Triceps', cognitive: 'Dual N-Back + Weekly Evaluation + FL Studio for Quran', academic: 'Physics Review' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor', desc: 'Night Prayer + Protein-Rich Suhoor + Remembrance of Allah + Quick Mental Review' },
          { time: '05:00-06:30', title: 'Quran Session', desc: 'Recitation and Memorization of the Holy Quran (1.5 Hours)' },
          { time: '06:30-09:30', title: 'Religious Studies', desc: 'Riyadh as-Salihin + Al-Bidayah wa\'n-Nihayah + 40 Nawawi (3 Hours)' },
          { time: '09:30-11:30', title: 'Study Marathon', desc: 'History, Geography, and French using Mind Maps (Session 1)' },
          { time: '11:30-13:30', title: 'Language Skills', desc: 'Reviewing English Terminology and Grammar as Software Logic' },
          { time: '13:30-15:00', title: 'Website Development', desc: 'Developing and Monetizing Websites' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building', desc: 'Leg Muscles (Thighs/Calves) + Abdominal & Muscle Heads' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 or Basketball 🏀' },
          { time: '18:30-19:30', title: 'Content Creation', desc: 'Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Study Marathon', desc: 'History, Geography, and French using Mind Maps (Session 2)' },
          { time: '20:30-22:00', title: 'Crafts / FL Studio & Pelvic Stretching', desc: 'FL Studio for Quran + Opening the pelvis' }
        ]
      },
      5: {
        title: 'Creativity Friday',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation', desc: 'Surah Al-Kahf + Morning Adhkar + Natural Sciences Review' },
          { time: '08:00-10:00', title: 'Mind Reset', desc: 'Preparing for Video Editing (Montage)' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology', desc: 'Learning Ethical Hacking + Study Marathon using Mind Maps' },
          { time: '14:00-15:00', title: 'Audio Meditation', desc: 'Listening to the Holy Quran and Meditation (includes voice tone improvement)' },
          { time: '15:00-16:00', title: 'Physical Preparation', desc: 'Push-ups (Chest and Shoulders)' },
          { time: '16:00-17:00', title: 'Website Management', desc: 'Following Up on Completed Website Projects' },
          { time: '17:00-18:30', title: 'Energy Generation', desc: 'One-hour run (Unless swimming later)' },
          { time: '18:30-19:30', title: 'Energy Generation', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊' },
          { time: '19:30-20:30', title: 'System Review & Pelvic Stretching', desc: 'Self-Development + Updating "Hard Tasks" List + Opening the pelvis' }
        ]
      },
      6: {
        title: 'Mastery Saturday',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus', desc: 'Physics Review + New Quran Memorization (5 Hours)' },
          { time: '10:00-14:00', title: 'Technical Immersion / FL Studio', desc: 'Ethical Hacking + FL Studio (Session 1) + English Mastery (4 Hours) + Philosophy' },
          { time: '14:00-15:00', title: 'Crafts / FL Studio for Quran', desc: 'Learn FL Studio (Session 2)' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy', desc: 'Physical Exercises: Abdominal Exercises (Six-pack) and Triceps' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc)' },
          { time: '17:00-18:30', title: 'Competitive Sports', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 or Basketball 🏀' },
          { time: '18:30-19:30', title: 'Digital Architecture', desc: 'System Programming and Web Project Monitoring & Updates' },
          { time: '19:30-20:30', title: 'Calibration', desc: 'Sudoku + System Calibration & Comprehensive Review... Weekly Evaluation' },
          { time: '20:30-22:00', title: 'Maximum Stimulation & Pelvic Stretching', desc: 'Stretching Workouts + Sleep Preparation and visual learning (Sports) + Opening the pelvis' }
        ]
      }
    }
},
week5: {
    id: 'week5',
    title: 'System Update 1000.0 — Infinity',
    version: '∞',
    range: 'LVL 1000 → ∞',
        desc: 'Phase of Absolute Sovereignty and Complete Freedom: You now control the system, choose your own programs, and manage affairs independently.',

    schedule: [
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session',        desc: 'Recitation + Fajr + Adhkar + Stretching exercises' },
      { start: 6.0,  end: 8.5,  title: '???',                                        desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch)' },
      { start: 8.5,  end: 10.5, title: '???',                                        desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch)' },
      { start: 10.5, end: 12.0, title: 'English Mastery',        desc: 'Deep tech explanations + practical building (Move to another language if mastered)' },
      { start: 12.0, end: 13.0, title: ' ??? ',              desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch)' },
      { start: 13.0, end: 15.0, title: '??? + Grand Rest',                                        desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch)' },
      { start: 15.0, end: 16.5, title: 'PPL & Calisthenics', desc: 'Push/Pull/Legs exercises + Calisthenics' },
      { start: 16.5, end: 17.5, title: 'Rest & Dinner',       desc: 'Recovery from fatigue' },
      { start: 17.5, end: 19.5, title: 'Academic Focus',          desc: 'Curriculum: Mathematics, Sciences, Physics' },
      { start: 19.5, end: 20.5, title: '???',                                        desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch)' },
      { start: 20.5, end: 22.0, title: 'System Prep & Pelvic Stretching',              desc: 'Tomorrow Planning + Evening Adhkar + Muscle Relaxation + Opening the pelvis' }
    ],
    days: {
      0: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Pull (Back & Biceps)', cognitive: 'Digital Book / Free choice (You have the freedom to choose, young Monarch)', academic: 'Mathematics' },
      1: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Push (Chest upper/side/normal)', cognitive: 'Free choice from previous programs (You have the freedom to choose, young Monarch)', academic: 'Natural Sciences' },
      2: { sport: 'Swimming 🏊 / Muay Thai 🥊 / Jiu-Jitsu 🥋', ppl: 'Pull (Back & Triceps)', cognitive: 'Free choice from previous programs (You have the freedom to choose, young Monarch)', academic: 'Physics' },
      3: { sport: 'Basketball 🏀 / Football ⚽ / Cycling 🚴', ppl: 'Legs (Front & Calves)', cognitive: 'Free choice from previous programs (You have the freedom to choose, young Monarch)', academic: 'Math Review' },
      4: { sport: 'Basketball 🏀 / Football ⚽ / Duel or horseback riding 🤺 🏇', ppl: 'Abs & Biceps', cognitive: 'Free choice from previous programs (You have the freedom to choose, young Monarch)', academic: 'Islamic/History/Geo' },
      5: { sport: 'Rest & 1-Hour Run 🏃', ppl: 'Push (Chest inner/pelvis/lower)', cognitive: 'Free choice from previous programs (You have the freedom to choose, young Monarch)', academic: 'Science Review' },
      6: { sport: 'Basketball 🏀 / Football ⚽ / Karate 🐉 👘', ppl: 'Abs (Six-pack) & Triceps', cognitive: 'Free choice from previous programs (You have the freedom to choose, young Monarch)', academic: 'Physics Review' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor', desc: 'Night Prayer + Protein-Rich Suhoor + Remembrance of Allah + Quick Mental Review' },
          { time: '05:00-06:30', title: 'Quran Session', desc: 'Recitation and Memorization of the Holy Quran (1.5 Hours)' },
          { time: '06:30-09:30', title: '???', desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch)' },
          { time: '09:30-11:30', title: 'Study Marathon', desc: 'History, Geography, and French using Mind Maps (Session 1)' },
          { time: '11:30-13:30', title: 'Language Skills', desc: 'Reviewing English Terminology and Grammar as Software Logic' },
          { time: '13:30-15:00', title: 'Website Development', desc: 'Developing and Monetizing Websites' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building', desc: 'Leg Muscles (Thighs/Calves) + Abdominal & Muscle Heads' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 or Basketball 🏀 (Free choice, young Monarch)' },
          { time: '18:30-19:30', title: 'Content Creation', desc: 'Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Study Marathon', desc: 'History, Geography, and French using Mind Maps (Session 2)' },
          { time: '20:30-22:00', title: '??? & Pelvic Stretching', desc: 'Free choice (Preferably review a scientific subject) + Opening the pelvis' }
        ]
      },
      5: {
        title: 'Creativity Friday',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation', desc: 'Surah Al-Kahf + Morning Adhkar + Natural Sciences Review' },
          { time: '08:00-10:00', title: 'Mind Reset', desc: 'Preparing for Video Editing (Montage)' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology', desc: 'Learning Ethical Hacking + Study Marathon using Mind Maps' },
          { time: '14:00-15:00', title: 'Audio Meditation', desc: 'Listening to the Holy Quran and Meditation (includes voice tone improvement)' },
          { time: '15:00-16:00', title: 'Physical Preparation', desc: 'Push-ups (Chest and Shoulders)' },
          { time: '16:00-17:00', title: 'Website Management', desc: 'Following Up on Completed Website Projects' },
          { time: '17:00-18:30', title: 'Important Scientific Subject Exercises', desc: '' },
          { time: '18:30-19:30', title: 'Energy Generation', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 (Free choice, young Monarch)' },
          { time: '19:30-20:30', title: '??? & Pelvic Stretching', desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch) + Opening the pelvis' }
        ]
      },
      6: {
        title: 'Mastery Saturday',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus', desc: 'Physics Review + New Quran Memorization (5 Hours)' },
          { time: '10:00-14:00', title: 'Technical Immersion / FL Studio', desc: 'Ethical Hacking + Important Scientific Subject Exercises + English Mastery (4 Hours) + Philosophy' },
          { time: '14:00-15:00', title: 'Crafts / FL Studio for Quran', desc: 'Important Scientific Subject Exercises (Session 2)' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy', desc: 'Physical Exercises: Abdominals (Six-pack) and Triceps' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc)' },
          { time: '17:00-18:30', title: 'Competitive Sports', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 or Basketball 🏀 (Free choice, young Monarch)' },
          { time: '18:30-19:30', title: 'Digital Architecture', desc: 'System Programming and Web Project Monitoring & Updates' },
          { time: '19:30-20:30', title: '???', desc: 'Free choice from previous programs (You have the freedom to choose, young Monarch)' },
          { time: '20:30-22:00', title: 'Maximum Stimulation & Pelvic Stretching', desc: 'Stretching Workouts + Sleep Preparation and visual learning (Sports) + Opening the pelvis' }
        ]
      }
    }
}
};

// ==========================================
// SOVEREIGN SCHEDULES MATRIX
// ==========================================
const SovereignSchedules = {
    getTier(level) {
        if (level >= 1 && level <= 70) return "tier_1_70";
        if (level > 70 && level <= 130) return "tier_70_130";
        if (level > 130 && level <= 180) return "tier_130_180";
        if (level > 180 && level <= 250) return "tier_180_250";
        if (level > 250 && level <= 320) return "tier_250_320";
        if (level > 320 && level <= 400) return "tier_320_400";
        if (level > 400 && level <= 450) return "tier_400_450";
        if (level > 450) return "tier_infinity";
        return "tier_1_70";
    },
    xpRules: { coding_ai: 30, sports: 20, languages_books: 10, dungeons: 10 }
};

// ==========================================
// SOVEREIGN ENGINE
// ==========================================
const SovereignEngine = {
    state: {
        get playerLevel() { return PlayerState.data.level || 1; },
        get playerXP() { return PlayerState.data.xp || 0; },
        get playerGold() { return PlayerState.data.gold || 0; },
        activeTitle: localStorage.getItem('sovereign_title') || "[???]",
        activeQuest: JSON.parse(localStorage.getItem('sovereign_active_quest')) || null
    },
    config: { 
        weights: { coding_ai: 30, sports: 20, languages_books: 10, dungeons: 10 }, 
        penaltyXP: 5, 
        xpPerLevelBase: 100 
    },
    
    init() {
        if (!window.Utils) {
            window.Utils = {
                formatDecimalTime(dec) {
                    const h = Math.floor(dec);
                    const m = Math.floor((dec - h) * 60);
                    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                },
                getCurrentDecimalTime() {
                    const now = new Date();
                    return now.getHours() + now.getMinutes() / 60;
                }
            };
        }

        if (!localStorage.getItem('sovereign_program_data') && typeof PROGRAM_DATA !== 'undefined') {
            localStorage.setItem('sovereign_program_data', JSON.stringify(PROGRAM_DATA));
        }

        this.checkActiveQuestOnLoad();
        this.runTimeScheduleEngine();
        setInterval(() => this.runTimeScheduleEngine(), 60000);
    },
    
    parseTimeToDecimal(timeStr) {
        if (!timeStr || !timeStr.includes(':')) return 0;
        const parts = timeStr.trim().split(':');
        return (parseInt(parts[0], 10) || 0) + ((parseInt(parts[1], 10) || 0) / 60);
    },

    runTimeScheduleEngine() {
        const now = new Date();
        const day = now.getDay();
        const currentTimeDecimal = Utils.getCurrentDecimalTime();
        
        const activeProgramId = localStorage.getItem('sovereign_active_program') || 'week1';
        let allPrograms = null;
        
        try {
            allPrograms = JSON.parse(localStorage.getItem('sovereign_program_data'));
        } catch(e) {}
        
        if (!allPrograms && typeof PROGRAM_DATA !== 'undefined') {
            allPrograms = PROGRAM_DATA;
        }
        
        if (!allPrograms || !allPrograms[activeProgramId]) return;
        const prog = allPrograms[activeProgramId];
        
        let currentBlock = null;
        let blocks = [];
        
        if (prog.special && prog.special[day] && prog.special[day].blocks) {
            blocks = prog.special[day].blocks.map(b => {
                const timeParts = b.time.split('-');
                return {
                    start: this.parseTimeToDecimal(timeParts[0]),
                    end: this.parseTimeToDecimal(timeParts[1]),
                    title: b.title,
                    desc: b.desc,
                    timeStr: b.time
                };
            });
        } else if (prog.schedule) {
            blocks = prog.schedule.map(s => ({
                start: s.start,
                end: s.end,
                title: s.title,
                desc: s.desc,
                timeStr: `${Utils.formatDecimalTime(s.start)} - ${Utils.formatDecimalTime(s.end)}`
            }));
        }
        
        for (let block of blocks) {
            if (currentTimeDecimal >= block.start && currentTimeDecimal < block.end) {
                currentBlock = block;
                break;
            }
        }
        
        if (currentBlock) {
            const savedActive = localStorage.getItem('sovereign_active_quest');
            if (!savedActive) {
                this.triggerQuestPopup({
                    title: currentBlock.title,
                    details: currentBlock.desc,
                    type: this.inferQuestType(currentBlock.title),
                    timeLimit: currentBlock.timeStr
                });
            }
        }
    },

    inferQuestType(title) {
        if (!title) return 'dungeons';
        const t = title.toLowerCase();
        if (t.match(/code|eng|ai|dev|prog|lab/)) return 'coding_ai';
        if (t.match(/sport|phys|ppl|run|train|fight|gym|bjj/)) return 'sports';
        if (t.match(/lang|english|book|quran|spirit|sharia|read/)) return 'languages_books';
        return 'dungeons';
    },

    triggerQuestPopup(questData) {
        this.state.activeQuest = questData;
        localStorage.setItem('sovereign_active_quest', JSON.stringify(questData));
        
        const rewardXP = this.config.weights[questData.type] || 20;
        
        if (window.QuestSystem && typeof QuestSystem.logAction === 'function') {
            QuestSystem.logAction('quest', `Automatic protocol invoked: [${questData.title}]`);
        }
        
        if (window.AnimePopup && typeof AnimePopup.show === 'function') {
            AnimePopup.show(questData.title, questData.details, questData.timeLimit, rewardXP);
        }
    },

    checkActiveQuestOnLoad() {
        try {
            const saved = localStorage.getItem('sovereign_active_quest');
            if (saved) {
                this.state.activeQuest = JSON.parse(saved);
                const activeBar = document.getElementById('activeDirectiveBar');
                const activeText = document.getElementById('activeDirectiveText');
                if (activeBar && activeText) {
                    activeText.textContent = this.state.activeQuest.title;
                    activeBar.classList.remove('hidden');
                    if (window.DirectiveTimer) DirectiveTimer.start(this.state.activeQuest.acceptedAt || Date.now());
                }
            }
        } catch (e) {}
    }
};

// ==========================================
// WEATHER & METRICS
// ==========================================
const SovereignMetrics = {
    init() {
        this.runClock();
        this.syncWeatherAndLocation();
        setInterval(() => this.syncWeatherAndLocation(), 900000);
    },
    runClock() {
        const clockElement = document.getElementById('sysClock');
        if (!clockElement) return;
        setInterval(() => {
            const now = new Date();
            clockElement.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }, 1000);
    },
    async syncWeatherAndLocation() {
        const locEl = document.getElementById('sysLocation');
        const tempEl = document.getElementById('sysTemp');
        const humEl = document.getElementById('sysHumidity');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    try {
                        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&relative_humidity_2m=true`);
                        if (!response.ok) throw new Error();
                        const data = await response.json();
                        if(locEl) locEl.textContent = `📍 SYSTEM ONLINE [${lat.toFixed(2)}, ${lon.toFixed(2)}]`;
                        if(tempEl) tempEl.textContent = `${Math.round(data.current_weather.temperature)}°C`;
                        if(humEl) humEl.textContent = `${data.current_weather.relative_humidity_2m || 50}% Hum`;
                    } catch (error) { this.activateFallbackMode(); }
                },
                (error) => { this.activateFallbackMode(); }
            );
        } else { this.activateFallbackMode(); }
    },
    activateFallbackMode() {
        if(document.getElementById('sysLocation')) document.getElementById('sysLocation').textContent = `📍 SOVEREIGN ZONE`;
        if(document.getElementById('sysTemp')) document.getElementById('sysTemp').textContent = `24°C`;
        if(document.getElementById('sysHumidity')) document.getElementById('sysHumidity').textContent = `45% Hum`;
    }
};

// ==========================================
// ROUTER SYSTEM
// ==========================================
const Router = {
    currentView: 'all',
    navigate(view) {
        this.currentView = view;

        document.querySelectorAll('#nav-active').forEach(btn => {
            if (view === 'active') {
                btn.classList.add('border-amber-500');
                btn.querySelector('span:first-child')?.classList.add('text-amber-400');
            } else {
                btn.classList.remove('border-amber-500');
                btn.querySelector('span:first-child')?.classList.remove('text-amber-400');
            }
        });

        if (view === 'active') {
            if (window.SoundEffects) SoundEffects.playSystemClick();
            if (window.QuestSystem) QuestSystem.setFilter('active');
            if (window.Toast) Toast.show('Showing active quests only', 'info');
        } else {
            if (window.SoundEffects) SoundEffects.playSystemClick();
            if (window.QuestSystem) QuestSystem.setFilter('all');
        }
    }
};

// ==========================================
// SYSTEM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    SoundEffects.init();
    PlayerState.init();
    QuestSystem.init();
    Pomodoro.init();
    SovereignMetrics.init();
    SovereignEngine.init();

    const taskInput = document.getElementById('taskInput');
    if(taskInput) taskInput.addEventListener('keypress', e => { if(e.key === 'Enter') QuestSystem.addTask(); });
});

// ==========================================
// SOVEREIGN TITLES DATA
// ==========================================
const SOVEREIGN_TITLES_INDEX = JSON.parse(localStorage.getItem('sovereign_titles_index') || '[]');

function buildTitlesIndex() {
    const storedIndex = localStorage.getItem('sovereign_titles_index');
    if (storedIndex) {
        try {
            return JSON.parse(storedIndex);
        } catch(e) {
            return [];
        }
    }
    return [];
}

function updateTitlesIndex(titlesData) {
    if (!titlesData || !Array.isArray(titlesData)) return;
    const minimalIndex = titlesData.map(t => ({
        id: t.id,
        nameAr: t.nameAr,
        nameEn: t.nameEn,
        reqLevel: t.reqLevel
    }));
    localStorage.setItem('sovereign_titles_index', JSON.stringify(minimalIndex));
}

// ==========================================
// SOVEREIGN TITLE SYSTEM 
// ==========================================
function loadMonarchTitle() {
    const titleElement = document.getElementById('monarch-active-title');
    if (!titleElement) return;

    try {
        // Single Source of Truth Resolution
        let actualTitle = '';
        let actualTitleEn = '';
        const systemData = JSON.parse(localStorage.getItem('monarch_system_data') || '{}');
        const equippedId = systemData.equippedTitle;

        if (window.SovereignCore) {
            actualTitle = SovereignCore.getActiveTitleText();
            if (equippedId) {
                const titlesIndex = buildTitlesIndex();
                const fromIndex = titlesIndex.find(item => item.id === equippedId);
                if (fromIndex) actualTitleEn = fromIndex.nameEn || '';
            }
        } else {
            if (equippedId) {
                const titlesIndex = buildTitlesIndex();
                const titleFromIndex = titlesIndex.find(item => item.id === equippedId);
                if (titleFromIndex) {
                    actualTitle = titleFromIndex.nameEn; // Use English directly
                    actualTitleEn = titleFromIndex.nameEn;
                } else if (typeof SOVEREIGN_TITLES_DATA !== 'undefined') {
                    const titleData = SOVEREIGN_TITLES_DATA.find(item => item.id === equippedId);
                    if (titleData) { actualTitle = titleData.nameEn; actualTitleEn = titleData.nameEn; }
                } else {
                    const cachedTitle = localStorage.getItem(`title_cache_${equippedId}`);
                    if (cachedTitle) {
                        try {
                            const parsed = JSON.parse(cachedTitle);
                            actualTitle = parsed.nameEn || '';
                            actualTitleEn = parsed.nameEn || '';
                        } catch(e) {}
                    }
                }
            }
            if (!actualTitle) actualTitle = systemData.title || '';
        }

        if (actualTitle !== "") {
            titleElement.textContent = `[ ${actualTitleEn || actualTitle} ]`;
            titleElement.classList.add('active');
            titleElement.setAttribute('title', actualTitleEn || actualTitle);

            if (equippedId) {
                localStorage.setItem(`title_cache_${equippedId}`, JSON.stringify({
                    nameAr: actualTitle,
                    nameEn: actualTitleEn
                }));
            }
        } else {
            titleElement.classList.remove('active');
            titleElement.textContent = ""; 
            titleElement.removeAttribute('title');
        }
    } catch(e) {
        console.error("[Sovereign Title System] Error loading title:", e);
        if (titleElement) {
            titleElement.classList.remove('active');
            titleElement.textContent = "";
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadMonarchTitle();
});

// GLOBAL EXPORTS
window.loadMonarchTitle = loadMonarchTitle;
window.updateTitlesIndex = updateTitlesIndex;
window.UI = UI;
window.Toast = Toast;
window.SoundEffects = SoundEffects;
window.PlayerState = PlayerState;
window.QuestSystem = QuestSystem;
window.Pomodoro = Pomodoro;
window.Milestone = Milestone;
window.AnimePopup = AnimePopup;
window.SovereignEngine = SovereignEngine;
window.SovereignSchedules = SovereignSchedules;
window.SovereignMetrics = SovereignMetrics;
window.DirectiveTimer = DirectiveTimer;
window.Router = Router;

// ==========================================
// SOVEREIGN AURA
// ==========================================
const savedAura = localStorage.getItem('sovereign_aura_color');
if(savedAura) {
    document.documentElement.style.setProperty('--sys-cyan', savedAura);
    document.documentElement.style.setProperty('--sys-cyan-glow', savedAura + '99');
}

function applyAura() {
    const savedAura = localStorage.getItem('sovereign_aura_color');
    if(savedAura) {
        document.documentElement.style.setProperty('--sys-cyan', savedAura);
        document.documentElement.style.setProperty('--sys-cyan-glow', `${savedAura}66`); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyAura();
});

// ==========================================
// SHADOW COMPANION
// ==========================================
const SHADOW_ASSETS_MAP = {
    "shadow-Tank": "01010202.png",
    "shadow-Iron": "0101.png",
    "shadow-Igris": "0404.png",
    "shadow-Beru": "47.png"
};

function updateSovereignCompanion() {
    const container = document.getElementById('live-shadow-container');
    const imgElement = document.getElementById('live-shadow-img');
    if (!container || !imgElement) return;

    const equippedShadowId = localStorage.getItem('equipped_shadow_companion');

    if (equippedShadowId && SHADOW_ASSETS_MAP[equippedShadowId]) {
        imgElement.src = SHADOW_ASSETS_MAP[equippedShadowId];
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

window.addEventListener('DOMContentLoaded', updateSovereignCompanion);

// ==========================================
// UNIFIED CROSS-TAB SYNCHRONIZATION PIPELINE
// ==========================================
window.addEventListener('storage', (e) => {
    if (e.key === 'equipped_avatar_border') {
        applyEquippedAvatarBorder();
    } else if (e.key === 'equipped_shadow_companion') {
        updateSovereignCompanion();
    } else if (e.key === 'sovereign_aura_color') {
        applyAura();
        if (typeof Toast !== 'undefined') {
            Toast.show('⚡ External energy detected: System Sovereign Aura updated!', 'info');
        }
    }
});

if (window.SovereignCore) {
    SovereignCore.onChange(() => {
        if (typeof loadMonarchTitle === 'function') loadMonarchTitle();
        if (typeof PlayerState !== 'undefined') PlayerState.init();
    });
}

// ==========================================
// SYSTEM MESSAGE ENGINE (DYNAMIC QUOTES)
// ==========================================
const SystemQuotes = [
    {
        en: "Hard work today is the bridge to a better tomorrow.",
        ar: "الجد اليوم هو جسر إلى غدٍ أفضل.",
        ko: "오늘의 노력은 더 나은 내일로 가는 다리입니다."
    },
    {
        en: "Consistency beats intensity when intensity is inconsistent.",
        ar: "الاستمرارية تتغلب على الشدة حين تكون الشدة متقطعة.",
        ko: "일관성은 불규칙한 강도보다 낫습니다."
    },
    {
        en: "Small steps taken daily lead to mountains climbed over years.",
        ar: "خطوات صغيرة يومية تؤدي إلى تسلق الجبال على مر السنين.",
        ko: "매일의 작은 걸음은 수년 후 산을 오르게 합니다."
    },
    {
        en: "The best investment you can make is in your own skills.",
        ar: "أفضل استثمار يمكنك القيام به هو في مهاراتك الخاصة.",
        ko: "당신이 할 수 있는 최고의 투자는 자신의 기술에 하는 것입니다."
    },
    {
        en: "Excellence is not a single act, but a habit repeated daily.",
        ar: "التفوق ليس فعلاً واحداً، بل عادة يُكررها الإنسان يومياً.",
        ko: "탁월함은 한 번의 행동이 아니라 매일 반복되는 습관입니다."
    },
    {
        en: "Your hands were made to build, not just to hold.",
        ar: "يداك خُلقتا ليبنيا، لا ليحتفظا فقط.",
        ko: "당신의 손은 잡기만 하라고 만들어진 것이 아니라 만들라고 만들어졌습니다."
    },
    {
        en: "There is no shortcut to any place worth going.",
        ar: "لا يوجد طريق مختصر إلى أي مكان يستحق الذهاب إليه.",
        ko: "갈 가치가 있는 곳에는 지름길이 없습니다."
    },
    {
        en: "Discipline is choosing between what you want now and what you want most.",
        ar: "الانضباط هو الاختيار بين ما تريده الآن وما تريده بشدة.",
        ko: "규율은 지금 원하는 것과 가장 원하는 것 사이의 선택입니다."
    },
    {
        en: "The work you put in when no one is watching defines who you are.",
        ar: "العمل الذي تبذله حين لا يراك أحد يُعرف من أنت.",
        ko: "아무도 보지 않을 때 하는 일이 당신을 정의합니다."
    },
    {
        en: "The seed that is planted today becomes the shade of tomorrow.",
        ar: "البذرة التي تُزرع اليوم تصبح ظل الغد.",
        ko: "오늘 심은 씨앗은 내일의 그늘이 됩니다."
    },
    {
        en: "Knowledge is a light that no darkness can extinguish.",
        ar: "العلم نور لا يُطفئه ظلام.",
        ko: "지식은 어떤 어둠도 꺼뜨릴 수 없는 빛입니다."
    },
    {
        en: "Every book you read is a conversation with a mind greater than yours.",
        ar: "كل كتاب تقرأه هو حوار مع عقل أعظم من عقلك.",
        ko: "읽는 모든 책은 당신보다 위대한 마음과의 대화입니다."
    },
    {
        en: "The mind is like a garden; it grows what you plant in it.",
        ar: "العقل كالحديقة؛ ينمو ما تزرعه فيه.",
        ko: "마음은 정원과 같습니다. 당신이 심는 것이 자랍니다."
    },
    {
        en: "A question asked in humility is worth more than an answer spoken in arrogance.",
        ar: "سؤال يُطرح بتواضع يُساوي أكثر من إجابة تُقال بكبرياء.",
        ko: "겸손하게 묻는 질문은 오만하게 말하는 답보다 가치가 있습니다."
    },
    {
        en: "Mistakes in learning are not failures; they are tuition fees for wisdom.",
        ar: "الأخطاء في التعلم ليست فشلاً؛ بل هي رسوم دراسية للحكمة.",
        ko: "학습의 실수는 실패가 아니라 지혜의 수업료입니다."
    },
    {
        en: "Curiosity is the engine of achievement.",
        ar: "الفضول هو محرك الإنجاز.",
        ko: "호기심은 성취의 엔진입니다."
    },
    {
        en: "Read to understand the world, and act to change it.",
        ar: "اقرأ لتفهم العالم، واعمل لتغييره.",
        ko: "세상을 이해하려면 읽고, 바꾸려면 행동하십시오."
    },
    {
        en: "Wisdom is knowing what to overlook.",
        ar: "الحكمة هي معرفة ما يجب تجاهله.",
        ko: "지혜는 무엇을 무시해야 하는지 아는 것입니다."
    },
    {
        en: "Teach what you learn, and you will learn it twice.",
        ar: "علّم ما تتعلم، وستتعلمه مرتين.",
        ko: "배운 것을 가르치면 두 배로 배우게 됩니다."
    },
    {
        en: "The more you learn, the more you realize how much you do not know.",
        ar: "كلما تعلمت أكثر، أدركت أكثر مقدار ما لا تعرفه.",
        ko: "더 많이 배울수록 모르는 것이 얼마나 많은지 깨닫게 됩니다."
    },
    {
        en: "Time is the only currency you cannot earn back.",
        ar: "الوقت هو العملة الوحيدة التي لا يمكنك استردادها.",
        ko: "시간은 되돌릴 수 없는 유일한 화폐입니다."
    },
    {
        en: "How you spend your hours is how you spend your life.",
        ar: "كيف تقضي ساعاتك هو كيف تقضي حياتك.",
        ko: "시간을 어떻게 쓰느냐가 인생을 어떻게 쓰느냐입니다."
    },
    {
        en: "Procrastination is the thief of dreams.",
        ar: "المماطلة هي لص الأحلام.",
        ko: "미루기는 꿈의 도둑입니다."
    },
    {
        en: "Plan your day, or your day will plan you.",
        ar: "خطط ليومك، وإلا خطط يومك لك.",
        ko: "하루를 계획하거나, 하루가 당신을 계획할 것입니다."
    },
    {
        en: "One hour of focused work is worth more than three hours of distraction.",
        ar: "ساعة عمل مركز تساوي أكثر من ثلاث ساعات تشتت.",
        ko: "집중한 한 시간은 산만한 세 시간보다 가치가 있습니다."
    },
    {
        en: "Yesterday is gone, tomorrow is uncertain, but today is a gift.",
        ar: "الأمس راح، والغد غير مؤكد، لكن اليوم هو هدية.",
        ko: "어제는 지나갔고, 내일은 불확실하지만, 오늘은 선물입니다."
    },
    {
        en: "Do not count the days; make the days count.",
        ar: "لا تحصِ الأيام؛ اجعل الأيام تحصي.",
        ko: "날을 세지 말고, 날을 의미 있게 만드십시오."
    },
    {
        en: "The best time to start was yesterday. The second best is now.",
        ar: "أفضل وقت للبدء كان بالأمس. ثاني أفضل وقت هو الآن.",
        ko: "시작하기 가장 좋은 때는 어제였습니다. 두 번째로 좋은 때는 지금입니다."
    },
    {
        en: "A minute lost is a minute you will never meet again.",
        ar: "دقيقة ضائعة هي دقيقة لن تلتقيها أبداً.",
        ko: "잃어버린 한 분은 다시 만날 수 없는 한 분입니다."
    },
    {
        en: "The morning hour has gold in its mouth.",
        ar: "ساعة الصباح في فمها ذهب.",
        ko: "아침 시간은 입에 금을 물고 있습니다."
    },
    {
        en: "Failure is not the opposite of success; it is part of it.",
        ar: "الفشل ليس عكس النجاح؛ بل هو جزء منه.",
        ko: "실패는 성공의 반대가 아니라 성공의 일부입니다."
    },
    {
        en: "Every fall is a lesson in how to stand stronger.",
        ar: "كل سقطة هي درس في كيفية الوقوف بقوة أكبر.",
        ko: "모든 넘어짐은 더 강하게 일어서는 방법에 대한 교훈입니다."
    },
    {
        en: "The darkest night produces the brightest stars.",
        ar: "أظلم ليلة تُنتج أنجع النجوم.",
        ko: "가장 어두운 밤이 가장 밝은 별을 낳습니다."
    },
    {
        en: "Pain is a teacher that never speaks, but always instructs.",
        ar: "الألم معلم لا يتكلم أبداً، لكنه يُعلّم دائماً.",
        ko: "고통은 결코 말하지 않지만 항상 가르치는 스승입니다."
    },
    {
        en: "What breaks you today can build you tomorrow.",
        ar: "ما يكسرك اليوم قد يبنيك غداً.",
        ko: "오늘 당신을 부수는 것이 내일 당신을 만들 수 있습니다."
    },
    {
        en: "Do not fear the storm; learn to sail through it.",
        ar: "لا تخف من العاصفة؛ تعلم الإبحار خلالها.",
        ko: "폭풍을 두려워하지 말고, 그 속을 항해하는 법을 배우십시오."
    },
    {
        en: "A setback is a setup for a comeback.",
        ar: "التراجع هو إعداد للعودة.",
        ko: "후퇴는 재기를 위한 준비입니다."
    },
    {
        en: "Courage is not the absence of fear, but moving forward despite it.",
        ar: "الشجاعة ليست غياب الخوف، بل التقدم رغم وجوده.",
        ko: "용기는 두려움이 없는 것이 아니라, 두려움에도 불구하고 나아가는 것입니다."
    },
    {
        en: "The road to success is paved with obstacles you overcame.",
        ar: "طريق النجاح مرصوف بالعقبات التي تغلبت عليها.",
        ko: "성공의 길은 당신이 극복한 장애물로 포장되어 있습니다."
    },
    {
        en: "Tough times do not last, but tough people do.",
        ar: "الأوقات الصعبة لا تدوم، لكن الأقوياء يدومون.",
        ko: "힘든 시간은 지나가지만, 강인한 사람은 남습니다."
    },
    {
        en: "Your body is a trust given to you; take care of it.",
        ar: "جسدك أمانة أُودعتك؛ احفظها.",
        ko: "당신의 몸은 당신에게 맡겨진 신탁입니다. 잘 돌보십시오."
    },
    {
        en: "A healthy mind lives in a healthy body.",
        ar: "عقل سليم في جسد سليم.",
        ko: "건강한 마음은 건강한 몸에 삽니다."
    },
    {
        en: "Sleep is not laziness; it is the foundation of performance.",
        ar: "النوم ليس كسلاً؛ بل هو أساس الأداء.",
        ko: "수면은 게으름이 아니라 성과의 기초입니다."
    },
    {
        en: "Move your body today so it can carry you tomorrow.",
        ar: "حرك جسدك اليوم ليحملك غداً.",
        ko: "오늘 몸을 움직여야 내일 몸이 당신을 지탱할 수 있습니다."
    },
    {
        en: "What you eat is what you become.",
        ar: "ما تأكله هو ما تصبح عليه.",
        ko: "당신이 먹는 것이 당신이 되는 것입니다."
    },
    {
        en: "Rest is not quitting; it is preparing for the next climb.",
        ar: "الراحة ليست استسلاماً؛ بل هي استعداد للصعود التالي.",
        ko: "휴식은 포기가 아니라 다음 등반을 위한 준비입니다."
    },
    {
        en: "Water your own roots before you try to shade others.",
        ar: "اسقِ جذورك قبل أن تحاول أن تظلل غيرك.",
        ko: "다른 사람에게 그늘을 주려면 먼저 자신의 뿌리에 물을 주십시오."
    },
    {
        en: "Stress managed well becomes strength.",
        ar: "الضغط المُدار جيداً يصبح قوة.",
        ko: "잘 관리된 스트레스는 힘이 됩니다."
    },
    {
        en: "Breathe deeply; clarity often follows a calm breath.",
        ar: "تنفس بعمق؛ الوضوح غالباً ما يتبع نفساً هادئاً.",
        ko: "깊게 숨쉬십시오. 맑은 생각은 차분한 호흡 뒤에 옵니다."
    },
    {
        en: "Your health is the wealth you cannot buy back.",
        ar: "صحتك هي الثروة التي لا يمكنك استردادها.",
        ko: "건강은 되돌릴 수 없는 부입니다."
    },
    {
        en: "Kind words are seeds that grow in the hearts of others.",
        ar: "الكلمات الطيبة بذور تنمو في قلوب الآخرين.",
        ko: "친절한 말은 다른 사람의 마음속에 자라는 씨앗입니다."
    },
    {
        en: "The best relationship you can build is with your own character.",
        ar: "أفضل علاقة يمكنك بناؤها هي مع شخصيتك.",
        ko: "당신이 쌓을 수 있는 최고의 관계는 자신의 인품과의 관계입니다."
    },
    {
        en: "Listen more than you speak, and you will understand more than you know.",
        ar: "استمع أكثر مما تتكلم، وستفهم أكثر مما تعرف.",
        ko: "말하는 것보다 듣고, 아는 것보다 이해하게 될 것입니다."
    },
    {
        en: "Trust is built in drops and lost in buckets.",
        ar: "الثقة تُبنى بالقطرة وتُفقد بالدلو.",
        ko: "신뢰는 방울로 쌓이고 통으로 잃습니다."
    },
    {
        en: "Surround yourself with those who remind you of your purpose.",
        ar: "احط نفسك بمن يُذكرك بغايتك.",
        ko: "당신의 목적을 상기시켜 주는 사람들로 자신을 둘러싸십시오."
    },
    {
        en: "A sincere apology mends what pride breaks.",
        ar: "الاعتذار الصادق يُصلح ما يكسره الكبرياء.",
        ko: "진심 어린 사과는 자존심이 부순 것을 고칩니다."
    },
    {
        en: "The strength of a team is measured by how it treats its weakest member.",
        ar: "قوة الفريق تُقاس بكيفية تعامله مع أضعف أعضائه.",
        ko: "팀의 강함은 가장 약한 구성원을 대하는 방식으로 측정됩니다."
    },
    {
        en: "Forgiveness frees the heart that gives it.",
        ar: "المغفرة تُحرر القلب الذي يُعطيها.",
        ko: "용서는 용서를 주는 마음을 자유롭게 합니다."
    },
    {
        en: "Good manners are the fragrance of a noble soul.",
        ar: "حسن الخلق هو عطر النفس النبيلة.",
        ko: "좋은 예의는 고귀한 인품의 향기입니다."
    },
    {
        en: "The words you leave behind echo longer than the work you do.",
        ar: "الكلمات التي تتركها تتردد أطول من العمل الذي تقوم به.",
        ko: "당신이 남기는 말은 당신이 하는 일보다 오래 울려 퍼집니다."
    },
    {
        en: "Trust in God, but tie your camel.",
        ar: "توكل على الله، واعقل بكرة.",
        ko: "하나님을 신뢰하되, 낙타를 묶어두십시오."
    },
    {
        en: "Pray as if everything depends on God, then work as if everything depends on you.",
        ar: "ادعُ كأن كل شيء يعتمد على الله، ثم اعمل كأن كل شيء يعتمد عليك.",
        ko: "모든 것이 하나님께 달린 것처럼 기도하고, 모든 것이 당신에게 달린 것처럼 일하십시오."
    },
    {
        en: "Faith without action is a bird without wings.",
        ar: "الإيمان بلا عمل كطائر بلا أجنحة.",
        ko: "행동 없는 믿음은 날개 없는 새와 같습니다."
    },
    {
        en: "God does not burden a soul beyond what it can bear.",
        ar: "لا يُكلف الله نفساً إلا وسعها.",
        ko: "하나님은 능력 밖의 짐을 지우지 않으십니다."
    },
    {
        en: "After hardship comes ease, if you keep walking.",
        ar: "مع العسر يسراً، إذا استمررت في المشي.",
        ko: "어려움 뒤에는 편안함이 옵니다. 걸음을 멈추지 마십시오."
    },
    {
        en: "The believer sees opportunity where others see only difficulty.",
        ar: "المؤمن يرى الفرصة حيث يرى الآخرون الصعوبة فقط.",
        ko: "신자는 다른 사람이 어려움만 보는 곳에서 기회를 봅니다."
    },
    {
        en: "Sincere intention is the foundation of every good deed.",
        ar: "النية الصادقة هي أساس كل عمل صالح.",
        ko: "진실한 의도는 모든 선행의 기초입니다."
    },
    {
        en: "God's mercy is wider than your mistakes.",
        ar: "رحمة الله أوسع من أخطائك.",
        ko: "하나님의 자비는 당신의 실수보다 넓습니다."
    },
    {
        en: "Patience is the key that opens every locked door.",
        ar: "الصبر هو المفتاح الذي يفتح كل باب مغلق.",
        ko: "인내는 모든 잠긴 문을 여는 열쇠입니다."
    },
    {
        en: "Seek knowledge, for it is a light from your Lord.",
        ar: "اطلب العلم، فهو نور من ربك.",
        ko: "지식을 구하십시오. 그것은 주님으로부터 오는 빛입니다."
    },
    {
        en: "A goal without a plan is just a wish.",
        ar: "هدف بلا خطة ليس إلا أمنية.",
        ko: "계획 없는 목표는 단순한 소망에 불과합니다."
    },
    {
        en: "Write your goals down; they become real when they leave your head.",
        ar: "اكتب أهدافك؛ تصبح حقيقية حين تخرج من رأسك.",
        ko: "목표를 적으십시오. 머릿속에서 나올 때 실현됩니다."
    },
    {
        en: "Break big dreams into small tasks, and start with the first.",
        ar: "قسّم الأحلام الكبيرة إلى مهام صغيرة، وابدأ بالأولى.",
        ko: "큰 꿈을 작은 과업으로 나누고, 첫 번째부터 시작하십시오."
    },
    {
        en: "Your direction matters more than your speed.",
        ar: "اتجاهك يهم أكثر من سرعتك.",
        ko: "속도보다 방향이 더 중요합니다."
    },
    {
        en: "Visualize your success, then build it brick by brick.",
        ar: "تخيل نجاحك، ثم ابنه لبنةً لبنة.",
        ko: "성공을 시각화하고, 벽돌 하나씩 쌓아 올리십시오."
    },
    {
        en: "Review your progress weekly, or you will drift without knowing.",
        ar: "راجع تقدمك أسبوعياً، وإلا انجرفت دون أن تدري.",
        ko: "매주 진행 상황을 검토하십시오. 그렇지 않으면 모르게 표류할 것입니다."
    },
    {
        en: "The person who aims at nothing hits it every time.",
        ar: "من لا يهدف إلى شيء يُصيبه في كل مرة.",
        ko: "아무것도 목표로 하지 않는 사람은 매번 그것을 맞힙니다."
    },
    {
        en: "Your calendar is a mirror of your priorities.",
        ar: "تقويمك هو مرآة أولوياتك.",
        ko: "당신의 달력은 우선순위의 거울입니다."
    },
    {
        en: "Start before you are ready, or you may never start.",
        ar: "ابدأ قبل أن تكون جاهزاً، وإلا قد لا تبدأ أبداً.",
        ko: "준비가 되기 전에 시작하십시오. 그렇지 않으면 영영 시작하지 못할 수 있습니다."
    },
    {
        en: "Success is the sum of small efforts repeated day in and day out.",
        ar: "النجاح هو مجموع الجهود الصغيرة التي تُكرر يوماً بعد يوم.",
        ko: "성공은 매일 반복되는 작은 노력의 합입니다."
    },
    {
        en: "Comfort zones are beautiful places, but nothing grows there.",
        ar: "مناطق الراحة أماكن جميلة، لكن لا شيء ينمو فيها.",
        ko: "안전지대는 아름다운 곳이지만, 그곳에서는 아무것도 자라지 않습니다."
    },
    {
        en: "Fear is a door; courage is the key to open it.",
        ar: "الخوف باب؛ والشجاعة مفتاحه.",
        ko: "두려움은 문이고, 용기는 그 문을 여는 열쇠입니다."
    },
    {
        en: "Do one thing every day that scares you a little.",
        ar: "افعل كل يوم شيئاً يُخيفك قليلاً.",
        ko: "매일 조금 무서운 일 하나를 하십시오."
    },
    {
        en: "The life you want is on the other side of the effort you fear.",
        ar: "الحياة التي تريدها في الجانب الآخر من الجهد الذي تخافه.",
        ko: "원하는 삶은 두려워하는 노력의 건너편에 있습니다."
    },
    {
        en: "Doubt kills more dreams than failure ever will.",
        ar: "الشك يقتل أحلاماً أكثر مما يقتل الفشل.",
        ko: "의심은 실패보다 더 많은 꿈을 죽입니다."
    },
    {
        en: "You are braver than you believe, and stronger than you seem.",
        ar: "أنت أشجع مما تظن، وأقوى مما تبدو.",
        ko: "당신은 생각하는 것보다 용감하고, 보이는 것보다 강합니다."
    },
    {
        en: "Risk calculated is better than regret guaranteed.",
        ar: "مخاطرة محسوبة خير من ندم مضمون.",
        ko: "계산된 위험이 확실한 후회보다 낫습니다."
    },
    {
        en: "What you avoid today will control you tomorrow.",
        ar: "ما تتجنبه اليوم سيتحكم بك غداً.",
        ko: "오늘 피하는 것이 내일 당신을 지배할 것입니다."
    },
    {
        en: "Leap, and the net will appear.",
        ar: "اقفز، وستظهر الشبكة.",
        ko: "뛰어들면 그물이 나타날 것입니다."
    },
    {
        en: "The cave you fear to enter holds the treasure you seek.",
        ar: "الكهف الذي تخاف دخوله يحتوي على الكنز الذي تبحث عنه.",
        ko: "들어가기 두려워하는 동굴에는 찾는 보물이 있습니다."
    },
    {
        en: "You are the author of your own story.",
        ar: "أنت مؤلف قصتك الخاصة.",
        ko: "당신은 자신의 이야기의 작가입니다."
    },
    {
        en: "Blame no one for your choices; own them and grow.",
        ar: "لا تلوم أحداً على خياراتك؛ تملكها وانمو.",
        ko: "자신의 선택을 탓하지 말고, 인정하고 성장하십시오."
    },
    {
        en: "Maturity is knowing when to speak and when to stay silent.",
        ar: "النضج هو معرفة متى تتكلم ومتى تصمت.",
        ko: "성숙함은 말할 때와 침묵할 때를 아는 것입니다."
    },
    {
        en: "Your reputation is built on what you do, not what you say.",
        ar: "سمعتك تُبنى على ما تفعله، لا على ما تقوله.",
        ko: "평판은 말이 아니라 행동으로 쌓입니다."
    },
    {
        en: "Responsibility is the price of greatness.",
        ar: "المسؤولية هي ثمن العظمة.",
        ko: "책임은 위대함의 대가입니다."
    },
    {
        en: "Integrity is doing the right thing, even when no one is watching.",
        ar: "النزاهة هي فعل الصواب، حتى حين لا يراك أحد.",
        ko: "정직은 아무도 보지 않을 때도 옳은 일을 하는 것입니다."
    },
    {
        en: "Honesty is the first chapter in the book of wisdom.",
        ar: "الصدق هو الفصل الأول في كتاب الحكمة.",
        ko: "정직은 지혜의 책의 첫 장입니다."
    },
    {
        en: "Your word is your bond; break it and you break yourself.",
        ar: "كلمتك هي عهدك؛ اكسرها فتكسر نفسك.",
        ko: "당신의 말은 당신의 보증입니다. 그것을 깨면 자신을 깨는 것입니다."
    },
    {
        en: "Truth may hurt for a moment, but lies hurt for a lifetime.",
        ar: "الحقيقة قد تؤلم للحظة، لكن الكذب يؤلم لمدى الحياة.",
        ko: "진실은 잠시 아프지만, 거짓은 평생 아프게 합니다."
    },
    {
        en: "Character is what you do when no one is looking.",
        ar: "الشخصية هي ما تفعله حين لا ينظر إليك أحد.",
        ko: "인품은 아무도 보지 않을 때 하는 것입니다."
    }
];

const SystemQuoteEngine = {
    init() {
        this.updateQuote();
        setInterval(() => this.updateQuote(), 12000);
    },

    updateQuote() {
        const quoteEl = document.getElementById('motivationalQuote');
        if (!quoteEl) return;

        const randomIndex = Math.floor(Math.random() * SystemQuotes.length);
        const selectedQuote = SystemQuotes[randomIndex];

        quoteEl.style.transition = "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        quoteEl.style.opacity = "0";

        setTimeout(() => {
            quoteEl.innerHTML = `
                <span class="block text-slate-100 font-mono tracking-wide mb-1.5">${selectedQuote.en}</span>
                <span class="block text-sm text-slate-300 font-sans mb-1" style="opacity: 0.9;">${selectedQuote.ar}</span>
                <span class="block text-xs text-slate-500 font-sans" style="opacity: 0.75;">${selectedQuote.ko}</span>
            `;
            quoteEl.style.opacity = "1";
        }, 400);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SystemQuoteEngine.init();
});

'use strict';

const PlayerState = {
    // الهيكل الأساسي للبيانات المشتركة بين كل الصفحات
    data: {
        level: 1,
        xp: 0,
        gold: 0,
        ap: 0, // نقاط التطوير المتاحة
        authority: 0,
        stats: { str: 10, vit: 10, agi: 10, int: 10, sen: 10 },
        // يجب ترك متغيرات الطبخ حتى لا تُحذف عند حفظ البيانات من هذه الصفحة
        culinaryXp: 0,
        culinaryLevel: 1,
        skills: { knife: 10, heat: 10, plating: 10, seasoning: 10 }
    },

    init() {
        // جلب البيانات من الذاكرة المشتركة
        const saved = localStorage.getItem('monarch_system_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = {
                    ...this.data,
                    ...parsed,
                    stats: { ...this.data.stats, ...(parsed.stats || {}) }
                };
            } catch (e) {
                console.error("System Error: Failed to parse monarch_system_data", e);
            }
        }
        this.updateUI();
    },

    save() {
        // حفظ البيانات في نفس الملف الموحد
        localStorage.setItem('monarch_system_data', JSON.stringify(this.data));
        
        // إطلاق إشارة لباقي الصفحات (مثل صفحة الطبخ) لتتحدث فوراً
        if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('sovereign_sync');
            bc.postMessage({ type: 'SYSTEM_DATA_UPDATED' });
        }
        this.updateUI();
    },

    updateUI() {
        // تحديث المستوى والذهب
        const levelEl = document.getElementById('currentLevel');
        const goldEl = document.getElementById('playerGold');
        const apEl = document.getElementById('availablePoints');
        const authEl = document.getElementById('stat-authority');

        if (levelEl) levelEl.textContent = this.data.level;
        if (goldEl) goldEl.textContent = this.data.gold;
        if (apEl) apEl.textContent = this.data.ap || 0;
        if (authEl) authEl.textContent = this.data.authority || 0;

        // تحديث خصائص القوة (Stats)
        ['str', 'vit', 'agi', 'int', 'sen'].forEach(statKey => {
            const statEl = document.getElementById(`stat-${statKey}`);
            if (statEl) statEl.textContent = this.data.stats[statKey];
        });
    },

    spendAP(statKey) {
        // دالة لإنفاق النقاط وتطوير الخصائص
        if (this.data.ap > 0) {
            this.data.stats[statKey]++;
            this.data.ap--;
            this.save();
        } else {
            console.log("No AP available!");
        }
    }
};

// تشغيل النظام عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    PlayerState.init();

    // الاستماع لأي تغيير يحدث في الصفحات الأخرى (عبر التخزين)
    window.addEventListener('storage', (e) => {
        if (e.key === 'monarch_system_data') {
            PlayerState.init();
        }
    });

    // الاستماع للقناة اللحظية لتحديث الواجهة بدون الحاجة لعمل Refresh
    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('sovereign_sync');
        bc.onmessage = (event) => {
            if (event.data.type === 'SYSTEM_DATA_UPDATED') {
                PlayerState.init();
            }
        };
    }
});

