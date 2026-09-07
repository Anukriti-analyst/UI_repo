import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { NAV_ITEMS, type NavItem } from './navItems';

export function Sidebar() {
  const { isAdmin } = useAuth();
  const { sidebarOpen, toggleSidebar } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  /* Determine if this path is active */
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  /* Separate general and admin groups */
  const generalItems = visibleItems.filter(i => !i.adminOnly);
  const adminItems   = visibleItems.filter(i => i.adminOnly);

  return (
    <>
      {/* Sidebar container */}
      <aside
        aria-label="Main navigation"
        className={[
          'fixed inset-y-0 left-0 z-30 flex flex-col',
          'bg-white border-r border-[#E0E0E5]',
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-56' : 'w-16',
          /* On mobile, sidebar slides off-screen — MobileNav is used instead */
          'hidden lg:flex',
        ].join(' ')}
      >
        {/* Logo / Brand area */}
        <div
          className={[
            'flex items-center border-b border-[#E0E0E5] shrink-0',
            sidebarOpen ? 'h-16 px-4 gap-3' : 'h-16 justify-center',
          ].join(' ')}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ backgroundColor: 'var(--color-fm-navy)' }}
          >
            <span className="text-white text-xs font-bold select-none">FM</span>
          </div>
          {sidebarOpen && (
            <span
              className="font-semibold text-sm leading-tight truncate"
              style={{ color: 'var(--color-fm-navy)' }}
            >
              FM Essentials
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
          {generalItems.map(item => (
            <NavButton
              key={item.path}
              item={item}
              active={isActive(item.path)}
              collapsed={!sidebarOpen}
              onClick={() => navigate(item.path)}
            />
          ))}

          {/* Admin section divider */}
          {adminItems.length > 0 && (
            <>
              <div
                className={[
                  'my-2 border-t border-[#E0E0E5]',
                  !sidebarOpen && 'mx-auto w-6',
                ].join(' ')}
              />
              {sidebarOpen && (
                <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#666666] mb-1 select-none">
                  Admin
                </span>
              )}
              {adminItems.map(item => (
                <NavButton
                  key={item.path}
                  item={item}
                  active={isActive(item.path)}
                  collapsed={!sidebarOpen}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className={[
            'flex items-center shrink-0 border-t border-[#E0E0E5] h-12',
            'text-[#666666] hover:text-[#383B54] hover:bg-[#F2F2F5]',
            'transition-colors duration-150 focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#0073E6]',
            sidebarOpen ? 'px-4 gap-2' : 'justify-center',
          ].join(' ')}
        >
          <CollapseIcon flipped={!sidebarOpen} />
          {sidebarOpen && <span className="text-xs">Collapse</span>}
        </button>
      </aside>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function NavButton({ item, active, collapsed, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex items-center rounded-lg transition-all duration-150',
        'min-h-[44px] w-full text-sm font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
        collapsed ? 'justify-center px-0' : 'gap-3 px-3',
        active
          ? 'bg-[#EFF6FE] text-[#0057CA]'
          : 'text-[#383B54] hover:bg-[#F2F2F5] hover:text-[#0D102B]',
      ].join(' ')}
    >
      <span
        className={[
          'shrink-0',
          active ? 'text-[#0073E6]' : 'text-current',
        ].join(' ')}
        aria-hidden="true"
      >
        <item.Icon />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {active && !collapsed && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: '#0073E6' }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function CollapseIcon({ flipped }: { flipped: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={['w-4 h-4 transition-transform duration-300', flipped && 'rotate-180'].join(' ')}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

