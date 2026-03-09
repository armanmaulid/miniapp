// src/hooks/useTelegram.js
// ─────────────────────────────────────────────────────────
//  Wraps Telegram.WebApp SDK.
//  Telegram injects window.Telegram.WebApp via the script tag in index.html.
//  Jika bukan di dalam Telegram (dev/browser), fallback ke defaults.
// ─────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';

const tg = window?.Telegram?.WebApp;

export default function useTelegram() {
  const [colorScheme, setColorScheme] = useState(
    tg?.colorScheme || 'dark'
  );

  useEffect(() => {
    if (!tg) return;
    // Init
    tg.ready();
    tg.expand();           // Fullscreen
    tg.disableVerticalSwipes?.(); // Prevent accidental close on scroll

    // Listen for theme change (user switches TG theme)
    tg.onEvent?.('themeChanged', () => {
      setColorScheme(tg.colorScheme);
    });
  }, []);

  return {
    tg,
    colorScheme,              // 'dark' | 'light'
    user:  tg?.initDataUnsafe?.user  || null,
    close: () => tg?.close?.(),
    haptic: (type = 'light') => tg?.HapticFeedback?.impactOccurred?.(type),
  };
}
