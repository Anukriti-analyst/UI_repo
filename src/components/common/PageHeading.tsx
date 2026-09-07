import type { ReactNode } from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeading({ title, subtitle, actions }: PageHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="fm-page-title break-words">{title}</h1>
        {subtitle && <p className="fm-page-subtitle break-words">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-start">{actions}</div>
      )}
    </div>
  );
}
