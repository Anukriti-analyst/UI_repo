/**
 * WizardProgress — chevron/arrow-style progress stepper.
 * Desktop: interlocking arrow tabs, each containing the step number and label.
 * Mobile: compact segmented bar + current step label.
 */

interface Step {
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

interface WizardProgressProps {
  steps: Step[];
  currentIndex: number;
}

const NOTCH = 22; // px — depth of the chevron notch/point

function getClipPath(i: number, total: number): string {
  if (i === 0) {
    // Flat left edge, pointed right
    return `polygon(0 0, calc(100% - ${NOTCH}px) 0, 100% 50%, calc(100% - ${NOTCH}px) 100%, 0 100%)`;
  }
  if (i === total - 1) {
    // Notched left, flat right edge
    return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${NOTCH}px 50%)`;
  }
  // Notched left, pointed right
  return `polygon(0 0, calc(100% - ${NOTCH}px) 0, 100% 50%, calc(100% - ${NOTCH}px) 100%, 0 100%, ${NOTCH}px 50%)`;
}

function getBg(step: Step): string {
  if (step.isActive)   return '#383B54'; // FM navy
  if (step.isComplete) return '#565A7E'; // lighter navy
  return '#E4E6F0';                       // pale lavender-gray
}

function getTextColor(step: Step): string {
  return step.isActive || step.isComplete ? '#FFFFFF' : '#868AAE';
}

export function WizardProgress({ steps, currentIndex }: WizardProgressProps) {
  const total = steps.length;

  return (
    <div className="mb-8" aria-label="Form progress">

      {/* ── Mobile: segmented bar + label ── */}
      <div className="flex sm:hidden flex-col gap-2">
        <p className="text-xs font-medium" style={{ color: 'var(--color-fm-muted)' }}>
          Step {currentIndex + 1} of {total}
        </p>
        <div
          className="flex gap-0.5 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={currentIndex + 1}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="h-2 flex-1 transition-all duration-300"
              style={{ backgroundColor: getBg(step) }}
              aria-label={`${step.label}: ${step.isComplete ? 'complete' : step.isActive ? 'current' : 'pending'}`}
            />
          ))}
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-fm-navy)' }}>
          {steps[currentIndex]?.label}
        </p>
      </div>

      {/* ── Desktop/tablet: chevron arrow stepper ── */}
      <div className="hidden sm:flex w-full overflow-x-auto rounded-sm" role="list">
        {steps.map((step, i) => (
          <div
            key={i}
            role="listitem"
            aria-current={step.isActive ? 'step' : undefined}
            title={step.label}
            style={{
              clipPath:        getClipPath(i, total),
              backgroundColor: getBg(step),
              marginLeft:      i === 0 ? 0 : `-${NOTCH}px`,
              zIndex:          step.isActive ? total + 2 : total - i,
              transition:      'background-color 0.3s ease',
              minWidth:        `${100 + NOTCH}px`,
            }}
            className="relative flex-1 h-14 flex items-center justify-center cursor-default select-none"
          >
            {/* Inner content — padded to stay clear of the notch/tip areas */}
            <div
              className="flex flex-col items-center justify-center text-center w-full"
              style={{
                paddingLeft:  i === 0              ? '14px' : `${NOTCH + 10}px`,
                paddingRight: i === total - 1      ? '14px' : `${NOTCH + 10}px`,
                color:        getTextColor(step),
              }}
            >
            {/* Section label only */}
              <span
                className="text-[11px] font-semibold leading-tight"
                style={{
                  display:            '-webkit-box',
                  WebkitLineClamp:    2,
                  WebkitBoxOrient:    'vertical',
                  overflow:           'hidden',
                }}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
