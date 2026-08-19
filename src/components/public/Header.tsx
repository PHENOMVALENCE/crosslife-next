'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', match: 'home' },
  { href: '/#about', label: 'About', match: 'about' },
  { href: '/#statement-of-faith', label: 'Statement of Faith', match: 'faith' },
  { href: '/leadership', label: 'Leadership', match: 'leadership' },
  { href: '/ministries', label: 'Ministries', match: 'ministries' },
  { href: '/sermons', label: 'Sermons', match: 'sermons' },
  { href: '/discipleship', label: 'Discipleship', match: 'discipleship' },
  { href: '/events', label: 'Events', match: 'events' },
  { href: '/contact', label: 'Contact', match: 'contact' },
  { href: '/gallery', label: 'Gallery', match: 'gallery' },
];

function isActive(pathname: string, item: (typeof navItems)[0]): boolean {
  if (item.match === 'home') return pathname === '/';
  return pathname.startsWith(`/${item.match}`) || pathname === item.href;
}

export default function Header() {
  const pathname = usePathname() || '/';

  return (
    <header id="header" className="header fixed-top">
      <div className="container-fluid container-xl position-relative">
        <div className="top-row d-flex align-items-center justify-content-between">
          <Link href="/" className="logo d-flex align-items-center">
            <img src="/assets/img/logo.png" alt="CrossLife Mission Network Logo" />
            <h1 className="sitename">CROSSLIFE</h1>
          </Link>
        </div>
      </div>

      <div className="nav-wrap">
        <div className="container d-flex justify-content-center position-relative">
          <nav id="navmenu" className="navmenu">
            <ul>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={isActive(pathname, item) ? 'active' : ''}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="nav-social-search">
                <div className="nav-icons">
                  <button
                    type="button"
                    className="btn-search"
                    data-bs-toggle="modal"
                    data-bs-target="#searchModal"
                    aria-label="Search"
                  >
                    <i className="bi bi-search"></i>
                  </button>
                  <a
                    href="https://www.facebook.com/crosslife_tz"
                    className="facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a
                    href="https://www.instagram.com/crosslife_tz"
                    className="instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a
                    href="https://www.youtube.com/@CrossLifeTV"
                    className="youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-youtube"></i>
                  </a>
                  <a
                    href="https://www.tiktok.com/@CrossLife"
                    className="tiktok"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-tiktok"></i>
                  </a>
                </div>
              </li>
            </ul>
          </nav>
          <i className="mobile-nav-toggle d-xxl-none bi bi-list"></i>
        </div>
      </div>
    </header>
  );
}
