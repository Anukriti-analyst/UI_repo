/**
 * PrimaryButton — reusable action button used across admin modals and forms.
 * Extracted to eliminate duplication across ManageQuestions, ManageSections,
 * ManageForms, FormBuilder, ManageCategories.
 */

interface PrimaryButtonProps {
  onClick: () => void;
  loading: boolean;
  label: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function PrimaryButton({ onClick, loading, label, disabled, type = 'button' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="fm-btn-primary"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving…
        </span>
      ) : (
        label
      )}
    </button>
  );
}
