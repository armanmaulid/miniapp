import s from './BottomNav.module.css';

const TABS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'control',   icon: '🎛️', label: 'Control'   },
  { id: 'params',    icon: '⚙️',  label: 'Params'   },
  { id: 'history',   icon: '📋', label: 'History'   },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className={s.nav}>
      {TABS.map(t => (
        <div key={t.id} className={`${s.item} ${active===t.id?s.active:''}`}
             onClick={() => onChange(t.id)}>
          <div className={s.pip} />
          <div className={s.icon}>{t.icon}</div>
          <div className={s.label}>{t.label}</div>
        </div>
      ))}
    </nav>
  );
}
