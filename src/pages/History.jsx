import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext.jsx';
import s from './History.module.css';

const PERIODS = ['Today', 'Week', 'Month', 'All'];

// ── Period boundary (unix seconds) ───────────────────────────────────
function periodStart(period) {
  const now = new Date();
  if (period === 'Today')
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
  if (period === 'Week') {
    const diff = (now.getDay() + 6) % 7; // Mon = 0
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff).getTime() / 1000;
  }
  if (period === 'Month')
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
  return 0; // All
}

// ── Compute stats from filtered trade array ───────────────────────────
function computeStats(trades) {
  let wins = 0, losses = 0, grossWin = 0, grossLoss = 0, net = 0;
  let best = 0, streak = 0;

  for (const t of trades) {
    const p = t.profit ?? 0;
    net += p;
    if (p >= 0) {
      wins++;   grossWin  += p;  if (p > best) best = p;
      streak = streak >= 0 ? streak + 1 : 1;
    } else {
      losses++; grossLoss += Math.abs(p);
      streak = streak <= 0 ? streak - 1 : -1;
    }
  }

  const total = wins + losses;
  return {
    total, wins, losses,
    winRate:       total > 0 ? (wins / total * 100) : 0,
    netProfit:     net,
    profitFactor:  grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? 99 : 0),
    avgWin:        wins   > 0 ? grossWin  / wins   : 0,
    avgLoss:       losses > 0 ? grossLoss / losses : 0,
    rrRatio:       (wins > 0 && losses > 0) ? (grossWin / wins) / (grossLoss / losses) : 0,
    bestTrade:     best,
    currentStreak: streak,
  };
}

export default function History() {
  const { activeState: d, activeHistory: trades } = useApp();
  const [period, setPeriod] = useState('All');

  // ── Filter trades by period ───────────────────────────────────────
  const filtered = useMemo(() => {
    const since = periodStart(period);
    return since === 0 ? trades : trades.filter(t => (t.closeTime ?? 0) >= since);
  }, [trades, period]);

  // ── Recompute all stats from filtered list ────────────────────────
  const st = useMemo(() => computeStats(filtered), [filtered]);
  const streakUp = st.currentStreak >= 0;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.title}>History</div>
          <div className={s.sub}>{period === 'All' ? 'All trades' : period} · {d?.symbol ?? '—'}</div>
        </div>
      </div>

      {/* Period filter */}
      <div className={s.periods}>
        {PERIODS.map(p => (
          <button key={p} className={`${s.pBtn} ${period === p ? s.pActive : ''}`}
                  onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>

      {/* Winrate card — recomputed from filtered trades */}
      <div className={`card ${s.wrCard}`}>
        <div className={s.wrTop}>
          <div className={s.wrPct}>{st.winRate.toFixed(1)}%</div>
          <div className={s.wrWL}>
            <span className={s.wins}>{st.wins}W</span>
            <span className={s.loss}>{st.losses}L</span>
          </div>
        </div>
        <div className={s.wrBar}>
          <div className={s.wrFill} style={{ width: st.winRate + '%' }} />
        </div>
        <div className={s.wrStats}>
          {[
            { lbl: 'Net P&L',  val: (st.netProfit >= 0 ? '+' : '') + st.netProfit.toFixed(2),
                                cls: st.netProfit >= 0 ? 'green' : 'red' },
            { lbl: 'P.Factor', val: st.profitFactor > 0 ? st.profitFactor.toFixed(2) : '—', cls: '' },
            { lbl: 'Streak',   val: (streakUp ? '▲' : '▼') + Math.abs(st.currentStreak),
                                cls: streakUp ? 'green' : 'red' },
            { lbl: 'R:R',      val: st.rrRatio > 0 ? st.rrRatio.toFixed(2) : '—', cls: '' },
          ].map(c => (
            <div key={c.lbl}>
              <div className={s.wrStLbl}>{c.lbl}</div>
              <div className={`${s.wrStVal} ${c.cls}`}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2x2 summary — from filtered trades */}
      <div className={s.grid2}>
        {[
          { lbl: 'Avg Win',    val: st.avgWin  > 0 ? '+$' + st.avgWin.toFixed(2)  : '—', cls: 'green', sub: 'per trade' },
          { lbl: 'Avg Loss',   val: st.avgLoss > 0 ? '−$' + st.avgLoss.toFixed(2) : '—', cls: 'red',   sub: 'per trade' },
          { lbl: 'Best Trade', val: st.bestTrade > 0 ? '+$' + st.bestTrade.toFixed(2) : '—', cls: 'green', sub: period },
          { lbl: 'Trades',     val: String(st.total), cls: 'amber', sub: period },
        ].map(c => (
          <div key={c.lbl} className={`card ${s.g2card}`}>
            <div className={s.g2lbl}>{c.lbl}</div>
            <div className={`${s.g2val} ${c.cls}`}>{c.val}</div>
            <div className={s.g2sub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Trade list — filtered */}
      <div className="section-title">
        {filtered.length} Trade{filtered.length !== 1 ? 's' : ''} · {period}
      </div>
      <div className={s.tlist}>
        {filtered.length === 0
          ? <div className={s.noTrades}>
              {trades.length === 0 ? 'No trades yet' : 'No trades in this period'}
            </div>
          : filtered.map(t => (
              <div key={t.ticket} className={`card card-sm ${s.titem}`}>
                <div className={`${s.tdir} ${t.dir === 'BUY' ? s.tbuy : s.tsell}`}>
                  {t.dir === 'BUY' ? 'B' : 'S'}
                </div>
                <div className={s.tinfo}>
                  <div className={s.tpair}>{t.symbol} · {t.lots}</div>
                  <div className={s.tmeta}>{t.closeReason} · {fmtTime(t.closeTime)}</div>
                </div>
                <div className={`${s.tpnl} ${t.profit >= 0 ? 'up' : 'down'}`}>
                  {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}

function fmtTime(unix) {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return d.toLocaleDateString('en', { day: '2-digit', month: 'short' }) + ' '
       + d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}
