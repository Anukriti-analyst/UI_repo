/**
 * EmailSubmissionModal — modal for emailing a submission.
 * Optional email field; if blank the server emails the logged-in user.
 */
import { useState } from 'react';
import { useEmailSubmission } from '@/hooks/useSubmissions';
import { useNotification }    from '@/context/NotificationContext';
import { FormModal }           from '@/components/common/FormModal';

interface EmailSubmissionModalProps {
  submissionId: string;
  onClose: () => void;
}

export function EmailSubmissionModal({ submissionId, onClose }: EmailSubmissionModalProps) {
  const [toEmail, setToEmail] = useState('');
  const { mutate, isPending }  = useEmailSubmission(submissionId);
  const { showToast }          = useNotification();

  const handleSend = () => {
    mutate(
      { toEmail: toEmail.trim() || undefined },
      {
        onSuccess: () => {
          showToast('success', 'Submission emailed successfully.');
          onClose();
        },
        onError: () => {
          showToast('error', 'Failed to send email. Please try again.');
        },
      },
    );
  };

  return (
    <FormModal
      title="Email Submission"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={[
              'px-4 py-2 text-sm font-medium rounded-lg border border-[#E0E0E5]',
              'text-[#383B54] hover:bg-[#F2F2F5]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isPending}
            className={[
              'px-4 py-2 text-sm font-medium rounded-lg',
              'bg-[#383B54] text-white',
              'hover:bg-[#0D102B]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2',
            ].join(' ')}
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              'Send Email'
            )}
          </button>
        </>
      }
    >
      <div className="fm-field">
        <label htmlFor="email-to" className="fm-label">
          Recipient Email
          <span className="fm-helper-text ml-1 font-normal">(optional — defaults to your email)</span>
        </label>
        <input
          id="email-to"
          type="email"
          value={toEmail}
          onChange={e => setToEmail(e.target.value)}
          placeholder="e.g. colleague@fm.com"
          autoFocus
          className={[
            'w-full px-3 py-2 text-sm rounded-lg border border-[#E0E0E5]',
            'focus:outline-none focus:ring-2 focus:ring-[#0073E6] focus:border-transparent',
            'placeholder:text-[#666666]',
          ].join(' ')}
        />
        <p className="fm-helper-text">
          Leave blank to send to your registered email address.
        </p>
      </div>
    </FormModal>
  );
}
