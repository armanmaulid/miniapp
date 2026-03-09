import { useApp } from '../store/AppContext.jsx';
import s from './PairBar.module.css';

export default function PairBar() {
  const { state, actions } = useApp();
  const { instances, activePair, states } = state;
  if (instances.length === 0) return null;

  return (
    <div className={s.bar}>
      {instances.map(inst => {
        const id  = `${inst.magic}:${inst.symbol}`;
        const st  = states[id];
        const pnl = st?.todayProfit ?? 0;
        return (
          <div key={id} className={`${s.tab} ${id===activePair?s.active:''}`}
               onClick={() => actions.selectPair(id)}>
            <div className={`${s.dot} ${st?.newsActive?s.dw:inst.online?s.do:s.df}`} />
            <span className={s.name}>{inst.symbol}</span>
            <span className={`${s.pnl} ${pnl>0?s.pu:pnl<0?s.pd:s.pf}`}>
              {(pnl>=0?'+':'')}${Math.abs(pnl).toFixed(2)}
            </span>
            {st?.isPaused && <span className={s.pi}>⏸</span>}
          </div>
        );
      })}
      <div className={s.add}>＋</div>
    </div>
  );
}
