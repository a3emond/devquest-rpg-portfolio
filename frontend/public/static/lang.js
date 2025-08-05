// static/lang.js

// Key used to store the preferred language in localStorage
const LANG_KEY = 'preferred_lang';

// List of supported language codes
const SUPPORTED_LANGS = ['en', 'fr'];

// Language change listeners
let listeners = [];

/**
 * Returns the currently selected language.
 * Prefers localStorage, then browser language, defaults to 'en'.
 */
export function getCurrentLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (SUPPORTED_LANGS.includes(stored)) return stored;

    const browserLang = navigator.language?.substring(0, 2) || 'en';
    return SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en';
}

/**
 * Sets a new language and notifies listeners.
 * @param {string} lang
 */
export function setLang(lang) {
    if (SUPPORTED_LANGS.includes(lang)) {
        localStorage.setItem(LANG_KEY, lang);
        notifyLangChange(lang);
    }
}

/**
 * Toggles language between 'en' and 'fr'
 */
export function toggleLang() {
    const current = getCurrentLang();
    setLang(current === 'en' ? 'fr' : 'en');
}

/**
 * Registers a callback to be called when the language changes
 * @param {Function} callback
 */
export function onLangChange(callback) {
    listeners.push(callback);
    callback(getCurrentLang()); // Call immediately with current lang
}

/**
 * Notifies all listeners of a language change
 * @param {string} lang
 */
function notifyLangChange(lang) {
    listeners.forEach(fn => fn(lang));
    applyTranslations(); // Apply after notifying
    updateLangButton(lang);
}

/**
 * Resolves a dot-path key like 'sections.about.title' from a nested object
 * @param {string} path
 * @param {object} obj
 * @returns {*} resolved value or undefined
 */
function resolveTranslation(path, obj) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * Applies text and placeholder translations from the current language JSON
 */
export async function applyTranslations() {
    const lang = getCurrentLang();
    try {
        const response = await fetch(`static/${lang}.json`);
        if (!response.ok) throw new Error("Translation file not found");

        const translations = await response.json();

        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = resolveTranslation(key, translations);
            if (value) el.textContent = value;
        });

        // Placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = resolveTranslation(key, translations);
            if (value) el.setAttribute('placeholder', value);
        });

    } catch (err) {
        console.error("Failed to apply translations:", err);
    }
}

/**
 * Updates the language toggle button label to current lang (EN/FR)
 * @param {string} lang
 */
function updateLangButton(lang) {
    const btn = document.getElementById('langToggleBtn');
    if (btn) {
        btn.innerText = lang.toUpperCase();
    }
}

// Initial language setup on page load
document.addEventListener("DOMContentLoaded", () => {
    const current = getCurrentLang();
    applyTranslations();
    updateLangButton(current);
});
