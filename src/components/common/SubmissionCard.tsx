/**
 * SubmissionCard — used on mobile/tablet instead of table rows.
 * Shows one submission summary in a card format.
 */
import { useNavigate } from 'react-router-dom';

import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate }   from '@/utils/formatDate';
import type { SubmissionSummaryDto } from '@/api/types/submission.types';

interface SubmissionCardProps {
  submission: SubmissionSummaryDto;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(
        submission.status === 'Draft'
          ? `/submissions/${submission.submissionId}/edit`
          : `/submissions/${submission.submissionId}`
      )}
      aria-label={`View submission for ${submission.formName}`}
      className={[
        'w-full text-left fm-card p-4 rounded-lg',
        'flex flex-col gap-2',
        'transition-all duration-150',
        'hover:shadow-md hover:border-[#0073E6]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
      ].join(' ')}
    >
      {/* Top row: submission name + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-semibold text-sm leading-tight block" style={{ color: 'var(--color-fm-navy)' }}>
            {submission.submissionName ?? submission.formName}
          </span>
          <span className="text-xs leading-tight" style={{ color: 'var(--color-fm-muted)' }}>
            {submission.formName}
          </span>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--color-fm-muted)' }}>
        <span>🌏 {submission.territoryName}</span>
        <span>v{submission.versionNumber}</span>
        {submission.referenceNumber && (
          <span className="font-mono">#{submission.referenceNumber}</span>
        )}
      </div>

      {/* Date */}
      <div className="text-xs" style={{ color: 'var(--color-fm-muted)' }}>
        {submission.status === 'Submitted'
          ? `Submitted ${formatDate(submission.submittedAt)}`
          : `Created ${formatDate(submission.createdAt)}`}
      </div>
    </button>
  );
}
