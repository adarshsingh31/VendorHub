/**
 * SalesChart — mock SVG chart for Seller Dashboard sales overview.
 * Replace with a real charting library (Recharts / Chart.js) when ready.
 */
export default function SalesChart() {
  const dataPoints = [
    { x: 0, y: 80 }, { x: 15, y: 60 }, { x: 30, y: 50 },
    { x: 45, y: 70 }, { x: 60, y: 40 }, { x: 75, y: 30 },
    { x: 90, y: 50 }, { x: 100, y: 20 },
  ];
  const pointsStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex-1 w-full bg-surface-container-low rounded-lg border border-surface-variant relative min-h-[220px]">
      <div className="absolute inset-0 p-4">
        <div className="h-full w-full border-l border-b border-outline-variant relative">
          {/* Grid lines */}
          <div className="absolute top-1/4 w-full border-b border-outline-variant/30" />
          <div className="absolute top-2/4 w-full border-b border-outline-variant/30" />
          <div className="absolute top-3/4 w-full border-b border-outline-variant/30" />
          {/* Line */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#004349" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#004349" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#salesGradient)"
              points={`${pointsStr} 100,100 0,100`}
            />
            <polyline
              fill="none"
              points={pointsStr}
              stroke="#004349"
              strokeWidth="2"
            />
            {dataPoints.slice(1, -1).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" fill="#004349" />
            ))}
          </svg>
          {/* X-axis labels */}
          <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] text-on-surface-variant/70">
            {['W1','W2','W3','W4'].map(w => <span key={w}>{w}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
