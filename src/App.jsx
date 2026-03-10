import { useState, useEffect } from 'react';
import { AppProvider } from './store/AppContext.jsx';
import useTelegram from './hooks/useTelegram.js';
import PairBar    from './components/PairBar.jsx';
import BottomNav  from './components/BottomNav.jsx';
import Toast      from './components/Toast.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import Control    from './pages/Control.jsx';
import Params     from './pages/Params.jsx';
import History    from './pages/History.jsx';
import './styles/theme.css';
import s from './App.module.css';

function Inner() {
  const { colorScheme } = useTelegram();
  const [page, setPage] = useState('dashboard');

  // Force dark theme always
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const PAGES = { dashboard: Dashboard, control: Control, params: Params, history: History };
  const Page  = PAGES[page];

  return (
    <div className={s.app}>
      {/* Telegram-style topbar */}
      <div className={s.topbar}>
        <div className={s.avatar}>🤖</div>
        <div className={s.topInfo}>
          <div className={s.topName}>iOT EA Dashboard</div>
          <div className={s.topSub}>Mini App · @ManksEA_bot</div>
        </div>

      </div>

      {/* Pair switcher bar */}
      <PairBar />

      {/* Page content */}
      <div className={s.pageWrap}>
        <div className={`${s.page} fade-up`} key={page}>
          <Page />
        </div>
      </div>

      {/* Bottom navigation */}
      <BottomNav active={page} onChange={setPage} />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}
