/**
 * Shared navigation item definitions used by Sidebar, AppShell (mobile sidebar), and MobileNav.
 * Single source of truth — never duplicate nav items elsewhere.
 */
import { Home, PlusCircle, QuestionMarkCircle, RectangleStack, DocumentText, Tag } from './NavIcons';

export interface NavItem {
  label: string;
  path: string;
  Icon: () => React.JSX.Element;
  adminOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      path: '/',                 Icon: Home,               adminOnly: false },
  { label: 'New Submission', path: '/submissions/new',  Icon: PlusCircle,         adminOnly: false },
  { label: 'Questions',      path: '/admin/questions',  Icon: QuestionMarkCircle, adminOnly: true  },
  { label: 'Sections',       path: '/admin/sections',   Icon: RectangleStack,     adminOnly: true  },
  { label: 'Forms',          path: '/admin/forms',      Icon: DocumentText,       adminOnly: true  },
  { label: 'Categories',     path: '/admin/categories', Icon: Tag,                adminOnly: true  },
];

/** Subset shown in mobile bottom nav. */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  path: '/',                 Icon: Home,         adminOnly: false },
  { label: 'New Form',   path: '/submissions/new',  Icon: PlusCircle,   adminOnly: false },
  { label: 'Admin',      path: '/admin/questions',  Icon: DocumentText, adminOnly: true  },
];
