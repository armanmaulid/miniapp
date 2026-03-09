import { useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import s from './History.module.css';

const PERIODS = ['Today','Week','Month','All'];

export default function History() {
  const { activeState: d, activeHistory: trades } = useApp();
  const [period, setPeriod] = useState('All');

  const wr = d?.winRate ?? 0;
  const wins   = d?.totalWins   ?? 0;
  const total  = d?.totalTrades ?? 0;
  const losses = total - wins;
  const streak = d?.currentStreak ?? 0;
  const streakUp = streak >= 0;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.title}>History</div>
          <div className={s.sub}>All trades · {d?.symbol ?? '—'}</div>
        </div>
      </div>

      {/* Period filter */}
      <div className={s.periods}>
        {PERIODS.map(p => (
          <button key={p} className={`${s.pBtn} ${period===p?s.pActive:''}`}
                  onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>

      {/* Winrate card */}
      <div className={`card ${s.wrCard}`}>
        <div className={s.wrTop}>
          <div className={s.wrPct}>{wr.toFixed(1)}%</div>
          <div className={s.wrWL}>
            <span className={s.wins}>{wins}W</span>
            <span className={s.loss}>{losses}L</span>
          </div>
        </div>
        <div className={s.wrBar}>
          <div className={s.wrFill} style={{width:wr+'%'}} />
        </div>
        <div className={s.wrStats}>
          {[
            { lbl:'Net P&L',  val: (d?.netProfit>=0?'+':'')+d?.netProfit?.toFixed(2),  cls:'green' },
            { lbl:'P.Factor', val: d?.profitFactor?.toFixed(2) ?? '—',                 cls:'' },
            { lbl:'Streak',   val: (streakUp?'▲':'▼')+Math.abs(streak), cls: streakUp?'green':'red' },
            { lbl:'R:R',      val: d?.rrRatio?.toFixed(2) ?? '—',                      cls:'' },
          ].map(c => (
            <div key={c.lbl}>
              <div className={s.wrStLbl}>{c.lbl}</div>
              <div className={`${s.wrStVal} ${c.cls}`}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2x2 summary */}
      <div className={s.grid2}>
        {[
          { lbl:'Avg Win',    val: '+$'+(d?.avgWin?.toFixed(2)??'0.00'),   cls:'green', sub:'per trade' },
          { lbl:'Avg Loss',   val: '−$'+(Math.abs(d?.avgLoss??0).toFixed(2)), cls:'red', sub:'per trade' },
          { lbl:'Best Trade', val: '+$'+(d?.bestTrade?.toFixed(2)??'0.00'), cls:'green', sub:'all-time' },
          { lbl:'Max DD',     val: '−$'+(Math.abs(d?.maxDrawdown??0).toFixed(2)), cls:'amber', sub:'drawdown' },
        ].map(c => (
          <div key={c.lbl} className={`card ${s.g2card}`}>
            <div className={s.g2lbl}>{c.lbl}</div>
            <div className={`${s.g2val} ${c.cls}`}>{c.val}</div>
            <div className={s.g2sub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Trade list */}
      <div className="section-title">Recent Trades</div>
      <div className={s.tlist}>
        {trades.length === 0
          ? <div className={s.noTrades}>No trades yet</div>
          : trades.map(t => (
            <div key={t.ticket} className={`card card-sm ${s.titem}`}>
              <div className={`${s.tdir} ${t.dir==='BUY'?s.tbuy:s.tsell}`}>
                {t.dir==='BUY'?'B':'S'}
              </div>
              <div className={s.tinfo}>
                <div className={s.tpair}>{t.symbol} · {t.lots}</div>
                <div className={s.tmeta}>{t.closeReason} · {fmtTime(t.closeTime)}</div>
              </div>
              <div className={`${s.tpnl} ${t.profit>=0?'up':'down'}`}>
                {t.profit>=0?'+':''}${t.profit.toFixed(2)}
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
  return d.toLocaleDateString('en', {day:'2-digit',month:'short'}) + ' '
       + d.toLocaleTimeString('en', {hour:'2-digit',minute:'2-digit'});
}
