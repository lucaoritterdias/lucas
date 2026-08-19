export const THEME_KEY = "lrd-theme";

/** Injected in <head> so the first painted frame already carries the right theme. */
export const themeBootScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;
