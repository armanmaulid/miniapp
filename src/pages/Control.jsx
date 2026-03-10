import { useApp } from '../store/AppContext.jsx';
import EditModal from '../components/EditModal.jsx';
import { useState } from 'react';
import s from './Control.module.css';

const QUICK_PARAMS = [
  { key:'risk',      label:'Risk %',      hint:'0.01 – 20%',  icon:'🎯' },
  { key:'tp',        label:'Take Profit', hint:'Points',       icon:'📐' },
  { key:'barsn',     label:'BarsN',       hint:'1 – 50',       icon:'📊' },
  { key:'starthour', label:'Start Hour',  hint:'0 = 24h',      icon:'🕐' },
];

export default function Control() {
  const { activeState: d, actions, state } = useApp();
  const [modal, setModal]     = useState(null);
  const [btnBusy, setBtnBusy] = useState(null); // key of busy button

  if (!d) return <div className={s.empty}>No EA data</div>;

  const running = !d.isPaused;

  // ── Generic toggle handler with loading state + timeout UI ──────────
  const handleCmd = async (cmdKey, ...args) => {
    if (btnBusy) return;
    setBtnBusy(cmdKey);
    await actions.command(...args);
    setBtnBusy(null);
  };

  return (
    <div className={s.page}>
      {/* EA Status card */}
      <div className={`card ${s.eaCard}`}>
        <div className={s.eaTop}>
          <div>
            <div className={s.eaLbl}>EA Status</div>
            <div className={`${s.eaVal} ${running ? s.run : s.pau}`}>
              {running ? '▶ RUNNING' : '⏸ PAUSED'}
            </div>
          </div>
          <button
            className={`${s.eaBtn} ${running ? s.pauseBtn : s.resumeBtn} ${btnBusy === 'pause' ? s.busy : ''}`}
            disabled={btnBusy === 'pause'}
            onClick={() => handleCmd('pause', running ? 'pause' : 'resume')}>
            {btnBusy === 'pause'
              ? <span className={s.spinner}>⏳</span>
              : (running ? '⏸ Pause' : '▶ Resume')}
          </button>
        </div>
        <div className={s.pills}>
          <span className={`pill ${d.accountType === 'REAL' ? 'pill-red' : 'pill-blue'}`}>{d.accountType}</span>
          <span className="pill pill-muted mono">{d.symbol}</span>
          <span className="pill pill-muted mono">{d.timeframe}</span>
          <span className={`pill ${d.trailOn ? 'pill-green' : 'pill-muted'}`}>
            {d.trailOn ? 'Trail ON' : 'Trail OFF'}
          </span>
        </div>
      </div>

      {/* News state */}
      <div className={`card ${s.newsCard}`}>
        <div className={`${s.newsLed} ${d.newsActive ? s.nStop : s.nClear}`} />
        <div className={s.newsTxt}>
          <div className={s.newsName}>
            {d.newsActive ? d.newsEventName : 'No news nearby'}
          </div>
          <div className={s.newsEta}>
            {d.newsActive
              ? `Impact: ${d.newsImpact} · ${d.newsCurrency}`
              : 'News filter active'}
          </div>
        </div>
        <span className={`pill ${d.newsActive ? 'pill-red' : 'pill-green'}`}>
          {d.newsActive ? d.newsImpact || 'ACTIVE' : 'CLEAR'}
        </span>
      </div>

      {/* EA offline warning */}
      {d.online === false && (
        <div className={`card ${s.offlineWarn}`}>
          <span>⚠️</span>
          <div>
            <div className={s.offlineTitle}>EA Offline</div>
            <div className={s.offlineSub}>Command akan disimpan dan dieksekusi saat EA kembali online</div>
          </div>
        </div>
      )}

      {/* Toggles */}
      {[
        { sw:'trail', label:'Trailing Stop', desc:`Trig ${d.tslTrigger}pts · Step ${d.tslPoints}pts`,
          on: d.trailOn,      on_act:'trail_on',  off_act:'trail_off' },
        { sw:'news',  label:'News Filter',   desc:`HIGH · ${d.keyCurrencies} · ±${d.stopBeforeMin}min`,
          on: d.newsFilterOn, on_act:'news_on',   off_act:'news_off'  },
      ].map(t => (
        <div key={t.sw} className={`card ${s.toggleCard}`}>
          <div>
            <div className={s.tglName}>{t.label}</div>
            <div className={s.tglDesc}>{t.desc}</div>
          </div>
          <div
            className={`sw ${t.on ? 'on' : ''} ${btnBusy === t.sw ? s.swBusy : ''}`}
            onClick={() => !btnBusy && handleCmd(t.sw, t.on ? t.off_act : t.on_act)}
          />
        </div>
      ))}

      {/* Quick params */}
      <div className="section-title" style={{ paddingTop: 4 }}>Quick Edit</div>
      <div className={s.quickGrid}>
        {QUICK_PARAMS.map(p => (
          <div key={p.key} className={`card ${s.quickBtn}`} onClick={() => setModal(p)}>
            <div className={s.qIcon}>{p.icon}</div>
            <div className={s.qLabel}>{p.label}</div>
            <div className={s.qSub}>{getParamVal(d, p.key)}</div>
          </div>
        ))}
      </div>

      {modal && <EditModal param={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function getParamVal(d, key) {
  const map = {
    risk:      d.riskPercent + '%',
    tp:        d.tpPoints + ' pts',
    barsn:     d.barsN + ' bars',
    starthour: d.startHour === 0 ? '24h (off)' : d.startHour + 'h',
  };
  return map[key] || '—';
}
