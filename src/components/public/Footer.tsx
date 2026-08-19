'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function Footer() {
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  async function handleNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/forms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(data.message || 'Subscribed!');
        form.reset();
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.message || 'Subscription failed.');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('Subscription failed. Please try again.');
    }
  }

  return (
    <footer id="footer" className="footer dark-background">
      <div className="container">
        <div className="row gy-5">
          <div className="col-lg-4">
            <div className="footer-content">
              <Link href="/" className="logo d-flex align-items-center mb-4">
                <span className="sitename">CrossLife Mission Network</span>
              </Link>
              <p className="mb-4">
                A non-denominational and inter-denominational Christian ministry in Dar es Salaam,
                Tanzania. We exist to manifest Sons of God who understand their identity in Christ
                and what Christ can accomplish through them.
              </p>

              <div className="newsletter-form">
                <h5>
                  <i className="bi bi-envelope-heart"></i> Stay Updated
                </h5>
                <p className="newsletter-hint">
                  Get devotionals, event updates and news from CrossLife straight to your inbox.
                </p>
                <form className="newsletter-form-submit" onSubmit={handleNewsletter}>
                  <label htmlFor="newsletter-email" className="newsletter-label">
                    Email Address
                  </label>
                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      id="newsletter-email"
                      className="form-control"
                      placeholder="yourname@example.com"
                      required
                      autoComplete="email"
                    />
                    <button type="submit" className="btn-subscribe" aria-label="Subscribe">
                      Subscribe <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                  {newsletterStatus === 'loading' && (
                    <div className="loading" style={{ display: 'block' }}>
                      Subscribing...
                    </div>
                  )}
                  {newsletterStatus === 'error' && (
                    <div className="error-message" style={{ display: 'block' }}>
                      {newsletterMessage}
                    </div>
                  )}
                  {newsletterStatus === 'success' && (
                    <div className="sent-message" style={{ display: 'block' }}>
                      {newsletterMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-2 col-6">
            <div className="footer-links">
              <h4>Ministry</h4>
              <ul>
                <li>
                  <Link href="/#about">
                    <i className="bi bi-chevron-right"></i> About Us
                  </Link>
                </li>
                <li>
                  <Link href="/#statement-of-faith">
                    <i className="bi bi-chevron-right"></i> Statement of Faith
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <i className="bi bi-chevron-right"></i> Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-lg-2 col-6">
            <div className="footer-links">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="https://www.youtube.com/@CrossLifeTV" target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-chevron-right"></i> CrossLife TV
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@PastorLenhardKyamba" target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-chevron-right"></i> Pastor Lenhard Kyamba
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="footer-contact">
              <h4>Get in Touch</h4>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <div className="contact-info">
                  <p>
                    Dar es Salaam
                    <br />
                    Tanzania
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="bi bi-telephone"></i>
                </div>
                <div className="contact-info">
                  <p>
                    +255 (0)6 531 265 83
                    <br />
                    +255 (0)7 100 738 60
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="bi bi-envelope"></i>
                </div>
                <div className="contact-info">
                  <p>
                    karibu@crosslife.org
                    <br />
                    lenhard.kyamba@crosslife.org
                  </p>
                </div>
              </div>
              <div className="social-links">
                <a href="https://www.facebook.com/crosslife_tz" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="https://www.instagram.com/crosslife_tz" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="https://www.youtube.com/@CrossLifeTV" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-youtube"></i>
                </a>
                <a href="https://t.me/PastorLenhardKyamba" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-telegram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="copyright">
                <p>
                  © <span>Copyright</span>{' '}
                  <strong className="px-1 sitename">CrossLife Mission Network</strong>{' '}
                  <span>All Rights Reserved</span>
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="footer-bottom-links">
                <Link href="/student/login?mode=admin">
                  <i className="bi bi-shield-lock me-1"></i>Admin
                </Link>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
