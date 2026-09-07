/**
 * TopBar — FM-branded application header.
 * Shows app name, hamburger (mobile only), and user avatar/initials.
 */
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { Menu } from './NavIcons';

export function TopBar() {
  const { user, isAdmin, logout } = useAuth();
  const { toggleSidebar, sidebarOpen } = useLayout();

  /* Derive initials from display name */
  const initials = (user?.displayName ?? '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <header
      className={[
        'fixed top-0 right-0 left-0 z-40 h-16',
        'flex items-center px-4 gap-3',
        'bg-white border-b border-[#E0E0E5]',
      ].join(' ')}
      role="banner"
    >
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={sidebarOpen}
        aria-controls="mobile-sidebar"
        className={[
          'flex items-center justify-center w-9 h-9 rounded-lg',
          'text-[#383B54] hover:bg-[#F2F2F5]',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
          'lg:hidden',
        ].join(' ')}
      >
        <Menu />
      </button>

      {/* App title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md shrink-0 lg:hidden"
          style={{ backgroundColor: 'var(--color-fm-navy)' }}
          aria-hidden="true"
        >
          <span className="text-white text-[10px] font-bold select-none">FM</span>
        </div>
        <span
          className="text-base font-semibold truncate"
          style={{ color: 'var(--color-fm-navy)' }}
        >
          FM Essentials
        </span>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role badge */}
        <span
          className={[
            'hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
            isAdmin
              ? 'bg-[#EFF6FE] text-[#0057CA]'
              : 'bg-[#F2F2F5] text-[#383B54]',
          ].join(' ')}
        >
          {isAdmin ? 'Admin' : 'General'}
        </span>

        {/* User email — hidden on mobile */}
        <span className="hidden md:block text-xs text-[#666666] truncate max-w-[160px]">
          {user?.email}
        </span>

        {/* Avatar circle */}
        <div
          className={[
            'flex items-center justify-center w-8 h-8 rounded-full',
            'text-white text-xs font-semibold select-none shrink-0',
          ].join(' ')}
          style={{ backgroundColor: 'var(--color-fm-navy)' }}
          title={user?.displayName}
          aria-label={`Logged in as ${user?.displayName}`}
        >
          {initials}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="text-xs text-[#666666] hover:text-[#DD2647] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] rounded px-2 py-1"
          aria-label="Sign out"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
