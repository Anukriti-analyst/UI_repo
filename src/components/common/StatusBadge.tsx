import type { SubmissionStatus } from '@/api/types/submission.types';

interface StatusBadgeProps {
  status: SubmissionStatus;
}

const statusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  Draft:     { label: 'Draft',     className: 'fm-badge fm-badge-draft' },
  Submitted: { label: 'Submitted', className: 'fm-badge fm-badge-submit' },
  Cancelled: { label: 'Cancelled', className: 'fm-badge fm-badge-cancel' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusConfig[status] ?? {
    label: status,
    className: 'fm-badge fm-badge-draft',
  };
  return <span className={className}>{label}</span>;
}

/* Generic active/inactive badge used in admin lists */
export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return isActive
    ? <span className="fm-badge fm-badge-active">Active</span>
    : <span className="fm-badge fm-badge-cancel">Inactive</span>;
}
