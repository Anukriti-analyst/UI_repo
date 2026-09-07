/**
 * AppShell — Root layout component that persists across all routes.
 *
 * Structure:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  TopBar (fixed, h-16)                               │
 *   ├──────────┬──────────────────────────────────────────┤
 *   │ Sidebar  │  <main>  children  </main>               │
 *   │ (fixed)  │  (scrollable, padded from sidebar+top)   │
 *   └──────────┴──────────────────────────────────────────┘
 *   Mobile: sidebar hidden → bottom MobileNav shows instead
 */
import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { LayoutProvider, useLayout } from '@/context/LayoutContext';
import { TopBar }    from './TopBar';
import { Sidebar }   from './Sidebar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '@/components/common/ToastContainer';

interface AppShellProps {
  children: ReactNode;
}

/** Inner shell that can consume LayoutContext. */
function ShellInner({ children }: AppShellProps) {
  const { sidebarOpen, closeSidebar } = useLayout();
  const location = useLocation();

  /* Close mobile overlay on navigation */
  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-fm-surface)' }}
    >
      {/* ── Skip-to-content link (WCAG 2.4.1) ──────────────────── */}
      <a
        href="#main-content"
        className={[
          'absolute left-4 top-4 z-[9999] px-4 py-2 rounded-lg text-sm font-medium',
          'bg-[#0073E6] text-white shadow-lg',
          'opacity-0 focus:opacity-100 pointer-events-none focus:pointer-events-auto',
          'transition-opacity duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
        ].join(' ')}
      >
        Skip to main content
      </a>

      {/* Fixed header */}
      <TopBar />

      {/* Sidebar (desktop/tablet — hidden on mobile) */}
      <Sidebar />

      {/* Mobile overlay — dims content when sidebar is open on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          aria-hidden="true"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar (shown over overlay) */}
      <aside
        aria-label="Mobile navigation panel"
        aria-hidden={!sidebarOpen}
        className={[
          'fixed inset-y-0 left-0 z-30 flex flex-col w-64',
          'bg-white border-r border-[#E0E0E5]',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:hidden',
        ].join(' ')}
      >
        {/* Mobile sidebar header */}
        <div
          className="flex items-center gap-3 h-16 px-4 border-b border-[#E0E0E5] shrink-0"
          style={{ backgroundColor: 'var(--color-fm-navy)' }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 shrink-0">
            <span className="text-white text-xs font-bold select-none">FM</span>
          </div>
          <span className="font-semibold text-sm text-white truncate">
            FM Essentials
          </span>
        </div>

        {/* Mobile nav items — same component, always "expanded" */}
        <MobileSidebarNav />
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        className={[
          /* Push down below fixed header */
          'pt-16',
          /* Push right on desktop when sidebar is present */
          'lg:transition-all lg:duration-300',
          sidebarOpen ? 'lg:pl-56' : 'lg:pl-16',
          /* Push up from mobile nav */
          'pb-16 lg:pb-0',
        ].join(' ')}
        tabIndex={-1}
      >
        <div className="fm-page">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <LayoutProvider>
      <ShellInner>{children}</ShellInner>
    </LayoutProvider>
  );
}

/* ─── Mobile sidebar inner nav (re-uses shared NAV_ITEMS) ──── */
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from './navItems';

function MobileSidebarNav() {
  const { isAdmin } = useAuth();
  const { closeSidebar } = useLayout();
  const navigate   = useNavigate();
  const location   = useRouterLocation();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const visible = NAV_ITEMS.filter(i => !i.adminOnly || isAdmin);
  const general = visible.filter(i => !i.adminOnly);
  const admin   = visible.filter(i => i.adminOnly);

  const go = (path: string) => { navigate(path); closeSidebar(); };

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
      {general.map(item => (
        <MobileNavBtn key={item.path} item={item} active={isActive(item.path)} onClick={() => go(item.path)} />
      ))}
      {admin.length > 0 && (
        <>
          <div className="my-2 border-t border-[#E0E0E5]" />
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#666666] mb-1 select-none">
            Admin
          </span>
          {admin.map(item => (
            <MobileNavBtn key={item.path} item={item} active={isActive(item.path)} onClick={() => go(item.path)} />
          ))}
        </>
      )}
    </nav>
  );
}

function MobileNavBtn({
  item,
  active,
  onClick,
}: {
  item: { label: string; Icon: () => React.JSX.Element };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex items-center gap-3 px-3 rounded-lg min-h-[44px] w-full text-sm font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
        'transition-colors duration-150',
        active
          ? 'bg-[#EFF6FE] text-[#0057CA]'
          : 'text-[#383B54] hover:bg-[#F2F2F5]',
      ].join(' ')}
    >
      <span className={active ? 'text-[#0073E6]' : 'text-current'} aria-hidden="true">
        <item.Icon />
      </span>
      <span className="truncate">{item.label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0073E6] shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}

