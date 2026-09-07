/**
 * LayoutContext — shares sidebar collapse state across layout components.
 * Consumed by AppShell, Sidebar, TopBar, and MobileNav.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface LayoutContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar: () => setSidebarOpen(p => !p),
        closeSidebar:  () => setSidebarOpen(false),
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within <LayoutProvider>');
  return ctx;
}
