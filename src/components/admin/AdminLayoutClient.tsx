'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  canAccessDiscipleship,
  canAccessGeneral,
  getAdminRole,
  isSuperAdmin,
} from '@/lib/auth/admin';
import type { SessionData } from '@/lib/auth/session';

type NavItem = { href: string; label: string; icon: string; match?: string };

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="menu-group" data-menu-group={title.toLowerCase()}>
      <button type="button" className="menu-group-toggle" aria-expanded="true">
        <span>{title}</span>
        <i className="bi bi-chevron-down"></i>
      </button>
      <div className="menu-group-items">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`menu-item ${
              (item.match === '/admin' ? pathname === '/admin' : pathname.startsWith(item.match || item.href))
                ? 'active'
                : ''
            }`}
            title={item.label}
          >
            <i className={`bi bi-${item.icon}`}></i>
            <span className="menu-item-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AdminLayoutClient({
  session,
  children,
}: {
  session: SessionData;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = getAdminRole(session);
  const general = canAccessGeneral(session);
  const discipleship = canAccessDiscipleship(session);

  useEffect(() => {
    document.body.classList.add('cl-admin');
    return () => document.body.classList.remove('cl-admin');
  }, []);

  const contentNav: NavItem[] = general
    ? [
        { href: '/admin/sermons', label: 'Sermons', icon: 'play-circle', match: '/admin/sermons' },
        { href: '/admin/events', label: 'Events', icon: 'calendar-event', match: '/admin/events' },
        { href: '/admin/ministries', label: 'Ministries', icon: 'building', match: '/admin/ministries' },
        { href: '/admin/gallery', label: 'Gallery Albums', icon: 'images', match: '/admin/gallery' },
        { href: '/admin/leadership', label: 'Leadership', icon: 'people', match: '/admin/leadership' },
      ]
    : [];

  const discipleshipNav: NavItem[] = discipleship
    ? [
        { href: '/admin/discipleship', label: 'Programs & Modules', icon: 'mortarboard', match: '/admin/discipleship' },
        { href: '/admin/students', label: 'Students', icon: 'person-video3', match: '/admin/students' },
      ]
    : [];

  const commsNav: NavItem[] = general
    ? [
        { href: '/admin/contacts', label: 'Contact Inquiries', icon: 'envelope', match: '/admin/contacts' },
        { href: '/admin/prayer-requests', label: 'Prayer Requests', icon: 'heart', match: '/admin/prayer-requests' },
        { href: '/admin/feedback', label: 'Feedback', icon: 'chat-left-text', match: '/admin/feedback' },
        { href: '/admin/newsletter', label: 'Newsletter', icon: 'envelope-paper-heart', match: '/admin/newsletter' },
      ]
    : [];

  const systemNav: NavItem[] = [
    ...(general ? [{ href: '/admin/users', label: 'Users', icon: 'people-fill', match: '/admin/users' }] : []),
    ...(isSuperAdmin(session) ? [{ href: '/admin/settings', label: 'Settings', icon: 'gear', match: '/admin/settings' }] : []),
  ];

  return (
    <div className="admin-wrapper">
      <div
        className={`admin-sidebar-overlay${sidebarOpen ? ' show' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside className={`admin-sidebar${sidebarOpen ? ' show' : ''}`} id="adminSidebar">
        <button
          type="button"
          className="admin-sidebar-close d-lg-none"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-brand">
            <img src="/assets/img/logo.png" alt="CrossLife" />
            <div className="sidebar-brand-text">
              <p className="sidebar-brand-title">Cross Admin</p>
              <span className="sidebar-brand-sub">Mission Network</span>
            </div>
          </Link>
          <div className="sidebar-header-actions">
            <a href="/" target="_blank" rel="noopener" className="sidebar-view-site" title="View public site">
              <i className="bi bi-box-arrow-up-right"></i>
              <span>View site</span>
            </a>
          </div>
        </div>
        <nav className="sidebar-menu">
          <NavGroup
            title="Main"
            pathname={pathname}
            items={[{ href: '/admin', label: 'Dashboard', icon: 'speedometer2', match: '/admin' }]}
          />
          <NavGroup title="Content" pathname={pathname} items={contentNav} />
          <NavGroup title="Discipleship" pathname={pathname} items={discipleshipNav} />
          <NavGroup title="Communications" pathname={pathname} items={commsNav} />
          <NavGroup title="System" pathname={pathname} items={systemNav} />
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
          <div className="admin-user">
            <div className="admin-user-info d-none d-md-block">
              <div className="admin-user-badge">
                <span className="badge badge-admin">ADMIN</span>
                <span className="admin-user-name">{session.adminName || session.adminUsername}</span>
              </div>
              <div className="admin-user-role">{role?.replace('_', ' ')}</div>
            </div>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-logout">
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-sm-inline">Logout</span>
              </button>
            </form>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
