import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--card2)',border:'1px solid var(--border)',
                  borderRadius:6,padding:'4px 8px',fontSize:10,
                  fontFamily:'var(--font-mono)',color:'var(--green)' }}>
      ${parseFloat(payload[0].value).toFixed(2)}
    </div>
  );
};

export default function EquityChart({ data = [] }) {
  // data = [{ t, v }, ...]
  const chartData = data.length > 0
    ? data.map(p => ({ t: p.t, v: p.v }))
    : generateDemoData(60);

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={chartData} margin={{ top:4, right:2, bottom:0, left:2 }}>
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00e87a" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00e87a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v"
              stroke="#00e87a" strokeWidth={1.5}
              fill="url(#eqGrad)" dot={false}
              activeDot={{ r:3, fill:'#00e87a', stroke:'none' }} />
        <Tooltip content={<CustomTooltip />} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function generateDemoData(n) {
  let v = 0;
  const now = Math.floor(Date.now()/1000);
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.44) * 0.08;
    return { t: now - (n - i) * 300, v: parseFloat(v.toFixed(4)) };
  });
}
