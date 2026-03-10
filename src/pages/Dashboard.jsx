import { useApp } from '../store/AppContext.jsx';
import EquityChart from '../components/EquityChart.jsx';
import s from './Dashboard.module.css';

const fmt = (n, dec = 2) => (n != null ? (n >= 0 ? '+' : '') + n.toFixed(dec) : '—');

export default function Dashboard() {
  const { activeState: d, activeEq, state, actions } = useApp();
  const { instances, states, activePair } = state;

  if (!d) return (
    <div className={s.empty}>
      <div className={s.emptyIcon}>📡</div>
      <div>Waiting for EA data…</div>
      <div className={s.emptySub}>Pastikan iOT_WebPush aktif di MT5</div>
    </div>
  );

  const pnlUp = (d.netProfit ?? 0) >= 0;

  return (
    <div className={s.page}>

      {/* Hero: pair + price + theme toggle */}
      <div className={s.hero}>
        <div>
          <div className={s.pairName}>{d.symbol} · {d.instrumentStr || d.timeframe}</div>
          <div className={s.price}>
            {d.bid ? d.bid.toLocaleString('en', { minimumFractionDigits: 2 }) : '—'}
          </div>
        </div>
        <div className={s.heroRight}>
          <div className={`pill ${d.online !== false ? 'pill-green' : 'pill-muted'}`}>
            {d.online !== false ? '● LIVE' : '● OFFLINE'}
          </div>
          {/* #6 — Theme toggle */}
          <button className={s.themeBtn} onClick={actions.toggleTheme}
                  title="Toggle dark/light mode">
            {state.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Equity chart — #1 fallback ke balance */}
      <div className={`card ${s.chartCard}`}>
        <div className={s.chartHeader}>
          <div>
            <div className={s.chartLbl}>Equity Curve</div>
          </div>
          <div className={`${s.chartPnl} ${pnlUp ? 'up' : 'down'}`}>
            {fmt(d.netProfit)}
          </div>
        </div>
        <EquityChart data={activeEq} balance={d.balance} />
      </div>

      {/* 3 stats */}
      <div className={s.stats3}>
        {[
          { lbl: 'Balance', val: '$' + d.balance.toFixed(2),  sub: d.accountType,                                             accent: 'green' },
          { lbl: 'Equity',  val: '$' + d.equity.toFixed(2),   sub: (d.floatPnL >= 0 ? '+' : '') + '$' + Math.abs(d.floatPnL || 0).toFixed(2) + ' float', accent: 'blue' },
          { lbl: 'Today',   val: fmt(d.todayProfit),           sub: (d.todayTrades ?? d.totalTrades) + ' trades',             accent: 'amber' },
        ].map(c => (
          <div key={c.lbl} className={`card ${s.stat}`}>
            <div className={s.statAccent} data-accent={c.accent} />
            <div className={s.statLbl}>{c.lbl}</div>
            <div className={`${s.statVal} ${c.accent}`}>{c.val}</div>
            <div className={s.statSub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* All instances — #7 multi-account: tampilkan REAL/DEMO badge */}
      <div className="section-title">All Instances</div>
      <div className={s.instances}>
        <div className={`card ${s.instancesCard}`}>
          {instances.map(inst => {
            const id  = `${inst.magic}:${inst.symbol}`;
            const st  = states[id];
            const pnl = st?.todayProfit ?? 0;
            const lag = st?.lagSecs ?? 0;
            const isOffline = lag >= 10;
            const acType = st?.accountType;

            return (
              <div key={id}
                   className={`${s.chip} ${id === activePair ? s.chipActive : ''} ${isOffline ? s.chipOffline : ''}`}
                   onClick={() => actions.selectPair(id)}>
                <div className={`${s.chipDot} ${isOffline ? s.cdOff : st?.newsActive ? s.cdWarn : s.cdOn}`} />
                <span className={s.chipName}>{inst.symbol}</span>
                {/* #7 — Account type badge */}
                {acType && (
                  <span className={`${s.acBadge} ${acType === 'REAL' ? s.acReal : s.acDemo}`}>
                    {acType}
                  </span>
                )}
                <span className={`${s.chipPnl} ${pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'flat'}`}>
                  {(pnl >= 0 ? '+' : '')}${Math.abs(pnl).toFixed(2)}
                </span>
                {st?.isPaused && <span className={s.chipPause}>⏸</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* #5 — Open Positions — detail per position jika ada, summary jika tidak */}
      <div className="section-title">Open Positions</div>
      <div className={s.positions}>
        {(d.openPositions ?? 0) > 0 || (d.pendingOrders ?? 0) > 0
          ? <PositionDetail d={d} />
          : (
            <div className={`card ${s.noPosCard}`}>
              <div className={s.noPosIcon}>📭</div>
              <div>No open positions</div>
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── #5 Position Detail ────────────────────────────────────────────────
function PositionDetail({ d }) {
  const floatPnL  = d.floatPnL  ?? 0;
  const openPos   = d.openPositions  ?? 0;
  const pending   = d.pendingOrders  ?? 0;

  const rows = [];

  if (openPos > 0) {
    rows.push({
      icon:  floatPnL >= 0 ? '📈' : '📉',
      label: `${openPos} Position${openPos > 1 ? 's' : ''}`,
      sub:   d.symbol,
      val:   (floatPnL >= 0 ? '+' : '') + '$' + Math.abs(floatPnL).toFixed(2),
      cls:   floatPnL >= 0 ? 'up' : 'down',
    });
  }

  if (pending > 0) {
    rows.push({
      icon:  '⏳',
      label: `${pending} Pending Order${pending > 1 ? 's' : ''}`,
      sub:   d.symbol + ' · waiting entry',
      val:   '—',
      cls:   'flat',
    });
  }

  return (
    <div className={s.posCards}>
      {rows.map(r => (
        <div key={r.label} className={`card card-sm ${s.posRow}`}>
          <div className={s.posIcon}>{r.icon}</div>
          <div className={s.posInfo}>
            <div className={s.posLabel}>{r.label}</div>
            <div className={s.posSub}>{r.sub}</div>
          </div>
          <div className={`${s.posVal} ${r.cls}`}>{r.val}</div>
        </div>
      ))}

      {/* Equity summary bar */}
      <div className={`card ${s.eqBar}`}>
        <div className={s.eqRow}>
          <span className="muted" style={{ fontSize: 11 }}>Balance</span>
          <span className="mono white" style={{ fontSize: 13, fontWeight: 700 }}>
            ${d.balance?.toFixed(2) ?? '—'}
          </span>
        </div>
        <div className={s.eqRow}>
          <span className="muted" style={{ fontSize: 11 }}>Equity</span>
          <span className={`mono ${floatPnL >= 0 ? 'green' : 'red'}`} style={{ fontSize: 13, fontWeight: 700 }}>
            ${d.equity?.toFixed(2) ?? '—'}
          </span>
        </div>
        <div className={s.eqRow}>
          <span className="muted" style={{ fontSize: 11 }}>Float P&L</span>
          <span className={`mono ${floatPnL >= 0 ? 'green' : 'red'}`} style={{ fontSize: 13, fontWeight: 700 }}>
            {(floatPnL >= 0 ? '+' : '')}${Math.abs(floatPnL).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
