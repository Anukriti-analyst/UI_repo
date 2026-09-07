/**
 * MobileNav — fixed bottom navigation bar shown only on mobile (< lg).
 * Shows 3 key actions: Dashboard, New Submission, and (if admin) Admin toggle.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MOBILE_NAV_ITEMS } from './navItems';

export function MobileNav() {
  const { isAdmin } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const visibleItems = MOBILE_NAV_ITEMS.filter(i => !i.adminOnly || isAdmin);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      aria-label="Mobile navigation"
      className={[
        'fixed bottom-0 inset-x-0 z-40',
        'flex items-stretch bg-white border-t border-[#E0E0E5]',
        'lg:hidden',
        /* Safe-area inset for iOS */
        'pb-safe',
      ].join(' ')}
    >
      {visibleItems.map(item => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2',
              'text-xs font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0073E6]',
              active
                ? 'text-[#0073E6]'
                : 'text-[#666666] hover:text-[#383B54]',
            ].join(' ')}
          >
            <span
              className={[
                'p-1 rounded-lg transition-colors duration-150',
                active ? 'bg-[#EFF6FE]' : '',
              ].join(' ')}
              aria-hidden="true"
            >
              <item.Icon />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
