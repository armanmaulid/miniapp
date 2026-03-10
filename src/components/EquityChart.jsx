import { AreaChart, Area, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card2)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '4px 8px', fontSize: 10,
      fontFamily: 'var(--font-mono)', color: 'var(--green)'
    }}>
      ${parseFloat(payload[0].value).toFixed(2)}
    </div>
  );
};

export default function EquityChart({ data = [], balance = null }) {
  const hasReal = data.length >= 2;

  // ── Fallback: hanya 1 titik dari balance ─────────────────────────
  // Tampilkan flat line di balance saat equity history belum tersedia
  let chartData;
  if (hasReal) {
    chartData = data.map(p => ({ t: p.t, v: p.v }));
  } else if (balance != null) {
    // Buat 2 titik supaya recharts bisa render line
    const now = Math.floor(Date.now() / 1000);
    chartData = [
      { t: now - 60, v: balance },
      { t: now,      v: balance },
    ];
  } else {
    // Benar-benar tidak ada data sama sekali (EA belum pernah push)
    return (
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)', fontSize: 11
      }}>
        Menunggu data equity…
      </div>
    );
  }

  const values = chartData.map(p => p.v);
  const minV   = Math.min(...values);
  const maxV   = Math.max(...values);
  const trend  = values[values.length - 1] >= values[0];
  const color  = trend ? '#00e87a' : '#ff4646';

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {!hasReal && (
          <ReferenceLine y={balance} stroke="var(--muted)" strokeDasharray="3 3" />
        )}
        <Area
          type="monotone" dataKey="v"
          stroke={color} strokeWidth={1.5}
          fill="url(#eqGrad)" dot={false}
          activeDot={{ r: 3, fill: color, stroke: 'none' }}
        />
        <Tooltip content={<CustomTooltip />} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
