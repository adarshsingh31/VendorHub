/**
 * SellerApplicationCard — single row in the Seller Applications table.
 *
 * Props: { id, name, email, city, date, status, initials, color, textColor, onApprove, onReject }
 */
export default function SellerApplicationCard({ name, email, city, date, status, initials, color, textColor, onApprove, onReject }) {
  return (
    <tr className="border-b border-on-surface/5 hover:bg-surface-container-low transition-colors group">
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
            style={{ backgroundColor: color, color: textColor }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{name}</p>
            <p className="text-xs text-on-surface-variant">{email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-sm text-on-surface-variant hidden sm:table-cell">{city}</td>
      <td className="py-3 px-2 text-sm text-on-surface-variant hidden md:table-cell">{date}</td>
      <td className="py-3 px-2">
        <span className="bg-tertiary-fixed-dim/20 text-tertiary-container text-xs px-3 py-1 rounded-full border border-tertiary-fixed-dim/30">
          {status}
        </span>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onApprove}
            className="w-8 h-8 rounded border border-surface-tint text-surface-tint hover:bg-surface-tint hover:text-white transition-colors flex items-center justify-center"
            title="Approve"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
          <button
            onClick={onReject}
            className="w-8 h-8 rounded border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center"
            title="Reject"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
