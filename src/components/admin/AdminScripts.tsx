'use client';

import Script from 'next/script';

export default function AdminScripts() {
  return (
    <>
      <Script src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/admin-upload.js" strategy="afterInteractive" />
    </>
  );
}
