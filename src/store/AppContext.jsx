// src/store/AppContext.jsx
// ─────────────────────────────────────────────────────────────────────
//  Global state: instances, per-pair state, active pair, toast.
//  Polling: /api/instances tiap 30s, /api/status tiap 4s.
// ─────────────────────────────────────────────────────────────────────
import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { fetchInstances, fetchStatus, fetchHistory, sendCommand } from '../api.js';

const CMD_TIMEOUT_MS = 15_000; // 15 detik — EA harus merespons dalam waktu ini

// ── Initial state ────────────────────────────────────────────────────
const INIT = {
  instances:      [],   // InstanceInfo[]
  states:         {},   // { [magic:symbol]: EAState }
  histories:      {},   // { [magic:symbol]: TradeHistory[] }
  eqHistories:    {},   // { [magic:symbol]: EquityPoint[] }
  activePair:     null, // "magic:symbol" string
  theme:          'dark',
  toast:          null, // { msg, key }
  cmdPending:     false, // true saat command sedang dikirim
};

// ── Reducer ─────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_INSTANCES':
      return { ...state, instances: action.payload };

    case 'SET_STATE': {
      const { id, data, eqHistory } = action.payload;
      return {
        ...state,
        states:      { ...state.states,      [id]: data },
        eqHistories: eqHistory
          ? { ...state.eqHistories, [id]: eqHistory }
          : state.eqHistories,
      };
    }

    case 'SET_HISTORY': {
      const { id, trades } = action.payload;
      return { ...state, histories: { ...state.histories, [id]: trades } };
    }

    case 'SET_ACTIVE_PAIR':
      return { ...state, activePair: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'TOAST':
      return { ...state, toast: { msg: action.payload, key: Date.now() } };

    case 'SET_CMD_PENDING':
      return { ...state, cmdPending: action.payload };

    // Optimistic updates — immediately reflect toggle/param changes in UI
    case 'OPTIMISTIC_UPDATE': {
      const { id, patch } = action.payload;
      const prev = state.states[id] || {};
      return { ...state, states: { ...state.states, [id]: { ...prev, ...patch } } };
    }

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ── Provider ─────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const pollRef = useRef(null);

  // ── Helper: pair id string ──────────────────────────────────────────
  const pairId = (magic, symbol) => `${magic}:${symbol}`;

  // ── Load instances ──────────────────────────────────────────────────
  const loadInstances = useCallback(async () => {
    try {
      const { instances } = await fetchInstances();
      dispatch({ type: 'SET_INSTANCES', payload: instances });
      if (!state.activePair && instances.length > 0) {
        const first = instances[0];
        dispatch({ type: 'SET_ACTIVE_PAIR', payload: pairId(first.magic, first.symbol) });
      }
    } catch (e) {
      console.warn('fetchInstances:', e.message);
    }
  }, [state.activePair]);

  // ── Poll active pair state ──────────────────────────────────────────
  const pollActive = useCallback(async () => {
    if (!state.activePair) return;
    const [magic, ...rest] = state.activePair.split(':');
    const symbol = rest.join(':');
    try {
      const res = await fetchStatus(magic, symbol, true);
      if (res.ok && res.state) {
        dispatch({
          type: 'SET_STATE',
          payload: {
            id:        state.activePair,
            data:      { ...res.state, online: res.online, lagSecs: res.lagSecs },
            eqHistory: res.equityHistory,
          },
        });
      }
    } catch (e) {
      console.warn('pollActive:', e.message);
    }
  }, [state.activePair]);

  // ── Load history for active pair (once on pair change) ──────────────
  const loadHistory = useCallback(async () => {
    if (!state.activePair) return;
    const [magic, ...rest] = state.activePair.split(':');
    const symbol = rest.join(':');
    try {
      const res = await fetchHistory(magic, symbol, 50, 0);
      if (res.ok) {
        dispatch({ type: 'SET_HISTORY', payload: { id: state.activePair, trades: res.trades } });
      }
    } catch (e) {
      console.warn('loadHistory:', e.message);
    }
  }, [state.activePair]);

  // ── Start polling ───────────────────────────────────────────────────
  useEffect(() => {
    loadInstances();
    const instTimer = setInterval(loadInstances, 30_000);
    return () => clearInterval(instTimer);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!state.activePair) return;
    pollActive();
    loadHistory();
    pollRef.current = setInterval(pollActive, 4_000);
    return () => clearInterval(pollRef.current);
  }, [state.activePair]); // eslint-disable-line

  // ── Actions exposed to components ───────────────────────────────────
  const actions = {

    selectPair(id) {
      dispatch({ type: 'SET_ACTIVE_PAIR', payload: id });
    },

    toggleTheme() {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      dispatch({ type: 'SET_THEME', payload: next });
      document.documentElement.setAttribute('data-theme', next);
    },

    toast(msg) {
      dispatch({ type: 'TOAST', payload: msg });
    },

    // ── command() — dengan timeout 15 detik ────────────────────────────
    // Returns: 'ok' | 'timeout' | 'error'
    async command(action, param = null, value = null) {
      if (!state.activePair) return 'error';
      const [magic, ...rest] = state.activePair.split(':');
      const symbol = rest.join(':');

      // Optimistic UI update (langsung, sebelum command dikirim)
      const patch = getOptimisticPatch(action, param, value);
      if (Object.keys(patch).length > 0) {
        dispatch({ type: 'OPTIMISTIC_UPDATE', payload: { id: state.activePair, patch } });
      }

      dispatch({ type: 'SET_CMD_PENDING', payload: true });

      // Race: sendCommand vs timeout 15s
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), CMD_TIMEOUT_MS)
      );

      try {
        await Promise.race([
          sendCommand(Number(magic), symbol, action, param, value),
          timeoutPromise,
        ]);
        dispatch({ type: 'SET_CMD_PENDING', payload: false });
        actions.toast(`✓ ${param || action}${value ? ' → ' + value : ''}`);
        return 'ok';
      } catch (e) {
        dispatch({ type: 'SET_CMD_PENDING', payload: false });
        if (e.message === 'TIMEOUT') {
          actions.toast('⏱ EA tidak merespons (timeout 15s)');
          return 'timeout';
        }
        actions.toast('⚠ Command gagal — ' + e.message);
        return 'error';
      }
    },
  };

  // Computed helpers
  const activeState   = state.activePair ? state.states[state.activePair]    : null;
  const activeHistory = state.activePair ? (state.histories[state.activePair] || []) : [];
  const activeEq      = state.activePair ? (state.eqHistories[state.activePair] || []) : [];

  return (
    <AppCtx.Provider value={{ state, activeState, activeHistory, activeEq, actions }}>
      {children}
    </AppCtx.Provider>
  );
}

// ── Optimistic patch mapper ──────────────────────────────────────────
function getOptimisticPatch(action, param, value) {
  switch (action) {
    case 'pause':     return { isPaused: true };
    case 'resume':    return { isPaused: false };
    case 'trail_on':  return { trailOn: true };
    case 'trail_off': return { trailOn: false };
    case 'news_on':   return { newsFilterOn: true };
    case 'news_off':  return { newsFilterOn: false };
    case 'set_param': {
      const map = {
        risk: 'riskPercent', tp: 'tpPoints', sl: 'slPoints',
        tsl: 'tslPoints', tsltrig: 'tslTrigger', orderdist: 'orderDist',
        barsn: 'barsN', starthour: 'startHour', endhour: 'endHour',
        stopbefore: 'stopBeforeMin', startafter: 'startAfterMin',
        currencies: 'keyCurrencies',
      };
      const key = map[param];
      if (!key) return {};
      const v = param === 'currencies' ? value : parseFloat(value);
      return { [key]: v };
    }
    default: return {};
  }
}
