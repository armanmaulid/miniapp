import { useApp } from '../store/AppContext.jsx';
import EquityChart from '../components/EquityChart.jsx';
import s from './Dashboard.module.css';

const fmt = (n, dec=2) => (n != null ? (n>=0?'+':'')+n.toFixed(dec) : '—');

export default function Dashboard() {
  const { activeState: d, activeEq, state } = useApp();
  const { instances, states, activePair, actions } = state;

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
      {/* Hero price */}
      <div className={s.hero}>
        <div>
          <div className={s.pairName}>{d.symbol} · {d.instrumentStr || d.timeframe}</div>
          <div className={s.price}>
            {d.bid ? d.bid.toLocaleString('en', {minimumFractionDigits:2}) : '—'}
          </div>
        </div>
        <div className={s.heroRight}>
          <div className={`pill ${d.online!==false?'pill-green':'pill-muted'}`}>
            {d.online!==false?'● LIVE':'● OFFLINE'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={`card ${s.chartCard}`}>
        <div className={s.chartHeader}>
          <div>
            <div className={s.chartLbl}>Equity Curve</div>
          </div>
          <div className={`${s.chartPnl} ${pnlUp?'up':'down'}`}>
            {fmt(d.netProfit)}
          </div>
        </div>
        <EquityChart data={activeEq} />
      </div>

      {/* 3 stats */}
      <div className={s.stats3}>
        {[
          { lbl:'Balance', val:'$'+d.balance.toFixed(2), sub:d.accountType, accent:'green' },
          { lbl:'Equity',  val:'$'+d.equity.toFixed(2),  sub:(d.floatPnL>=0?'+':'')+'$'+Math.abs(d.floatPnL||0).toFixed(2)+' float', accent:'blue' },
          { lbl:'Today',   val:fmt(d.todayProfit),        sub:(d.todayTrades??0)+' trades today', accent:'amber' },
        ].map(c => (
          <div key={c.lbl} className={`card ${s.stat}`}>
            <div className={s.statAccent} data-accent={c.accent} />
            <div className={s.statLbl}>{c.lbl}</div>
            <div className={`${s.statVal} ${c.accent}`}>{c.val}</div>
            <div className={s.statSub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* All instances */}
      <div className="section-title">All Instances</div>
      <div className={s.instances}>
        <div className={`card ${s.instancesCard}`}>
          {instances.map(inst => {
            const id = `${inst.magic}:${inst.symbol}`;
            const st = states[id];
            const pnl = st?.todayProfit ?? 0;
            return (
              <div key={id}
                   className={`${s.chip} ${id===activePair?s.chipActive:''}`}
                   onClick={() => actions.selectPair(id)}>
                <div className={`${s.chipDot} ${st?.isPaused?s.cdOff:st?.newsActive?s.cdWarn:s.cdOn}`} />
                <span className={s.chipName}>{inst.symbol}</span>
                <span className={`${s.chipPnl} ${pnl>0?'up':pnl<0?'down':'flat'}`}>
                  {(pnl>=0?'+':'')}${Math.abs(pnl).toFixed(2)}
                </span>
                {st?.isPaused && <span className={s.chipPause}>⏸</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Positions */}
      <div className="section-title">Open Positions</div>
      <div className={s.positions}>
        {d.openPositions > 0 || d.pendingOrders > 0
          ? <PositionsMock d={d} />
          : <div className={`card ${s.noPosCard}`}>
              <div className={s.noPosIcon}>📭</div>
              <div>No open positions</div>
            </div>
        }
      </div>
    </div>
  );
}

// Placeholder until positions come from real API
function PositionsMock({ d }) {
  return (
    <div className={s.posInfo}>
      <div className="card" style={{padding:'12px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span className="muted" style={{fontSize:12}}>Open positions</span>
          <span className="mono white" style={{fontSize:14,fontWeight:700}}>{d.openPositions}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6}}>
          <span className="muted" style={{fontSize:12}}>Pending orders</span>
          <span className="mono amber" style={{fontSize:14,fontWeight:700}}>{d.pendingOrders}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6}}>
          <span className="muted" style={{fontSize:12}}>Floating P&L</span>
          <span className={`mono ${d.floatPnL>=0?'green':'red'}`} style={{fontSize:14,fontWeight:700}}>
            {(d.floatPnL>=0?'+':'')}${Math.abs(d.floatPnL||0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
