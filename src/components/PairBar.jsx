import { useApp } from '../store/AppContext.jsx';
import s from './PairBar.module.css';

// Instance dianggap offline jika lagSecs >= threshold ini
const OFFLINE_HIDE_SECS = 10;

export default function PairBar() {
  const { state, actions } = useApp();
  const { instances, activePair, states } = state;
  if (instances.length === 0) return null;

  // ── Filter: sembunyikan instance yang offline >= 10 detik ──────────
  // lagSecs diisi oleh pollActive() dari /api/status (polling 4s)
  // Jika state belum ada (loading pertama), tetap tampilkan
  const visible = instances.filter(inst => {
    const id = `${inst.magic}:${inst.symbol}`;
    const st = states[id];
    if (!st) return true;                    // belum di-poll, tampilkan dulu
    return (st.lagSecs ?? 0) < OFFLINE_HIDE_SECS;
  });

  // Jika active pair ikut hilang, jangan crash — komponen parent akan handle
  if (visible.length === 0) return null;

  return (
    <div className={s.bar}>
      {visible.map(inst => {
        const id  = `${inst.magic}:${inst.symbol}`;
        const st  = states[id];
        const pnl = st?.todayProfit ?? 0;
        const lag = st?.lagSecs ?? 0;

        // Status dot: news warning / online / offline
        const dotCls = st?.newsActive ? s.dw
                     : (lag < OFFLINE_HIDE_SECS && st?.online !== false) ? s.do
                     : s.df;

        return (
          <div key={id}
               className={`${s.tab} ${id === activePair ? s.active : ''}`}
               onClick={() => actions.selectPair(id)}>
            <div className={`${s.dot} ${dotCls}`} />
            <span className={s.name}>{inst.symbol}</span>
            <span className={`${s.pnl} ${pnl > 0 ? s.pu : pnl < 0 ? s.pd : s.pf}`}>
              {(pnl >= 0 ? '+' : '')}${Math.abs(pnl).toFixed(2)}
            </span>
            {st?.isPaused && <span className={s.pi}>⏸</span>}
          </div>
        );
      })}
      <div className={s.add}>＋</div>
    </div>
  );
}
