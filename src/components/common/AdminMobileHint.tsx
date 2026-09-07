/**
 * AdminMobileHint — shown only on small screens inside admin pages.
 * Admin pages are optimized for desktop; this nudges mobile users.
 */
export function AdminMobileHint() {
  return (
    <div
      className="mb-4 flex items-start gap-3 px-4 py-3 rounded-lg border border-[#E6BC00] bg-[#FFF7D8] text-sm sm:hidden"
      role="status"
    >
      <span className="text-[#E6BC00] shrink-0 mt-0.5" aria-hidden="true">⚠</span>
      <span style={{ color: '#584921' }}>
        Admin pages are best viewed on a larger screen. Some features may be limited on mobile.
      </span>
    </div>
  );
}
