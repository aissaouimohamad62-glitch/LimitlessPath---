/* ============================================================================
   SOVEREIGN CORE — Unified Central Engine for the Sovereign System
   ----------------------------------------------------------------------------
   Single source of truth for player data (monarch_system_data) + single pipeline
   for instant sync between tabs via window.storage + BroadcastChannel.
   No setInterval loops, no repeated localStorage reads — every page shares
   the same memory-stored copy and is notified immediately upon change.

   This file is loaded before any page-specific script:
   <script src="monarch-core.js"></script>
   ============================================================================ */
(function (window) {
    'use strict';

    const STORAGE_KEY = 'monarch_system_data';
    const TITLES_KEY  = 'sovereign_titles_index';
    const AURA_KEY     = 'sovereign_aura_color';
    const SYNC_CHANNEL = 'sovereign_sync';

    // Default state — any missing field in the stored record is completed from here
    const DEFAULT_STATE = {
        name: '',                  // Real name — static, only changed via the registration gate
        title: '[]',     // Fallback text before binding title to shop index
        equippedTitle: '',         // Equipped title ID — the only field changeable via the shop
        level: 1,
        xp: 0,
        gold: 0,
        authority: 0,
        lethality: 0,
        stats: { str: 10, vit: 10, agi: 10, int: 10, sen: 10 },
        avatar: '',
        inventory: []
    };

    // Strict level gates for the five operational programs
    // Each program active exclusively within its range; auto-locks below the minimum and above the maximum
    const PROGRAM_GATES = [
        { id: 'week1', order: 1, label: 'Program I',  labelEn: 'PROGRAM I',     min: 1,  max: 25 },
        { id: 'week2', order: 2, label: 'Program II', labelEn: 'PROGRAM II',    min: 25, max: 35 },
        { id: 'week3', order: 3, label: 'Program III', labelEn: 'PROGRAM III',   min: 35, max: 45 },
        { id: 'week4', order: 4, label: 'Program IV', labelEn: 'PROGRAM IV',    min: 45, max: 50 },
        { id: 'week5', order: 5, label: 'Final Program', labelEn: 'FINAL PROGRAM', min: 50, max: Infinity }
    ];

    let cache = null;
    const subscribers = [];

    function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

    function mergeDefaults(parsed) {
        const safe = parsed && typeof parsed === 'object' ? parsed : {};
        return {
            ...clone(DEFAULT_STATE),
            ...safe,
            stats: { ...DEFAULT_STATE.stats, ...(safe.stats || {}) },
            inventory: Array.isArray(safe.inventory) ? safe.inventory : []
        };
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            cache = raw ? mergeDefaults(JSON.parse(raw)) : clone(DEFAULT_STATE);
        } catch (e) {
            console.error('[Sovereign Core] Failed to read central state record:', e);
            cache = clone(DEFAULT_STATE);
        }
        return cache;
    }

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
            broadcast({ type: 'SYSTEM_DATA_UPDATED' });
        } catch (e) {
            console.error('[Sovereign Core] Failed to save central state record:', e);
        }
    }

    function notify(origin) {
        subscribers.forEach(fn => {
            try { fn(cache, origin); } catch (e) { console.error('[Sovereign Core] Error in update subscriber:', e); }
        });
    }

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
        try { bc = new BroadcastChannel(SYNC_CHANNEL); } catch (e) { bc = null; }
    }
    function broadcast(payload) {
        if (bc) { try { bc.postMessage(payload); } catch (e) {} }
    }

    const SovereignCore = {
        STORAGE_KEY, TITLES_KEY, AURA_KEY, PROGRAM_GATES,

        get data() { return cache || load(); },

        load,

        /** Merges partial with current state, saves it, and notifies all subscribers immediately (non-blocking) */
        save(partial) {
            if (!cache) load();
            const next = { ...cache, ...(partial || {}) };
            if (partial && partial.stats) next.stats = { ...cache.stats, ...partial.stats };
            if (partial && partial.inventory) next.inventory = partial.inventory;
            cache = next;
            persist();
            notify('local');
            return cache;
        },

        /** Registers a listener called on any update (local or from another tab), and returns an unsubscribe function */
        onChange(fn) {
            if (typeof fn !== 'function') return () => {};
            subscribers.push(fn);
            return () => {
                const i = subscribers.indexOf(fn);
                if (i > -1) subscribers.splice(i, 1);
            };
        },

        // ───────────────────────── Identity: static name + mutable title ─────────────────────────
        /** Real name — read-only, no modification function exists outside the registration gate index.html */
        getRealName() {
            return (this.data.name || '').trim();
        },

        getTitlesIndex() {
            try {
                const raw = localStorage.getItem(TITLES_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) { return []; }
        },

        /** Resolves active title text from equippedTitle via the shop index, with a cached fallback */
        getActiveTitleText() {
            const d = this.data;
            if (d.equippedTitle) {
                const found = this.getTitlesIndex().find(t => t.id === d.equippedTitle);
                if (found) return found.nameAr || found.nameEn || '';
                try {
                    const cached = localStorage.getItem(`title_cache_${d.equippedTitle}`);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        if (parsed.nameAr) return parsed.nameAr;
                    }
                } catch (e) {}
            }
            return d.title || '';
        },

        /** The only authorized function to change the title — called from sovereign-shop.html only, never touches name */
        equipTitle(titleId) {
            this.save({ equippedTitle: titleId });
            broadcast({ type: 'TITLE_EQUIPPED', titleId });
            this.renderIdentityStrip();
        },

        // ───────────────────────── Strict Level Gates (Shadow Lock) ─────────────────────────
        getProgramGate(id) {
            return PROGRAM_GATES.find(p => p.id === id) || null;
        },

        /** Determines if an operational program is locked at the player's current level, the lock reason, and the required level */
        getProgramStatus(id) {
            const gate = this.getProgramGate(id);
            const level = this.data.level || 1;
            if (!gate) return { locked: false, level, gate: null };
            if (level < gate.min) {
                return { locked: true, reason: 'below', requiredLevel: gate.min, gate, level };
            }
            if (level >= gate.max) {
                return { locked: true, reason: 'surpassed', requiredLevel: gate.max, gate, level };
            }
            return { locked: false, gate, level };
        },

        getCurrentProgramId() {
            const level = this.data.level || 1;
            const match = PROGRAM_GATES.find(p => level >= p.min && level < p.max);
            return match ? match.id : PROGRAM_GATES[PROGRAM_GATES.length - 1].id;
        },

        /** Builds a DOM node for the "Shadow Lock" overlay — ready to inject into any program container */
        buildShadowLockOverlay(status) {
            const overlay = document.createElement('div');
            overlay.className = 'shadow-lock-overlay';
            const icon = status.reason === 'surpassed' ? '✓' : '🔒';
            const reqText = status.reason === 'surpassed'
                ? 'This gate has been surpassed — the next program is now active'
                : `Breaching this gate requires reaching <span>Level ${status.requiredLevel}</span>`;
            overlay.innerHTML = `
                <div class="shadow-lock-icon">${icon}</div>
                <div class="shadow-lock-title">SHADOW LOCK PROTOCOL / Shadow Lock Protocol</div>
                <div class="shadow-lock-req">${reqText}</div>
                <div class="shadow-lock-sub">Your current level: ${status.level}</div>
            `;
            return overlay;
        },

        /** Applies lock/show on a program container element by its ID — safe when the element is missing */
        applyProgramGateToElement(programId, containerEl) {
            if (!containerEl) return;
            const status = this.getProgramStatus(programId);
            containerEl.querySelectorAll(':scope > .shadow-lock-overlay').forEach(n => n.remove());
            containerEl.classList.toggle('sov-locked-content', status.locked);
            if (status.locked) {
                containerEl.style.position = containerEl.style.position || 'relative';
                containerEl.appendChild(this.buildShadowLockOverlay(status));
            }
            return status;
        },

        // ───────────────────────── Aura Color ─────────────────────────
        applyAura() {
            const aura = localStorage.getItem(AURA_KEY);
            if (aura) {
                document.documentElement.style.setProperty('--sys-cyan', aura);
                document.documentElement.style.setProperty('--sys-cyan-glow', aura + '99');
            }
        },

        // ───────────────────────── Navigation Grid: Auto-highlight the active link ─────────────────────────
        highlightActiveNav() {
            const here = (location.pathname.split('/').pop() || 'index11.html').toLowerCase();
            document.querySelectorAll('#sovereign-nav a.nav-item').forEach(a => {
                const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
                const active = href === here;
                a.classList.toggle('nav-item-active', active);
                if (active) a.setAttribute('aria-current', 'page');
                else a.removeAttribute('aria-current');
            });
        },

        // ───────────────────────── Identity Badge Injection (static name + mutable title) ─────────────────────────
        renderIdentityStrip() {
            const realName = this.getRealName();
            const activeTitle = this.getActiveTitleText();
            const level = this.data.level || 1;

            document.querySelectorAll('[data-sov-name]').forEach(el => {
                if (realName) el.textContent = realName;
            });
            document.querySelectorAll('[data-sov-title]').forEach(el => {
                if (activeTitle) {
                    el.textContent = `[ ${activeTitle} ]`;
                    el.classList.add('active');
                } else {
                    el.textContent = '';
                    el.classList.remove('active');
                }
            });
            document.querySelectorAll('[data-sov-level]').forEach(el => { el.textContent = level; });
        },

        init() {
            load();
            this.applyAura();
            this.renderIdentityStrip();
            this.highlightActiveNav();
            notify('init');
        }
    };

    // ───────────────────────── Unified Sync Pipeline ─────────────────────────
    // Only one storage listener for the entire system — replaces all old scattered listeners
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            load();
            SovereignCore.renderIdentityStrip();
            notify('cross-tab');
        } else if (e.key === AURA_KEY) {
            SovereignCore.applyAura();
        } else if (e.key === TITLES_KEY) {
            SovereignCore.renderIdentityStrip();
            notify('titles-index');
        }
    });

    if (bc) {
        bc.onmessage = (event) => {
            const type = event.data && event.data.type;
            if (type === 'SYSTEM_DATA_UPDATED' || type === 'TITLE_EQUIPPED') {
                load();
                SovereignCore.renderIdentityStrip();
                notify('broadcast');
            }
        };
    }

    document.addEventListener('DOMContentLoaded', () => SovereignCore.init());

    window.SovereignCore = SovereignCore;
})(window);