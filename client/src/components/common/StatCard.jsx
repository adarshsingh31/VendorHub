/**
 * StatCard — reusable KPI card used across Admin, Seller, and Buyer dashboards.
 *
 * Props:
 *   icon       — Material Symbols icon name string
 *   label      — display label (e.g. "Total Users")
 *   value      — display value (e.g. "1,250")
 *   trend      — optional string (e.g. "12.5% from last month")
 *   trendUp    — boolean; true = green arrow up, false = red arrow down
 *   iconBg     — tailwind bg class for icon circle (e.g. "bg-primary/10")
 *   iconColor  — tailwind text class (e.g. "text-primary")
 *   fillIcon   — boolean; whether icon uses FILL=1
 *   className  — extra classes for the card wrapper
 */
export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp = true,
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
  fillIcon = true,
  className = '',
}) {
  return (
    <div className={`paper-card rounded-xl p-4 flex items-center gap-4 ${className}`}>
      <div className={`w-12 h-12 rounded-full ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <span
          className="material-symbols-outlined text-2xl"
          style={fillIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant truncate">{label}</p>
        <p className="text-xl font-bold text-on-surface leading-tight">{value}</p>
        {trend && (
          <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${trendUp ? 'text-surface-tint' : 'text-error'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {trendUp ? 'arrow_upward' : 'arrow_downward'}
            </span>
            <span>{trend}</span>
          </p>
        )}
      </div>
    </div>
  );
}
