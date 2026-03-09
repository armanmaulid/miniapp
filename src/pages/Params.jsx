import { useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import EditModal from '../components/EditModal.jsx';
import s from './Params.module.css';

const GROUPS = [
  { title: 'Risk & Entry', params: [
    { key:'risk',      label:'Risk %',        hint:'0.01 – 20%',   fmt: v => v+'%'      },
    { key:'tp',        label:'Take Profit',   hint:'Points',        fmt: v => v+' pts'   },
    { key:'sl',        label:'Stop Loss',     hint:'Points',        fmt: v => v+' pts'   },
    { key:'tsl',       label:'TSL Step',      hint:'Points',        fmt: v => v+' pts'   },
    { key:'tsltrig',   label:'TSL Trigger',   hint:'Points',        fmt: v => v+' pts'   },
    { key:'orderdist', label:'Order Dist',    hint:'Points',        fmt: v => v+' pts'   },
    { key:'barsn',     label:'BarsN',         hint:'1 – 50',        fmt: v => v          },
  ]},
  { title: 'Trading Hours', params: [
    { key:'starthour', label:'Start Hour', hint:'0 = 24h disabled', fmt: v => v===0?'0 (24h)':v+'h' },
    { key:'endhour',   label:'End Hour',   hint:'0 = 24h disabled', fmt: v => v===0?'0 (24h)':v+'h' },
  ]},
  { title: 'News Filter', params: [
    { key:'currencies', label:'Currencies', hint:'e.g. USD,EUR,GBP', fmt: v => v },
    { key:'stopbefore', label:'Stop Before', hint:'0 – 240 min',     fmt: v => v+' min' },
    { key:'startafter', label:'Start After', hint:'0 – 240 min',     fmt: v => v+' min' },
  ]},
];

// Map param.key → dataStore field
const FIELD = {
  risk:'riskPercent', tp:'tpPoints', sl:'slPoints', tsl:'tslPoints',
  tsltrig:'tslTrigger', orderdist:'orderDist', barsn:'barsN',
  starthour:'startHour', endhour:'endHour',
  currencies:'keyCurrencies', stopbefore:'stopBeforeMin', startafter:'startAfterMin',
};

export default function Params() {
  const { activeState: d } = useApp();
  const [modal, setModal] = useState(null);

  if (!d) return <div className={s.empty}>No EA data</div>;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.title}>Parameters</div>
          <div className={s.sub}>{d.symbol} · tap nilai untuk edit</div>
        </div>
      </div>

      <div className={s.groups}>
        {GROUPS.map(g => (
          <div key={g.title} className={`card ${s.group}`}>
            <div className={s.groupHdr}>{g.title}</div>
            {g.params.map(p => {
              const val = d[FIELD[p.key]];
              return (
                <div key={p.key} className={s.row} onClick={() => setModal(p)}>
                  <div className={s.rowLbl}>{p.label}</div>
                  <div className={`${s.rowVal} ${p.key==='risk'?s.amber:p.key==='tp'?s.green:''}`}>
                    {p.fmt(val ?? '—')} <span className={s.editIco}>✎</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Read-only info */}
        <div className={`card ${s.group}`}>
          <div className={s.groupHdr}>Info (read-only)</div>
          {[
            { lbl:'Instrument', val: d.instrumentStr || d.symbol },
            { lbl:'Timeframe',  val: d.timeframe || d.timeframeStr },
            { lbl:'Magic #',    val: d.magic },
            { lbl:'EA Version', val: d.version },
            { lbl:'Account',    val: d.accountType + ' · ' + d.accountCurrency },
          ].map(r => (
            <div key={r.lbl} className={s.row}>
              <div className={s.rowLbl}>{r.lbl}</div>
              <div className={`${s.rowVal} ${s.ro}`}>{r.val ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {modal && <EditModal param={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
