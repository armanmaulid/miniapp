import { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext.jsx';
import s from './EditModal.module.css';

export default function EditModal({ param, onClose }) {
  const { activeState, actions } = useApp();
  const inputRef = useRef(null);
  const [val, setVal] = useState('');

  // Pre-fill current value when modal opens
  useEffect(() => {
    if (!param || !activeState) return;
    const map = {
      risk: activeState.riskPercent,   tp: activeState.tpPoints,
      sl:   activeState.slPoints,      tsl: activeState.tslPoints,
      tsltrig: activeState.tslTrigger, orderdist: activeState.orderDist,
      barsn: activeState.barsN,        starthour: activeState.startHour,
      endhour: activeState.endHour,    stopbefore: activeState.stopBeforeMin,
      startafter: activeState.startAfterMin, currencies: activeState.keyCurrencies,
    };
    setVal(String(map[param.key] ?? ''));
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [param, activeState]);

  if (!param) return null;

  const confirm = async () => {
    if (!val.trim()) return;
    await actions.command('set_param', param.key, val.trim());
    onClose();
  };

  return (
    <div className={s.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={s.sheet}>
        <div className={s.handle} />
        <div className={s.title}>{param.label}</div>
        <div className={s.sub}>{param.hint}</div>
        <input
          ref={inputRef}
          className={s.input}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key==='Enter' && confirm()}
          inputMode={param.key==='currencies' ? 'text' : 'decimal'}
        />
        <div className={s.btns}>
          <button className={`${s.btn} ${s.cancel}`}  onClick={onClose}>Cancel</button>
          <button className={`${s.btn} ${s.confirm}`} onClick={confirm}>Apply ✓</button>
        </div>
      </div>
    </div>
  );
}
