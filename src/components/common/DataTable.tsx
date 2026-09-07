import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  /** Hide on screens narrower than md breakpoint */
  hideOnMobile?: boolean;
  width?: string;
  /** Enable client-side sorting on this column */
  sortable?: boolean;
  /** Custom value extractor for sorting; defaults to row[key] */
  sortValue?: (row: T) => string | number | null | undefined;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  /** Field used as React key — must be unique per row */
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  /** Render an expanded row panel below a given row. Return null to not render. */
  renderExpandedRow?: (row: T) => ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

/* Small sort indicator icon shown in sortable column headers */
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || dir === null) {
    return <ChevronsUpDown size={12} aria-hidden="true" className="ml-1 inline opacity-30 shrink-0" />;
  }
  return dir === 'asc'
    ? <ChevronUp size={12} aria-hidden="true" className="ml-1 inline text-[#0073E6] shrink-0" />
    : <ChevronDown size={12} aria-hidden="true" className="ml-1 inline text-[#0073E6] shrink-0" />;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  onRowClick,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  renderExpandedRow,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      // New column → start with ascending
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      // Third click → reset to no sort
      setSortKey(null);
      setSortDir(null);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    return [...data].sort((a, b) => {
      const va = col?.sortValue
        ? col.sortValue(a)
        : (a as Record<string, unknown>)[sortKey];
      const vb = col?.sortValue
        ? col.sortValue(b)
        : (b as Record<string, unknown>)[sortKey];
      const dir = sortDir === 'asc' ? 1 : -1;
      if (va == null && vb == null) return 0;
      if (va == null) return dir;
      if (vb == null) return -dir;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' }) * dir;
    });
  }, [data, sortKey, sortDir, columns]);

  if (isLoading) return <LoadingSpinner />;

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="fm-table-wrapper">
      <table className="fm-table" role="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'fm-table-th',
                  col.hideOnMobile ? 'hidden md:table-cell' : '',
                  col.sortable ? 'cursor-pointer select-none hover:bg-[#F2F2F5] transition-colors' : '',
                ].join(' ')}
                style={col.width ? { width: col.width } : undefined}
                scope="col"
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={
                  col.sortable && sortKey === col.key && sortDir
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
              >
                <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                  {col.header}
                  {col.sortable && (
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const expandedContent = renderExpandedRow?.(row);
            return (
              <Fragment key={String(row[keyField])}>
                <tr
                  className={`fm-table-row ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(row)}
                  role={onRowClick ? 'button' : 'row'}
                  aria-label={onRowClick ? `View details` : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`fm-table-td ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
                {expandedContent && (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      {expandedContent}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
