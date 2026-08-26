/**
 * =============================================================================
 * THEME — shared light/dark scheme for the whole platform
 * =============================================================================
 * Single source of truth for the color scheme across the main app AND every
 * /system/<slug> submodule: all apps share the same origin, so the choice is
 * persisted once in localStorage under 'hrm_theme' and applied by setting
 * data-theme on <html>. Dark = HRM navy/gold (default); light = marketplace
 * palette. Cross-tab/app sync via the 'storage' event.
 * =============================================================================
 */

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'hrm_theme';

export function getTheme(): Theme {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch {
        return 'dark';
    }
}

export function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private mode */ }
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent('hrm-theme-changed', { detail: theme }));
}

export function toggleTheme(): Theme {
    const next: Theme = getTheme() === 'light' ? 'dark' : 'light';
    setTheme(next);
    return next;
}

/** Apply the persisted theme immediately and follow changes made in other
 *  tabs or other /system sub-apps. Call once before first render. */
export function initTheme() {
    applyTheme(getTheme());
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) applyTheme(getTheme());
    });
}
