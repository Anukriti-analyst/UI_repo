interface SkeletonLoaderProps {
  rows?: number;
  cols?: number;
  /** Render as a block (e.g. card) instead of table rows */
  block?: boolean;
  label?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="fm-table-td">
          <div className="fm-skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonLoader({ rows = 5, cols = 4, block = false, label = 'Loading content…' }: SkeletonLoaderProps) {
  if (block) {
    return (
      <div className="fm-section-gap" role="status" aria-label={label} aria-busy="true">
        <span className="sr-only">{label}</span>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="fm-card fm-card-body space-y-3" aria-hidden="true">
            <div className="fm-skeleton h-5 w-2/3" />
            <div className="fm-skeleton h-4 w-full" />
            <div className="fm-skeleton h-4 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fm-table-wrapper" role="status" aria-label={label} aria-busy="true">
      <span className="sr-only">{label}</span>
      <table className="fm-table" aria-hidden="true">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
