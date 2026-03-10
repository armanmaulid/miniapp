import { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext.jsx';
import s from './EditModal.module.css';

// ── Validation rules per param key ────────────────────────────────────
const RULES = {
  risk:       { min: 0.01, max: 20,   step: 'decimal', msg: '0.01 – 20%' },
  tp:         { min: 1,    max: 99999, step: 'decimal', msg: '> 0 points' },
  sl:         { min: 1,    max: 99999, step: 'decimal', msg: '> 0 points' },
  tsl:        { min: 1,    max: 99999, step: 'decimal', msg: '> 0 points' },
  tsltrig:    { min: 1,    max: 99999, step: 'decimal', msg: '> 0 points' },
  orderdist:  { min: 1,    max: 99999, step: 'decimal', msg: '> 0 points' },
  barsn:      { min: 1,    max: 50,    step: 'numeric', msg: '1 – 50' },
  starthour:  { min: 0,    max: 23,    step: 'numeric', msg: '0 (24h) – 23' },
  endhour:    { min: 0,    max: 23,    step: 'numeric', msg: '0 (24h) – 23' },
  stopbefore: { min: 0,    max: 240,   step: 'numeric', msg: '0 – 240 min' },
  startafter: { min: 0,    max: 240,   step: 'numeric', msg: '0 – 240 min' },
  currencies: { text: true,            step: 'text',    msg: 'e.g. USD,EUR' },
};

function validate(key, raw) {
  const rule = RULES[key];
  if (!rule) return null;
  if (rule.text) {
    return raw.trim().length === 0 ? 'Tidak boleh kosong' : null;
  }
  const n = parseFloat(raw);
  if (isNaN(n))       return 'Harus angka';
  if (n < rule.min)   return `Min ${rule.min}`;
  if (n > rule.max)   return `Max ${rule.max}`;
  return null;
}

const FIELD_MAP = {
  risk: 'riskPercent',   tp: 'tpPoints',      sl: 'slPoints',
  tsl: 'tslPoints',      tsltrig: 'tslTrigger', orderdist: 'orderDist',
  barsn: 'barsN',        starthour: 'startHour', endhour: 'endHour',
  stopbefore: 'stopBeforeMin', startafter: 'startAfterMin', currencies: 'keyCurrencies',
};

export default function EditModal({ param, onClose }) {
  const { activeState, actions, state } = useApp();
  const inputRef = useRef(null);
  const [val, setVal] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!param || !activeState) return;
    const field = FIELD_MAP[param.key];
    setVal(String(activeState[field] ?? ''));
    setErr(null);
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [param]); // eslint-disable-line

  if (!param) return null;

  const handleChange = (v) => {
    setVal(v);
    setErr(validate(param.key, v));
  };

  const confirm = async () => {
    const e = validate(param.key, val);
    if (e) { setErr(e); return; }

    setBusy(true);
    const result = await actions.command('set_param', param.key, val.trim());
    setBusy(false);

    if (result === 'timeout') {
      setErr('EA tidak merespons — command terkirim, akan aktif saat EA online');
      return;
    }
    onClose();
  };

  const rule = RULES[param.key];
  const inputMode = rule?.step === 'numeric' ? 'numeric'
                  : rule?.text              ? 'text'
                  : 'decimal';

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.sheet}>
        <div className={s.handle} />
        <div className={s.title}>{param.label}</div>
        <div className={s.sub}>{rule?.msg || param.hint}</div>

        <input
          ref={inputRef}
          className={`${s.input} ${err ? s.inputErr : ''}`}
          value={val}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !busy && confirm()}
          inputMode={inputMode}
        />

        {err && <div className={s.errMsg}>⚠ {err}</div>}

        <div className={s.btns}>
          <button className={`${s.btn} ${s.cancel}`}  onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className={`${s.btn} ${s.confirm}`} onClick={confirm} disabled={!!err || busy}>
            {busy ? '⏳ Sending…' : 'Apply ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
