// src/components/Modal.jsx
import { useRef, useEffect } from 'react';
import './Modal.css';

/**
 * Bottom-sheet modal untuk edit parameter.
 * Props:
 *   open     - boolean
 *   title    - string
 *   subtitle - string (hint)
 *   value    - current value
 *   onClose  - fn()
 *   onConfirm - fn(newValue: string)
 */
export default function Modal({ open, title, subtitle, value = '', onClose, onConfirm }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm?.(inputRef.current?.value || '');
    onClose?.();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose?.();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">{title}</div>
        <div className="modal-sub">{subtitle}</div>
        <input
          ref={inputRef}
          className="modal-input"
          type="text"
          inputMode="decimal"
          defaultValue={value}
          onKeyDown={handleKey}
        />
        <div className="modal-btns">
          <button className="mbtn cancel"  onClick={onClose}>Cancel</button>
          <button className="mbtn confirm" onClick={handleConfirm}>Apply ✓</button>
        </div>
      </div>
    </div>
  );
}
