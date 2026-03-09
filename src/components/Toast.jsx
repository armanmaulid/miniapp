import { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import s from './Toast.module.css';

export default function Toast() {
  const { state } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!state.toast) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, [state.toast?.key]);

  if (!visible || !state.toast) return null;
  return <div className={s.toast}>{state.toast.msg}</div>;
}
