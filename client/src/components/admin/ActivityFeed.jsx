/**
 * ActivityFeed — vertical timeline of recent platform activities.
 *
 * Props:
 *   activities — array of { id, text, meta, time, icon, iconBg, iconColor }
 */
export default function ActivityFeed({ activities = [] }) {
  return (
    <div className="flex flex-col gap-6 relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-2 bottom-2 w-px bg-on-surface/5" />

      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 relative z-10">
          <div
            className="w-10 h-10 rounded-full border-4 border-[#FFFBF2] flex items-center justify-center shrink-0"
            style={{ backgroundColor: activity.iconBg, color: activity.iconColor }}
          >
            <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
          </div>
          <div className="flex-1 pt-1">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm text-on-surface">{activity.text}</p>
              <span className="text-xs text-on-surface-variant shrink-0">{activity.time}</span>
            </div>
            {activity.meta && (
              <p className="text-xs text-on-surface-variant mt-1">{activity.meta}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
